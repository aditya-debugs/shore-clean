const Group = require("../models/Group");
const Community = require("../models/Community");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Event = require("../models/Event");

// Get all groups for an organization
const getOrgGroups = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const groups = await Group.find({
      orgId,
      isActive: true,
    })
      .populate("eventId", "title date location")
      .populate("createdBy", "name email")
      .sort({ createdAt: 1 });

    // Get latest message for each group
    const groupsWithLatestMessage = await Promise.all(
      groups.map(async (group) => {
        const latestMessage = await Chat.findOne({
          groupId: group._id,
        })
          .sort({ timestamp: -1 })
          .populate("userId", "name");

        return {
          ...group.toObject(),
          latestMessage,
          memberCount: group.members.length,
        };
      })
    );

    res.json({
      success: true,
      data: groupsWithLatestMessage,
    });
  } catch (error) {
    console.error("Error fetching organization groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization groups",
    });
  }
};

// Create a new group (CRUD - Create)
const createGroup = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, description, type, eventId, icon, color } = req.body;
    const createdBy = req.user.id; // From auth middleware

    if (!name || !orgId) {
      return res
        .status(400)
        .json({ message: "Group name and organization ID are required" });
    }

    // Check if user has permission to create groups (organizer/admin)
    const user = await User.findById(createdBy);
    if (!user || (user.role !== "admin" && user.role !== "organizer")) {
      return res
        .status(403)
        .json({ message: "Only organizers and admins can create groups" });
    }

    // Validate event exists if eventId provided
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(400).json({ message: "Event not found" });
      }
    }

    const newGroup = new Group({
      name,
      description,
      orgId,
      type: type || "general",
      eventId: eventId || null,
      icon: icon || "💬",
      color: color || "#3B82F6",
      createdBy,
      members: [
        {
          userId: createdBy,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    const savedGroup = await newGroup.save();
    await savedGroup.populate("eventId", "title date location");
    await savedGroup.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      data: savedGroup,
      message: "Group created successfully",
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
    });
  }
};

// Update group (CRUD - Update)
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, icon, color, settings } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user has permission to update (admin/moderator of group)
    const userMembership = group.members.find(
      (m) => m.userId.toString() === userId
    );
    if (
      !userMembership ||
      !["admin", "moderator"].includes(userMembership.role)
    ) {
      return res
        .status(403)
        .json({ message: "Insufficient permissions to update group" });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (icon) group.icon = icon;
    if (color) group.color = color;
    if (settings) group.settings = { ...group.settings, ...settings };

    const updatedGroup = await group.save();
    await updatedGroup.populate("eventId", "title date location");

    res.json({
      success: true,
      data: updatedGroup,
      message: "Group updated successfully",
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
    });
  }
};

// Delete group (CRUD - Delete)
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user has permission to delete (admin of group or org admin)
    const user = await User.findById(userId);
    const userMembership = group.members.find(
      (m) => m.userId.toString() === userId
    );

    const canDelete =
      user.role === "admin" ||
      (userMembership && userMembership.role === "admin") ||
      group.createdBy.toString() === userId;

    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Insufficient permissions to delete group" });
    }

    // Soft delete - set inactive instead of removing
    group.isActive = false;
    await group.save();

    res.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
    });
  }
};

// Join a group
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: "Group not found or inactive" });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      (m) => m.userId.toString() === userId
    );
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // Check if group is public or user has invitation
    if (!group.settings.isPublic) {
      // TODO: Implement invitation system
      return res
        .status(403)
        .json({ message: "This group requires an invitation" });
    }

    // Add user to group
    group.members.push({
      userId,
      role: "member",
      joinedAt: new Date(),
    });

    await group.save();

    res.json({
      success: true,
      message: "Successfully joined the group",
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join group",
    });
  }
};

// Leave a group
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Remove user from members
    group.members = group.members.filter((m) => m.userId.toString() !== userId);
    await group.save();

    res.json({
      success: true,
      message: "Successfully left the group",
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave group",
    });
  }
};

// Get group messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: "Group not found or inactive" });
    }

    const isMember = group.members.some((m) => m.userId.toString() === userId);
    if (!isMember && !group.settings.isPublic) {
      return res.status(403).json({ message: "Access denied to this group" });
    }

    const skip = (page - 1) * limit;

    const messages = await Chat.find({ groupId })
      .populate("userId", "name email")
      .populate("replyTo", "message username")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalMessages = await Chat.countDocuments({ groupId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        group: {
          _id: group._id,
          name: group.name,
          description: group.description,
          type: group.type,
          icon: group.icon,
          color: group.color,
          memberCount: group.members.length,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group messages",
    });
  }
};

// Create default groups for an organization
const createDefaultGroups = async (orgId, createdBy) => {
  try {
    // Check if groups already exist for this organization
    const existingGroups = await Group.find({ orgId });
    if (existingGroups.length > 0) {
      console.log(
        `Groups already exist for orgId ${orgId}, returning existing groups`
      );
      return existingGroups;
    }

    // First, create a test community if it doesn't exist
    let community = await Community.findOne({
      $or: [{ slug: "mumbai-coastal-guardians" }, { organizerId: orgId }],
    });

    if (!community) {
      community = new Community({
        name: "Mumbai Coastal Guardians Community",
        description:
          "A community dedicated to protecting Mumbai's coastal environment",
        slug: "mumbai-coastal-guardians",
        organizerId: orgId,
        organizers: [orgId],
        members: [orgId],
        settings: {
          isPublic: true,
          allowMemberInvites: true,
          autoApproveJoinRequests: true,
        },
        location: {
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
        },
      });
      await community.save();
      console.log(`Created test community for orgId ${orgId}`);
    }

    const defaultGroups = [
      {
        name: "General Announcements",
        description: "Important updates and announcements from organizers",
        type: "announcements",
        icon: "📢",
        color: "#EF4444",
      },
      {
        name: "Community Chat",
        description: "General discussion for all community members",
        type: "general",
        icon: "💬",
        color: "#3B82F6",
      },
      {
        name: "Certificates & Info",
        description: "Information about certificates and achievements",
        type: "certificates",
        icon: "🏆",
        color: "#F59E0B",
      },
    ];

    const createdGroups = [];
    for (const groupData of defaultGroups) {
      const group = new Group({
        ...groupData,
        orgId,
        communityId: community._id,
        createdBy,
        members: [
          {
            userId: createdBy,
            role: "admin",
            joinedAt: new Date(),
          },
        ],
      });

      const savedGroup = await group.save();
      createdGroups.push(savedGroup);
    }

    console.log(
      `Created ${createdGroups.length} default groups for orgId ${orgId} in community ${community._id}`
    );
    return createdGroups;
  } catch (error) {
    console.error("Error creating default groups:", error);
    throw error;
  }
};

// Get all groups for a community
const getCommunityGroups = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    // Check if community exists and user has access
    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({ message: "Community not found" });
    }

    const groups = await Group.find({
      communityId,
      isActive: true,
    })
      .populate("eventId", "title date location")
      .populate("createdBy", "name email")
      .sort({ createdAt: 1 });

    // Get latest message for each group
    const groupsWithLatestMessage = await Promise.all(
      groups.map(async (group) => {
        const latestMessage = await Chat.findOne({
          groupId: group._id,
        })
          .sort({ timestamp: -1 })
          .populate("userId", "name");

        return {
          ...group.toObject(),
          latestMessage,
          memberCount: group.members.length,
        };
      })
    );

    res.json({
      success: true,
      data: groupsWithLatestMessage,
    });
  } catch (error) {
    console.error("Error fetching community groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community groups",
    });
  }
};

// Create a new group within a community
const createCommunityGroup = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name, description, type, eventId, icon, color } = req.body;
    const createdBy = req.user._id; // From auth middleware

    if (!name || !communityId) {
      return res
        .status(400)
        .json({ message: "Group name and community ID are required" });
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is an organizer of the community
    const isOrganizer = community.organizers.some(
      (org) => org.userId.toString() === createdBy.toString()
    );

    if (!isOrganizer && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only community organizers can create groups" });
    }

    // Validate event exists if eventId provided
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(400).json({ message: "Event not found" });
      }
    }

    const newGroup = new Group({
      name,
      description,
      orgId: community.createdBy, // Use community creator as orgId for compatibility
      communityId,
      type: type || "general",
      eventId: eventId || null,
      icon: icon || "💬",
      color: color || "#3B82F6",
      createdBy,
      members: [
        {
          userId: createdBy,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    const savedGroup = await newGroup.save();
    await savedGroup.populate("createdBy", "name email");

    // Update community stats
    await Community.findByIdAndUpdate(communityId, {
      $inc: { "stats.totalGroups": 1 },
    });

    res.status(201).json({
      success: true,
      data: savedGroup,
      message: "Group created successfully",
    });
  } catch (error) {
    console.error("Error creating community group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: error.message,
    });
  }
};

// Join a group within a community
const joinCommunityGroup = async (req, res) => {
  try {
    const { communityId, groupId } = req.params;
    const userId = req.user._id;

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is a member of the community
    const isCommunityMember = community.members.some(
      (member) => member.userId.toString() === userId.toString()
    );

    if (!isCommunityMember) {
      return res.status(403).json({
        message: "You must be a community member to join groups",
      });
    }

    const group = await Group.findOne({ _id: groupId, communityId });
    if (!group || !group.isActive) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.userId.toString() === userId.toString()
    );

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    // Add user to group
    group.members.push({
      userId,
      role: "member",
      joinedAt: new Date(),
    });

    await group.save();

    res.json({
      success: true,
      message: "Successfully joined the group",
    });
  } catch (error) {
    console.error("Error joining community group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join group",
    });
  }
};

module.exports = {
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
};
