const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getCommunityMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
  addReaction,
} = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rate limiting for messaging
const messagingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 messages per minute
  message: {
    success: false,
    message: "Too many messages sent, please slow down",
  },
});

const reactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 reactions per minute
  message: {
    success: false,
    message: "Too many reactions, please slow down",
  },
});

// All routes require authentication
router.use(protect);

// @route   GET /api/messages/:communityId
// @desc    Get messages for a community
// @access  Private (Members only)
router.get("/:communityId", getCommunityMessages);

// @route   POST /api/messages/:communityId
// @desc    Send message to community
// @access  Private (Members only)
router.post("/:communityId", messagingLimiter, sendMessage);

// @route   PUT /api/messages/:communityId/mark-read
// @desc    Mark messages as read
// @access  Private (Members only)
router.put("/:communityId/mark-read", markMessagesAsRead);

// @route   DELETE /api/messages/:messageId
// @desc    Delete message
// @access  Private (Sender or Admin only)
router.delete("/:messageId", deleteMessage);

// @route   PUT /api/messages/:messageId
// @desc    Edit message
// @access  Private (Sender only)
router.put("/:messageId", editMessage);

// @route   POST /api/messages/:messageId/react
// @desc    Add reaction to message
// @access  Private (Members only)
router.post("/:messageId/react", reactionLimiter, addReaction);

module.exports = router;
