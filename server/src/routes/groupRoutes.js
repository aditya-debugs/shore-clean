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
  getCommunityGroups,
  createCommunityGroup,
  joinCommunityGroup,
} = require("../controllers/groupController");
const { protect } = require("../middlewares/authMiddleware");

// Organization group routes (publicly accessible for demo)
router.get("/:orgId", getOrgGroups); // Get all groups for an organization

// Development route to seed demo groups (remove in production)
router.post("/:orgId/seed", async (req, res) => {
  try {
    const { orgId } = req.params;
    // Use a placeholder createdBy for demo purposes
    const createdBy = "674d123456789012345678ab"; // Placeholder user ID
    const groups = await createDefaultGroups(orgId, createdBy);
    res.json({
      success: true,
      data: groups,
      message: "Demo groups created or already exist",
    });
  } catch (error) {
    console.error("Seed groups error:", error);
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

// Community group routes
router.get("/community/:communityId", getCommunityGroups); // Get all groups for a community
router.post("/community/:communityId", createCommunityGroup); // Create a new group in community
router.post("/community/:communityId/:groupId/join", joinCommunityGroup); // Join a community group

module.exports = router;
