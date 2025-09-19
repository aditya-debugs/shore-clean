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
  createDefaultGroups,
} = require("../controllers/groupController");
const { protect } = require("../middlewares/authMiddleware");

// Organization group routes (publicly accessible for demo)
router.get("/:orgId", getOrgGroups); // Get all groups for an organization

// Development route to seed demo groups (remove in production)
router.post("/:orgId/seed", async (req, res) => {
  try {
    const { orgId } = req.params;
    const groups = await createDefaultGroups(orgId, orgId); // Using orgId as createdBy for demo
    res.json({ success: true, data: groups, message: "Demo groups created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protect other routes that require authentication
router.use(protect);

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
