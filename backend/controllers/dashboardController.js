const prisma = require("../config/prisma");

// @desc    Dashboard summary
// @route   POST /api/dashboard-summary
// @access  Private (Admin only)
const getDashboardSummary = async (req, res) => {
  try {
     // Basic counts
    const [totalPosts, drafts, published, totalComments, aiGenerated, totalUsers] =
      await Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { isDraft: true } }),
        prisma.blogPost.count({ where: { isDraft: false } }),
        prisma.comment.count(),
        prisma.blogPost.count({ where: { generatedByAI: true } }),
        prisma.user.count(),
      ]);

    const statsAgg = await prisma.blogPost.aggregate({
      _sum: {
        views: true,
        likes: true,
      },
    });

    const totalViews = statsAgg._sum.views || 0;
    const totalLikes = statsAgg._sum.likes || 0;

    // Top performing posts
    const topPosts = await prisma.blogPost.findMany({
      where: { isDraft: false },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        views: true,
        likes: true,
      },
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
      ],
      take: 5,
    });

    // Recent comments
    const recentComments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: {
          select: { name: true, profileImageUrl: true }
        },
        post: {
          select: { title: true, coverImageUrl: true }
        }
      }
    });

    // Tag usage aggregation
    const postsWithTags = await prisma.blogPost.findMany({
      select: { tags: true }
    });

    const tagCounts = {};
    postsWithTags.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tagUsage = Object.keys(tagCounts).map(tag => ({
      tag,
      count: tagCounts[tag]
    })).sort((a, b) => b.count - a.count);

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
