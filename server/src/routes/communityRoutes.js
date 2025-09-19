const express = require("express");
const {
  createCommunity,
  getCommunities,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getCommunityGroups,
} = require("../controllers/communityController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getCommunities);
router.get("/:slug", getCommunityBySlug);

// Protected routes
router.post("/", protect, createCommunity);
router.post("/:communityId/join", protect, joinCommunity);
router.post("/:communityId/leave", protect, leaveCommunity);
router.put("/:communityId", protect, updateCommunity);
router.get("/:communityId/groups", protect, getCommunityGroups);

module.exports = router;
