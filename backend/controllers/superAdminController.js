const { User, BlogPost, Comment } = require("../models");
const sequelize = require("../db/index");

// @desc    Get all users (SuperAdmin only)
// @route   GET /api/superadmin/users
// @access  Private (SuperAdmin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "profileImageUrl",
        "createdAt",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM blog_posts WHERE blog_posts.authorId = User.id)"
          ),
          "postCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM comments WHERE comments.authorId = User.id)"
          ),
          "commentCount",
        ],
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a user (SuperAdmin only)
// @route   DELETE /api/superadmin/users/:id
// @access  Private (SuperAdmin)
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User and all their data deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};
