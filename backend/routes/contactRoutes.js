const express = require("express");
const { submitContactForm, getContactMessages } = require("../controllers/contactController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", submitContactForm);
router.get("/messages", protect, authorize("admin", "superadmin"), getContactMessages);

module.exports = router;
