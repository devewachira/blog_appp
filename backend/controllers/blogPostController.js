const prisma = require("../config/prisma");

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private (Admin only)
const createPost = async (req, res) => {
  try {
    const { title, content, coverImageUrl, tags, isDraft, generatedByAI } =
      req.body;

    const slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        coverImageUrl,
        tags: tags || [],
        authorId: req.user.id,
        isDraft: isDraft || false,
        generatedByAI: generatedByAI || false,
      },
    });

    res.status(201).json(newPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: err.message });
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
const updatePost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.authorId !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const updatedData = { ...req.body };
    if (updatedData.title) {
      updatedData.slug = updatedData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    // Filter out fields that shouldn't be updated directly or need manual handling
    delete updatedData.id;
    delete updatedData.authorId;

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updatedData,
    });
    res.json(updatedPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res) => {
 try {
    const id = parseInt(req.params.id);
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.authorId !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await prisma.blogPost.delete({ where: { id } });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
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
    const skip = (page - 1) * limit;

    // Determine filter for main posts response
    let filter = {};
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    // Fetch paginated posts
    const posts = await prisma.blogPost.findMany({
      where: filter,
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: skip,
      take: limit,
    });

    // Count totals for pagination and tab counts
    const [totalCount, allCount, publishedCount, draftCount] = await Promise.all([
      prisma.blogPost.count({ where: filter }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isDraft: false } }),
      prisma.blogPost.count({ where: { isDraft: true } }),
    ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get a single blog post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        }
      }
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get posts by tag
// @route   GET /api/posts/tag/:tag
// @access  Public
const getPostsByTag = async (req, res) => {
  try {
    // Prisma's Json filter for arrays in MySQL
    const posts = await prisma.blogPost.findMany({
      where: {
        isDraft: false,
        tags: {
          array_contains: req.params.tag
        }
      },
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        }
      }
    });
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Search posts by title or content
// @route   GET /api/posts/search?q=keyword
// @access  Public
const searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    const posts = await prisma.blogPost.findMany({
      where: {
        isDraft: false,
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        }
      }
    });
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Increment post view count
// @route   PUT /api/posts/:id/view
// @access  Public
const incrementView = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    res.json({ message: "View count incremented" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Public
const likePost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.blogPost.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });
    res.json({ message: "Like added" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get top trending posts
// @route   GET /api/posts/trending
// @access  Private
const getTopPosts = async (req, res) => {
  try {
    // Top performing posts
    const posts = await prisma.blogPost.findMany({
      where: { isDraft: false },
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
      ],
      take: 5
    });

    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
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
