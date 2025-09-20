const Community = require("../models/Community");
const Group = require("../models/Group");
const User = require("../models/User");
const mongoose = require("mongoose");

// Create a new community (organizers only)
const createCommunity = async (req, res) => {
  try {
    const {
      name,
      description,
      slug,
      category,
      location,
      avatar,
      banner,
      settings,
    } = req.body;

    // Check if user has organizer role
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizers can create communities",
      });
    }

    // Check if slug is already taken
    const existingCommunity = await Community.findOne({ slug });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: "Community slug already exists",
      });
    }

    // Create community
    const community = new Community({
      name,
      description,
      slug,
      category: category || "environmental",
      location,
      avatar,
      banner,
      createdBy: req.user._id,
      organizers: [
        {
          userId: req.user._id,
          role: "admin",
        },
      ],
      settings: {
        isPublic: settings?.isPublic !== false,
        requireApproval: settings?.requireApproval || false,
        allowMemberInvites: settings?.allowMemberInvites !== false,
      },
    });

    await community.save();

    // Populate organizers
    await community.populate("organizers.userId", "name email");

    res.status(201).json({
      success: true,
      data: community,
      message: "Community created successfully",
    });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create community",
      error: error.message,
    });
  }
};

// Get all public communities or user's communities
const getCommunities = async (req, res) => {
  try {
    const { category, search, my } = req.query;
    let query = { isActive: true };

    // If 'my' parameter is true, get user's communities
    if (my === "true" && req.user) {
      query = {
        $or: [
          { createdBy: req.user._id },
          { "organizers.userId": req.user._id },
          { "members.userId": req.user._id },
        ],
        isActive: true,
      };
    } else {
      // Get public communities only
      query.settings = { isPublic: true };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const communities = await Community.find(query)
      .populate("createdBy", "name email")
      .populate("organizers.userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: communities,
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

// Get community by slug
const getCommunityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const community = await Community.findOne({ slug, isActive: true })
      .populate("createdBy", "name email")
      .populate("organizers.userId", "name email")
      .populate("members.userId", "name email");

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    res.json({
      success: true,
      data: community,
    });
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community",
      error: error.message,
    });
  }
};

// Join a community
const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is already a member
    const existingMember = community.members.find(
      (member) => member.userId.toString() === req.user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community",
      });
    }

    // Add user as member
    community.members.push({
      userId: req.user._id,
      joinedAt: new Date(),
      status: "active",
    });

    // Update stats
    community.stats.totalMembers = community.members.length;

    await community.save();

    res.json({
      success: true,
      message: "Successfully joined community",
    });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join community",
      error: error.message,
    });
  }
};

// Leave a community
const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Remove user from members
    community.members = community.members.filter(
      (member) => member.userId.toString() !== req.user._id.toString()
    );

    // Update stats
    community.stats.totalMembers = community.members.length;

    await community.save();

    res.json({
      success: true,
      message: "Successfully left community",
    });
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave community",
      error: error.message,
    });
  }
};

// Update community (organizers only)
const updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const updates = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is an organizer
    const isOrganizer = community.organizers.some(
      (org) => org.userId.toString() === req.user._id.toString()
    );

    if (!isOrganizer && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only community organizers can update this community",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "description",
      "avatar",
      "banner",
      "category",
      "location",
      "settings",
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        community[field] = updates[field];
      }
    });

    await community.save();

    res.json({
      success: true,
      data: community,
      message: "Community updated successfully",
    });
  } catch (error) {
    console.error("Error updating community:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update community",
      error: error.message,
    });
  }
};

// Get community groups
const getCommunityGroups = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Get groups for this community
    const groups = await Group.find({
      communityId,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching community groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community groups",
      error: error.message,
    });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getCommunityGroups,
};
