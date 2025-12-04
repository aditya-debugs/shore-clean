const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createCommunity,
  getMyCommunities,
  getCommunityByOrganization,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getCommunityMembers,
  removeMember,
} = require("../controllers/communityController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rate limiting for API calls
const createCommunityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 community creation requests per windowMs
  message: {
    success: false,
    message: "Too many community creation attempts, try again later",
  },
});

const joinLeaveLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 join/leave requests per windowMs
  message: {
    success: false,
    message: "Too many join/leave attempts, try again later",
  },
});

// All routes require authentication
router.use(protect);

// @route   POST /api/communities/create
// @desc    Create community for organization
// @access  Private (Organization only)
router.post("/create", createCommunityLimiter, createCommunity);

// @route   GET /api/communities/my-communities
// @desc    Get user's communities
// @access  Private
router.get("/my-communities", getMyCommunities);

// @route   GET /api/communities/organization/:organizationId
// @desc    Get community by organization ID
// @access  Private
router.get("/organization/:organizationId", getCommunityByOrganization);

// @route   POST /api/communities/:communityId/join
// @desc    Join community
// @access  Private
router.post("/:communityId/join", joinLeaveLimiter, joinCommunity);

// @route   DELETE /api/communities/:communityId/leave
// @desc    Leave community
// @access  Private
router.delete("/:communityId/leave", joinLeaveLimiter, leaveCommunity);

// @route   PUT /api/communities/:communityId
// @desc    Update community details (admin only)
// @access  Private (Admin only)
router.put("/:communityId", updateCommunity);

// @route   GET /api/communities/:communityId/members
// @desc    Get community members
// @access  Private (Members only)
router.get("/:communityId/members", getCommunityMembers);

// @route   DELETE /api/communities/:communityId/members/:memberId
// @desc    Remove member from community (admin only)
// @access  Private (Admin only)
router.delete("/:communityId/members/:memberId", removeMember);

module.exports = router;
