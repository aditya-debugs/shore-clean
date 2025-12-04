const Message = require("../models/Message");
const Community = require("../models/Community");
const Membership = require("../models/Membership");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Get messages for a community
// @route   GET /api/messages/:communityId
// @access  Private (Members only)
const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50, before } = req.query;

    // Check if user is a member
    const membership = await Membership.findOne({
      communityId,
      userId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You must be a member to view messages",
      });
    }

    const skip = (page - 1) * limit;
    let query = {
      communityId,
      isDeleted: false,
      $or: [
        { deletedFor: { $nin: [userId] } },
        { deletedFor: { $exists: false } },
        { deletedFor: { $size: 0 } },
      ],
    };

    // If 'before' timestamp is provided, get messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate("senderId", "name email role")
      .populate("replyTo", "content senderId createdAt")
      .populate("mentions", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as delivered for this user
    const messageIds = messages.map((msg) => msg._id);
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        senderId: { $ne: userId },
        "deliveredTo.userId": { $ne: userId },
      },
      {
        $addToSet: {
          deliveredTo: {
            userId: userId,
            deliveredAt: new Date(),
          },
        },
      }
    );

    // Reverse to get chronological order (oldest first)
    const reversedMessages = messages.reverse();

    res.json({
      success: true,
      data: {
        messages: reversedMessages,
        pagination: {
          currentPage: parseInt(page),
          hasNext: messages.length === parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get community messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Send message to community
// @route   POST /api/messages/:communityId
// @access  Private (Members only)
const sendMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { messageType, content, replyTo, mentions } = req.body;

    // Check if user is an active member
    const membership = await Membership.findOne({
      communityId,
      userId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You must be an active member to send messages",
      });
    }

    // Validate message content
    if (
      messageType === "text" &&
      (!content?.text || content.text.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Text message cannot be empty",
      });
    }

    if (messageType !== "text" && !content?.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File URL is required for non-text messages",
      });
    }

    // Create message
    const message = new Message({
      communityId,
      senderId: userId,
      messageType,
      content,
      replyTo: replyTo || undefined,
      mentions: mentions || [],
    });

    await message.save();

    // Update community last message info
    await Community.findByIdAndUpdate(communityId, {
      lastMessageAt: new Date(),
      lastMessagePreview:
        messageType === "text" ? content.text : `Sent a ${messageType}`,
    });

    // Update unread count for all other members
    await Membership.updateMany(
      {
        communityId,
        userId: { $ne: userId },
        status: "active",
      },
      {
        $inc: { unreadCount: 1 },
      }
    );

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email role")
      .populate("replyTo", "content senderId createdAt")
      .populate("mentions", "name email");

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:communityId/mark-read
// @access  Private (Members only)
const markMessagesAsRead = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { messageIds } = req.body; // Array of message IDs to mark as read

    // Check if user is a member
    const membership = await Membership.findOne({
      communityId,
      userId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You must be a member to mark messages as read",
      });
    }

    let query = { communityId, senderId: { $ne: userId } };

    // If specific message IDs provided, only mark those as read
    if (messageIds && messageIds.length > 0) {
      query._id = { $in: messageIds };
    }

    // Mark messages as read
    await Message.updateMany(
      {
        ...query,
        "readBy.userId": { $ne: userId },
      },
      {
        $addToSet: {
          readBy: {
            userId: userId,
            readAt: new Date(),
          },
        },
      }
    );

    // Reset unread count for this user
    await Membership.findOneAndUpdate(
      { communityId, userId },
      {
        unreadCount: 0,
        lastSeenAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private (Sender or Admin only)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { deleteFor = "me" } = req.body; // 'me' or 'everyone'

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender
    const isSender = message.senderId.toString() === userId;

    // Check if user is admin of the community
    const community = await Community.findById(message.communityId);
    const isAdmin = community && community.adminId.toString() === userId;

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    if (deleteFor === "everyone") {
      // Only sender or admin can delete for everyone
      if (!isSender && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete this message for everyone",
        });
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      message.content = { text: "This message was deleted" };
    } else {
      // Delete for self only
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
      }
    }

    await message.save();

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Edit message
// @route   PUT /api/messages/:messageId
// @access  Private (Sender only)
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    // Only text messages can be edited
    if (message.messageType !== "text") {
      return res.status(400).json({
        success: false,
        message: "Only text messages can be edited",
      });
    }

    // Cannot edit deleted messages
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit deleted messages",
      });
    }

    // Add to edit history
    if (!message.editHistory) {
      message.editHistory = [];
    }
    message.editHistory.push({
      content: message.content.text,
      editedAt: new Date(),
    });

    // Update message content
    message.content.text = content.text;
    message.isEdited = true;

    await message.save();

    // Populate and return updated message
    const updatedMessage = await Message.findById(messageId)
      .populate("senderId", "name email role")
      .populate("replyTo", "content senderId createdAt")
      .populate("mentions", "name email");

    res.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/messages/:messageId/react
// @access  Private (Members only)
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is a member of the community
    const membership = await Membership.findOne({
      communityId: message.communityId,
      userId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You must be a member to react to messages",
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (reaction) =>
        reaction.userId.toString() === userId && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if it exists
      message.reactions = message.reactions.filter(
        (reaction) =>
          !(reaction.userId.toString() === userId && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        userId,
        emoji,
        createdAt: new Date(),
      });
    }

    await message.save();

    res.json({
      success: true,
      data: message.reactions,
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getCommunityMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
  addReaction,
};
