const Community = require("../models/Community");
const Membership = require("../models/Membership");
const Message = require("../models/Message");
const Organization = require("../models/Organization");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Create community for organization (auto-called during org registration)
// @route   POST /api/communities/create
// @access  Private (Organization only)
const createCommunity = async (req, res) => {
  try {
    const { organizationId, name, description } = req.body;
    const userId = req.user.id;

    // Verify user owns the organization
    const organization = await Organization.findOne({
      _id: organizationId,
      userId: userId,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found or unauthorized",
      });
    }

    // Check if community already exists for this organization
    const existingCommunity = await Community.findOne({ organizationId });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: "Community already exists for this organization",
      });
    }

    // Create community
    const community = new Community({
      name: name || organization.organizationName,
      description:
        description || `Welcome to ${organization.organizationName} community!`,
      organizationId,
      adminId: userId,
    });

    await community.save();

    // Create admin membership
    const membership = new Membership({
      communityId: community._id,
      userId: userId,
      role: "admin",
      status: "active",
    });

    await membership.save();

    // Create welcome system message
    const welcomeMessage = new Message({
      communityId: community._id,
      senderId: userId,
      messageType: "system",
      content: {
        text: `Welcome to ${community.name}! This is the beginning of your community chat.`,
      },
    });

    await welcomeMessage.save();

    res.status(201).json({
      success: true,
      data: {
        community,
        membership,
      },
    });
  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get user's communities
// @route   GET /api/communities/my-communities
// @access  Private
const getMyCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Getting communities for user ID:", userId);

    // Find memberships where user is a member
    const memberships = await Membership.find({
      userId: userId,
      status: "active",
    })
      .populate({
        path: "communityId",
        populate: {
          path: "organizationId",
          select: "organizationName logo",
        },
      })
      .sort({ updatedAt: -1 });

    console.log("Found memberships:", memberships.length);

    // Also find communities where user is the admin (for organization users)
    const User = require("../models/User");
    const userDoc = await User.findById(userId);
    let adminCommunities = [];

    if (userDoc && userDoc.role === "org" && userDoc.organizationId) {
      const Community = require("../models/Community");
      const orgCommunities = await Community.find({
        organizationId: userDoc.organizationId,
      }).populate("organizationId", "organizationName logo");

      console.log("Found organization communities:", orgCommunities.length);

      adminCommunities = orgCommunities.map((community) => ({
        community: community,
        membership: {
          role: "admin",
          joinedAt: community.createdAt,
          unreadCount: 0,
          lastSeenAt: new Date(),
        },
      }));
    }

    // Combine membership communities and admin communities
    const membershipCommunities = memberships.map((membership) => ({
      community: membership.communityId,
      membership: {
        role: membership.role,
        joinedAt: membership.joinedAt,
        unreadCount: membership.unreadCount,
        lastSeenAt: membership.lastSeenAt,
      },
    }));

    // Remove duplicates (in case user has both membership and is admin)
    const allCommunities = [...membershipCommunities, ...adminCommunities];
    const uniqueCommunities = allCommunities.filter(
      (item, index, arr) =>
        arr.findIndex(
          (other) =>
            other.community._id.toString() === item.community._id.toString()
        ) === index
    );

    console.log(
      "Returning communities:",
      uniqueCommunities.length,
      uniqueCommunities
    );

    res.json({
      success: true,
      data: uniqueCommunities,
    });
  } catch (error) {
    console.error("Get my communities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get community by organization ID
// @route   GET /api/communities/organization/:organizationId
// @access  Private
const getCommunityByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ organizationId })
      .populate("organizationId", "organizationName logo description")
      .populate("adminId", "name email");

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is a member
    const membership = await Membership.findOne({
      communityId: community._id,
      userId: userId,
    });

    res.json({
      success: true,
      data: {
        community,
        membership,
        isMember: !!membership,
      },
    });
  } catch (error) {
    console.error("Get community by organization error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Join community
// @route   POST /api/communities/:communityId/join
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is already a member
    const existingMembership = await Membership.findOne({
      communityId,
      userId,
    });

    if (existingMembership) {
      if (existingMembership.status === "active") {
        return res.status(400).json({
          success: false,
          message: "Already a member of this community",
        });
      } else {
        // Reactivate membership if banned/muted user rejoins
        existingMembership.status = "active";
        existingMembership.joinedAt = new Date();
        await existingMembership.save();
      }
    } else {
      // Create new membership
      const membership = new Membership({
        communityId,
        userId,
        role: "member",
        status: "active",
      });
      await membership.save();
    }

    // Update community member count
    await Community.findByIdAndUpdate(communityId, {
      $inc: { memberCount: 1 },
    });

    // Create system message for new member
    const user = await User.findById(userId).select("name");
    const systemMessage = new Message({
      communityId,
      senderId: userId,
      messageType: "system",
      content: {
        text: `${user.name} joined the community`,
      },
    });
    await systemMessage.save();

    // Get updated membership data
    const updatedMembership = await Membership.findOne({
      communityId,
      userId,
    }).populate("communityId");

    res.json({
      success: true,
      message: "Successfully joined community",
      data: updatedMembership,
    });
  } catch (error) {
    console.error("Join community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Leave community
// @route   DELETE /api/communities/:communityId/leave
// @access  Private
const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Admin cannot leave their own community
    if (community.adminId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot leave their own community",
      });
    }

    const membership = await Membership.findOneAndDelete({
      communityId,
      userId,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Update community member count
    await Community.findByIdAndUpdate(communityId, {
      $inc: { memberCount: -1 },
    });

    // Create system message
    const user = await User.findById(userId).select("name");
    const systemMessage = new Message({
      communityId,
      senderId: userId,
      messageType: "system",
      content: {
        text: `${user.name} left the community`,
      },
    });
    await systemMessage.save();

    res.json({
      success: true,
      message: "Successfully left community",
    });
  } catch (error) {
    console.error("Leave community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update community details (admin only)
// @route   PUT /api/communities/:communityId
// @access  Private (Admin only)
const updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { name, description, avatar, settings } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is admin
    if (community.adminId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only admin can update community details",
      });
    }

    // Update fields
    if (name !== undefined) community.name = name;
    if (description !== undefined) community.description = description;
    if (avatar !== undefined) community.avatar = avatar;
    if (settings !== undefined) {
      community.settings = { ...community.settings, ...settings };
    }

    await community.save();

    res.json({
      success: true,
      data: community,
    });
  } catch (error) {
    console.error("Update community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get community members
// @route   GET /api/communities/:communityId/members
// @access  Private (Members only)
const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is a member
    const userMembership = await Membership.findOne({
      communityId,
      userId,
      status: "active",
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: "You must be a member to view members",
      });
    }

    const skip = (page - 1) * limit;

    const members = await Membership.find({
      communityId,
      status: "active",
    })
      .populate("userId", "name email role")
      .sort({ role: 1, joinedAt: -1 }) // Admins first, then by join date
      .skip(skip)
      .limit(parseInt(limit));

    const totalMembers = await Membership.countDocuments({
      communityId,
      status: "active",
    });

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMembers / limit),
          totalMembers,
          hasNext: skip + members.length < totalMembers,
        },
      },
    });
  } catch (error) {
    console.error("Get community members error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Remove member from community (admin only)
// @route   DELETE /api/communities/:communityId/members/:memberId
// @access  Private (Admin only)
const removeMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is admin
    if (community.adminId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only admin can remove members",
      });
    }

    // Cannot remove self
    if (memberId === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove yourself",
      });
    }

    const membership = await Membership.findOneAndDelete({
      communityId,
      userId: memberId,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Update community member count
    await Community.findByIdAndUpdate(communityId, {
      $inc: { memberCount: -1 },
    });

    // Create system message
    const removedUser = await User.findById(memberId).select("name");
    const adminUser = await User.findById(userId).select("name");
    const systemMessage = new Message({
      communityId,
      senderId: userId,
      messageType: "system",
      content: {
        text: `${adminUser.name} removed ${removedUser.name} from the community`,
      },
    });
    await systemMessage.save();

    res.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCommunity,
  getMyCommunities,
  getCommunityByOrganization,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getCommunityMembers,
  removeMember,
};
