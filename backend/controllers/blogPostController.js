const { BlogPost, User } = require("../models");
const { Op } = require("sequelize");

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private (Admin only)
const createPost = async (req, res) => {
  try {
    const { title, content, coverImageUrl, tags, isDraft, generatedByAI } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const newPost = await BlogPost.create({
      title,
      slug,
      content,
      coverImageUrl,
      tags: tags || [],
      authorId: req.user.id,
      isDraft: isDraft || false,
      generatedByAI: generatedByAI || false,
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post", error: err.message });
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
const updatePost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await BlogPost.findByPk(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.authorId !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const updatedData = { ...req.body };
    if (updatedData.title) {
      updatedData.slug = updatedData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    delete updatedData.id;
    delete updatedData.authorId;

    await post.update(updatedData);
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await BlogPost.findByPk(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.authorId !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.destroy();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get blog posts by status (all, published, or draft) and include counts
// @route   GET /api/posts?status=published|draft|all&page=1
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const status = req.query.status || "published";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    let where = {};
    if (status === "published") where.isDraft = false;
    else if (status === "draft") where.isDraft = true;

    const { count, rows: posts } = await BlogPost.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    const [allCount, publishedCount, draftCount] = await Promise.all([
      BlogPost.count(),
      BlogPost.count({ where: { isDraft: false } }),
      BlogPost.count({ where: { isDraft: true } }),
    ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get a single blog post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
      ],
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get posts by tag
// @route   GET /api/posts/tag/:tag
// @access  Public
const getPostsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const posts = await BlogPost.findAll({
      where: {
        isDraft: false,
        tags: {
          [Op.like]: `%${tag}%`,
        },
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
      ],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Search posts by title or content
// @route   GET /api/posts/search?q=keyword
// @access  Public
const searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    const posts = await BlogPost.findAll({
      where: {
        isDraft: false,
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
      ],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Increment post view count
// @route   PUT /api/posts/:id/view
// @access  Public
const incrementView = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await BlogPost.findByPk(id);
    if (post) {
      await post.increment("views");
    }
    res.json({ message: "View count incremented" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Public
const likePost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await BlogPost.findByPk(id);
    if (post) {
      await post.increment("likes");
    }
    res.json({ message: "Like added" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get top trending posts
// @route   GET /api/posts/trending
// @access  Private
const getTopPosts = async (req, res) => {
  try {
    const posts = await BlogPost.findAll({
      where: { isDraft: false },
      order: [
        ["views", "DESC"],
        ["likes", "DESC"],
      ],
      limit: 5,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  searchPosts,
  incrementView,
  likePost,
  getTopPosts,
};
