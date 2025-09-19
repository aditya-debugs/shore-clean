const express = require("express");
const router = express.Router();
const {
  getOrgGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupMessages,
} = require("../controllers/groupController");
const { protect } = require("../middlewares/authMiddleware");

// Protect all group routes - TEMPORARILY DISABLED FOR TESTING
// router.use(protect);

// Organization group routes
router.get("/:orgId", getOrgGroups); // Get all groups for an organization
router.post("/:orgId", createGroup); // Create a new group

// Individual group routes
router.put("/:groupId", updateGroup); // Update group details
router.delete("/:groupId", deleteGroup); // Delete/deactivate group

// Group membership routes
router.post("/:groupId/join", joinGroup); // Join a group
router.post("/:groupId/leave", leaveGroup); // Leave a group

// Group messages route
router.get("/:groupId/messages", getGroupMessages); // Get group messages

module.exports = router;
