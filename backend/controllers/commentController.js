const prisma = require("../config/prisma");

// @desc    Add a comment to a blog post
// @route   POST /api/comments/:postId
// @access  Private
const addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content, parentCommentId } = req.body;

    // Ensure blog post exists
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        authorId: req.user.id,
        content,
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
      },
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.message });
  }
};

// @desc    Get all comments
// @route   GET /api/comments
// @access  Public
const getAllComments = async (req, res) => {
  try {
    // Fetch all comments with author populated
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        },
        post: {
          select: { title: true, coverImageUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Create a map for commentId -> comment object
    const commentMap = {};
    comments.forEach(comment => {
      comment.replies = []; // initialize replies array
      commentMap[comment.id] = comment;
    });

    // Nest replies under their parentComment
    const nestedComments = [];
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap[comment.parentCommentId];
        if (parent) {
          parent.replies.push(commentMap[comment.id]);
        }
      } else {
        nestedComments.push(commentMap[comment.id]);
      }
    });

    res.json(nestedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch all comment", error: error.message });
  }
};

// @desc    Get all comments for a blog post
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPost = async (req, res) => {
   try {
    const postId = parseInt(req.params.postId);

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        },
        post: {
          select: { title: true, coverImageUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Create a map for commentId -> comment object
    const commentMap = {};
    comments.forEach(comment => {
      comment.replies = []; // initialize replies array
      commentMap[comment.id] = comment;
    });

    // Nest replies under their parentComment
    const nestedComments = [];
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap[comment.parentCommentId];
        if (parent) {
          parent.replies.push(commentMap[comment.id]);
        }
      } else {
        nestedComments.push(commentMap[comment.id]);
      }
    });

    res.json(nestedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};

// @desc    Delete a comment and its replies (author or admin only)
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
   try {
    const commentId = parseInt(req.params.commentId);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Authorization check
    if (
      comment.authorId !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Delete the comment (Schema handles cascade for replies if configured)
    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment and any replies deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
  deleteComment,
  getAllComments
};
