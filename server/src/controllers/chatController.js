const Chat = require("../models/Chat");
const Group = require("../models/Group");
const User = require("../models/User");

// Save a new message to the database (updated for groups)
const saveMessage = async (
  orgId,
  groupId,
  senderId,
  text,
  messageType = "text",
  replyTo = null
) => {
  try {
    // Get sender information
    const sender = await User.findById(senderId).select("name");
    if (!sender) {
      throw new Error("Sender not found");
    }

    // Verify group exists and user has access
    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      throw new Error("Group not found or inactive");
    }

    // Check if user is member of the group
    const isMember = group.members.some(
      (m) => m.userId.toString() === senderId
    );
    if (!isMember && !group.settings.isPublic) {
      throw new Error("Access denied to this group");
    }

    // Create message object
    const messageData = {
      orgId,
      groupId,
      userId: senderId,
      username: sender.name,
      message: text.trim(),
      messageType,
      timestamp: new Date(),
    };

    // Add replyTo if provided
    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    // Save to database
    const newMessage = new Chat(messageData);
    const savedMessage = await newMessage.save();

    // Populate sender info for return
    await savedMessage.populate("userId", "name email");
    if (replyTo) {
      await savedMessage.populate("replyTo", "message username");
    }

    return {
      success: true,
      data: savedMessage,
    };
  } catch (error) {
    console.error("Error saving message:", error);
    return {
      success: false,
      message: "Failed to save message",
      error: error.message,
    };
  }
};

// Get recent messages for a specific group (used by Socket.io)
const getGroupMessages = async (groupId, limit = 20) => {
  try {
    const messages = await Chat.find({ groupId })
      .populate("userId", "name email")
      .populate("replyTo", "message username")
      .sort({ timestamp: -1 })
      .limit(limit);

    return {
      success: true,
      data: messages.reverse(), // Return in chronological order
    };
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return {
      success: false,
      message: "Failed to fetch group messages",
      error: error.message,
    };
  }
};

// Get all groups for an organization with latest message
const getOrgChatGroups = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const groups = await Group.find({
      orgId,
      isActive: true,
    })
      .populate("eventId", "title date location status")
      .populate("createdBy", "name email")
      .sort({ type: 1, createdAt: 1 }); // Sort by type first, then creation date

    // Get latest message and unread count for each group
    const groupsWithChatInfo = await Promise.all(
      groups.map(async (group) => {
        const latestMessage = await Chat.findOne({
          groupId: group._id,
        })
          .sort({ timestamp: -1 })
          .populate("userId", "name");

        const totalMessages = await Chat.countDocuments({
          groupId: group._id,
        });

        return {
          ...group.toObject(),
          latestMessage,
          memberCount: group.members.length,
          totalMessages,
          // TODO: Implement unread count per user
          unreadCount: 0,
        };
      })
    );

    res.json({
      success: true,
      data: {
        groups: groupsWithChatInfo,
        orgId,
      },
    });
  } catch (error) {
    console.error("Error fetching organization chat groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization chat groups",
    });
  }
};

// Get messages for a specific group (REST endpoint)
const getGroupChatMessages = async (req, res) => {
  try {
    const { orgId, groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate required parameters
    if (!orgId || !groupId) {
      return res.status(400).json({
        message: "Organization ID and Group ID are required",
      });
    }

    // Verify group exists and belongs to org
    const group = await Group.findOne({
      _id: groupId,
      orgId,
      isActive: true,
    }).populate("eventId", "title date location status");

    if (!group) {
      return res.status(404).json({
        message: "Group not found or inactive",
      });
    }

    const skip = (page - 1) * limit;

    // Get messages for specific group
    const messages = await Chat.find({
      groupId,
    })
      .populate("userId", "name email")
      .populate("replyTo", "message username")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalMessages = await Chat.countDocuments({
      groupId,
    });

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
          eventInfo: group.eventId || null,
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
    console.error("Error fetching group chat messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group chat messages",
    });
  }
};

// Legacy functions for backward compatibility
const getOrgChat = async (req, res) => {
  // Redirect to getOrgChatGroups for now
  return getOrgChatGroups(req, res);
};

const getEventChat = async (req, res) => {
  // This will now find the group associated with the event
  try {
    const { orgId, eventId } = req.params;

    // Find group associated with this event
    const group = await Group.findOne({
      orgId,
      eventId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        message: "No chat group found for this event",
      });
    }

    // Redirect to group messages
    req.params.groupId = group._id;
    return getGroupChatMessages(req, res);
  } catch (error) {
    console.error("Error fetching event chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event chat",
    });
  }
};

module.exports = {
  saveMessage,
  getGroupMessages,
  getOrgChatGroups,
  getGroupChatMessages,
  // Legacy exports for backward compatibility
  getOrgChat,
  getEventChat,
  // New alias for better naming
  getRoomMessages: getGroupMessages,
};
