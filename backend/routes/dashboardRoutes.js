const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");

router.get("/", protect, authorize("admin", "superadmin"), getDashboardSummary);

module.exports = router;
