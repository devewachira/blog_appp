const { BlogPost, Comment, User } = require("../models");

// @desc    Dashboard summary
// @route   POST /api/dashboard-summary
// @access  Private (Admin only)
const getDashboardSummary = async (req, res) => {
  try {
    // Basic counts
    const [totalPosts, drafts, published, totalComments, aiGenerated, totalUsers] =
      await Promise.all([
        BlogPost.count(),
        BlogPost.count({ where: { isDraft: true } }),
        BlogPost.count({ where: { isDraft: false } }),
        Comment.count(),
        BlogPost.count({ where: { generatedByAI: true } }),
        User.count(),
      ]);

    // Sum views and likes
    const totalViews = (await BlogPost.sum("views")) || 0;
    const totalLikes = (await BlogPost.sum("likes")) || 0;

    // Top performing posts
    const topPosts = await BlogPost.findAll({
      where: { isDraft: false },
      attributes: ["id", "title", "coverImageUrl", "views", "likes"],
      order: [
        ["views", "DESC"],
        ["likes", "DESC"],
      ],
      limit: 5,
    });

    // Recent comments
    const recentComments = await Comment.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
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
    });

    // Tag usage aggregation
    const postsWithTags = await BlogPost.findAll({
      attributes: ["tags"],
    });

    const tagCounts = {};
    postsWithTags.forEach((post) => {
      const tags = post.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tagUsage = Object.keys(tagCounts)
      .map((tag) => ({
        tag,
        count: tagCounts[tag],
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      stats: {
        totalPosts,
        drafts,
        published,
        totalViews,
        totalLikes,
        totalComments,
        aiGenerated,
        totalUsers,
      },
      topPosts,
      recentComments,
      tagUsage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = { getDashboardSummary };
