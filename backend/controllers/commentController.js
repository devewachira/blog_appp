const { Comment, User, BlogPost } = require("../models");

// @desc    Add a comment to a blog post
// @route   POST /api/comments/:postId
// @access  Private
const addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content, parentCommentId } = req.body;

    // Ensure blog post exists
    const post = await BlogPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      postId: postId,
      authorId: req.user.id,
      content,
      parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
    });

    // Fetch the comment again with author for the response
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
      ],
    });

    res.status(201).json(fullComment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

// @desc    Get all comments
// @route   GET /api/comments
// @access  Public
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
        {
          model: BlogPost,
          as: "post",
          attributes: ["title", "coverImageUrl"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const commentMap = {};
    comments.forEach((comment) => {
      const c = comment.toJSON();
      c.replies = [];
      commentMap[c.id] = c;
    });

    const nestedComments = [];
    Object.values(commentMap).forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap[comment.parentCommentId];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        nestedComments.push(comment);
      }
    });

    res.json(nestedComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all comment", error: error.message });
  }
};

// @desc    Get all comments for a blog post
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await Comment.findAll({
      where: { postId: postId },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "profileImageUrl"],
        },
        {
          model: BlogPost,
          as: "post",
          attributes: ["title", "coverImageUrl"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const commentMap = {};
    comments.forEach((comment) => {
      const c = comment.toJSON();
      c.replies = [];
      commentMap[c.id] = c;
    });

    const nestedComments = [];
    Object.values(commentMap).forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap[comment.parentCommentId];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        nestedComments.push(comment);
      }
    });

    res.json(nestedComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error: error.message });
  }
};

// @desc    Delete a comment and its replies (author or admin only)
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.authorId !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.destroy();

    res.json({ message: "Comment and any replies deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
  deleteComment,
  getAllComments,
};
