const express = require("express");
const router = express.Router();
const {
  getOrgChat,
  getEventChat,
  getOrgChatGroups,
  getGroupChatMessages,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

// Protect all chat routes
router.use(protect);

// New group-based chat routes
router.get("/:orgId/groups", getOrgChatGroups); // Get all chat groups for organization
router.get("/:orgId/groups/:groupId", getGroupChatMessages); // Get messages for specific group

// Legacy routes for backward compatibility
router.get("/:orgId", getOrgChat); // Get organization community messages (redirects to groups)
router.get("/:orgId/:eventId", getEventChat); // Get event-specific messages (finds event group)

module.exports = router;
