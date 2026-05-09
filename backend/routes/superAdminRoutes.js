const express = require("express");
const { getAllUsers, deleteUser } = require("../controllers/superAdminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/users", protect, authorize("superadmin"), getAllUsers);
router.delete("/users/:id", protect, authorize("superadmin"), deleteUser);

module.exports = router;
