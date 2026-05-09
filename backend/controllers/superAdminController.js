const prisma = require("../config/prisma");

// @desc    Get all users (SuperAdmin only)
// @route   GET /api/superadmin/users
// @access  Private (SuperAdmin)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        _count: {
          select: { posts: true, comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
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

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User and all their data deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};
