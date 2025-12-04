const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Community = require("../models/Community");
const Membership = require("../models/Membership");
const Message = require("../models/Message");

class SocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://localhost:5176",
          process.env.CLIENT_URL || "http://localhost:3000",
        ],
        credentials: true,
      },
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userCommunities = new Map(); // userId -> Set of communityIds
    this.typingUsers = new Map(); // communityId -> Set of userIds

    this.initializeSocketHandlers();
  }

  // Authenticate socket connection
  async authenticateSocket(socket, next) {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  }

  initializeSocketHandlers() {
    // Authentication middleware
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on("connection", (socket) => {
      console.log(
        `User ${socket.user.name} connected with socket ${socket.id}`
      );

      this.handleUserConnection(socket);
      this.handleCommunityEvents(socket);
      this.handleMessageEvents(socket);
      this.handleTypingEvents(socket);
      this.handlePresenceEvents(socket);
      this.handleAdminEvents(socket);
      this.handleDisconnection(socket);
    });
  }

  async handleUserConnection(socket) {
    const userId = socket.userId;

    // Store user connection
    this.connectedUsers.set(userId, socket.id);

    // Get user's communities and join rooms
    try {
      const memberships = await Membership.find({
        userId: userId,
        status: "active",
      }).populate("communityId");

      const communityIds = new Set();

      for (const membership of memberships) {
        const communityId = membership.communityId._id.toString();
        communityIds.add(communityId);
        socket.join(communityId);

        // Emit user online status to community members
        socket.to(communityId).emit("user_online", {
          userId: userId,
          userName: socket.user.name,
          timestamp: new Date(),
        });
      }

      this.userCommunities.set(userId, communityIds);

      // Send current user's communities
      socket.emit("user_communities", Array.from(communityIds));
    } catch (error) {
      console.error("Error handling user connection:", error);
      socket.emit("error", { message: "Failed to join communities" });
    }
  }

  handleCommunityEvents(socket) {
    // Join a new community
    socket.on("join_community", async (data) => {
      try {
        const { communityId } = data;
        const userId = socket.userId;

        // Verify membership
        const membership = await Membership.findOne({
          communityId,
          userId,
          status: "active",
        });

        if (!membership) {
          socket.emit("error", { message: "Not a member of this community" });
          return;
        }

        socket.join(communityId);

        // Add to user's communities
        if (!this.userCommunities.has(userId)) {
          this.userCommunities.set(userId, new Set());
        }
        this.userCommunities.get(userId).add(communityId);

        // Notify other members
        socket.to(communityId).emit("user_joined_community", {
          userId: userId,
          userName: socket.user.name,
          timestamp: new Date(),
        });

        socket.emit("joined_community", { communityId });
      } catch (error) {
        console.error("Error joining community:", error);
        socket.emit("error", { message: "Failed to join community" });
      }
    });

    // Leave a community
    socket.on("leave_community", async (data) => {
      try {
        const { communityId } = data;
        const userId = socket.userId;

        socket.leave(communityId);

        // Remove from user's communities
        if (this.userCommunities.has(userId)) {
          this.userCommunities.get(userId).delete(communityId);
        }

        // Notify other members
        socket.to(communityId).emit("user_left_community", {
          userId: userId,
          userName: socket.user.name,
          timestamp: new Date(),
        });

        socket.emit("left_community", { communityId });
      } catch (error) {
        console.error("Error leaving community:", error);
        socket.emit("error", { message: "Failed to leave community" });
      }
    });
  }

  handleMessageEvents(socket) {
    // New message
    socket.on("send_message", async (data) => {
      try {
        const { communityId, messageType, content, replyTo, mentions, tempId } =
          data;
        const userId = socket.userId;

        // Verify membership
        const membership = await Membership.findOne({
          communityId,
          userId,
          status: "active",
        });

        if (!membership) {
          socket.emit("message_error", {
            tempId,
            error: "Not authorized to send messages to this community",
          });
          return;
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

        // Update community last message
        await Community.findByIdAndUpdate(communityId, {
          lastMessageAt: new Date(),
          lastMessagePreview:
            messageType === "text" ? content.text : `Sent a ${messageType}`,
        });

        // Update unread count for other members
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

        // Populate message
        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name email role")
          .populate("replyTo", "content senderId createdAt")
          .populate("mentions", "name email");

        // Emit to all community members
        this.io.to(communityId).emit("new_message", {
          message: populatedMessage,
          tempId,
        });

        // Send delivery confirmation to sender
        socket.emit("message_sent", {
          tempId,
          messageId: message._id,
          timestamp: message.createdAt,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message_error", {
          tempId: data.tempId,
          error: "Failed to send message",
        });
      }
    });

    // Message read
    socket.on("mark_message_read", async (data) => {
      try {
        const { messageId, communityId } = data;
        const userId = socket.userId;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              userId: userId,
              readAt: new Date(),
            },
          },
        });

        // Notify sender about read receipt
        const message = await Message.findById(messageId);
        if (message && message.senderId.toString() !== userId) {
          const senderSocketId = this.connectedUsers.get(
            message.senderId.toString()
          );
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("message_read", {
              messageId,
              readBy: userId,
              readAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Message reaction
    socket.on("add_reaction", async (data) => {
      try {
        const { messageId, emoji } = data;
        const userId = socket.userId;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          (reaction) =>
            reaction.userId.toString() === userId && reaction.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction
          message.reactions = message.reactions.filter(
            (reaction) =>
              !(
                reaction.userId.toString() === userId &&
                reaction.emoji === emoji
              )
          );
        } else {
          // Add reaction
          message.reactions.push({
            userId,
            emoji,
            createdAt: new Date(),
          });
        }

        await message.save();

        // Emit to all community members
        this.io.to(message.communityId.toString()).emit("message_reaction", {
          messageId,
          reactions: message.reactions,
          userId,
          emoji,
          action: existingReaction ? "remove" : "add",
        });
      } catch (error) {
        console.error("Error adding reaction:", error);
        socket.emit("error", { message: "Failed to add reaction" });
      }
    });
  }

  handleTypingEvents(socket) {
    // User started typing
    socket.on("typing_start", (data) => {
      const { communityId } = data;
      const userId = socket.userId;

      if (!this.typingUsers.has(communityId)) {
        this.typingUsers.set(communityId, new Set());
      }

      this.typingUsers.get(communityId).add(userId);

      socket.to(communityId).emit("user_typing", {
        userId,
        userName: socket.user.name,
        isTyping: true,
      });
    });

    // User stopped typing
    socket.on("typing_stop", (data) => {
      const { communityId } = data;
      const userId = socket.userId;

      if (this.typingUsers.has(communityId)) {
        this.typingUsers.get(communityId).delete(userId);
      }

      socket.to(communityId).emit("user_typing", {
        userId,
        userName: socket.user.name,
        isTyping: false,
      });
    });
  }

  handlePresenceEvents(socket) {
    // Update user's last seen
    socket.on("update_presence", async () => {
      try {
        const userId = socket.userId;

        await Membership.updateMany({ userId }, { lastSeenAt: new Date() });

        // Emit presence update to all user's communities
        if (this.userCommunities.has(userId)) {
          for (const communityId of this.userCommunities.get(userId)) {
            socket.to(communityId).emit("user_presence", {
              userId,
              lastSeenAt: new Date(),
              isOnline: true,
            });
          }
        }
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    });
  }

  handleAdminEvents(socket) {
    // Member removed by admin
    socket.on("remove_member", async (data) => {
      try {
        const { communityId, memberId } = data;
        const userId = socket.userId;

        // Verify admin privileges
        const community = await Community.findById(communityId);
        if (!community || community.adminId.toString() !== userId) {
          socket.emit("error", { message: "Not authorized to remove members" });
          return;
        }

        // Remove membership
        await Membership.findOneAndDelete({
          communityId,
          userId: memberId,
        });

        // Update member count
        await Community.findByIdAndUpdate(communityId, {
          $inc: { memberCount: -1 },
        });

        // Notify removed member
        const removedUserSocketId = this.connectedUsers.get(memberId);
        if (removedUserSocketId) {
          this.io.to(removedUserSocketId).emit("removed_from_community", {
            communityId,
            removedBy: userId,
            timestamp: new Date(),
          });

          // Remove from socket room
          const removedSocket =
            this.io.sockets.sockets.get(removedUserSocketId);
          if (removedSocket) {
            removedSocket.leave(communityId);
          }
        }

        // Notify all community members
        this.io.to(communityId).emit("member_removed", {
          communityId,
          memberId,
          removedBy: userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error removing member:", error);
        socket.emit("error", { message: "Failed to remove member" });
      }
    });

    // Community settings updated
    socket.on("update_community", async (data) => {
      try {
        const { communityId, updates } = data;
        const userId = socket.userId;

        // Verify admin privileges
        const community = await Community.findById(communityId);
        if (!community || community.adminId.toString() !== userId) {
          socket.emit("error", {
            message: "Not authorized to update community",
          });
          return;
        }

        // Update community
        Object.assign(community, updates);
        await community.save();

        // Notify all community members
        this.io.to(communityId).emit("community_updated", {
          communityId,
          updates,
          updatedBy: userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating community:", error);
        socket.emit("error", { message: "Failed to update community" });
      }
    });
  }

  handleDisconnection(socket) {
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      console.log(`User ${socket.user.name} disconnected`);

      // Remove from connected users
      this.connectedUsers.delete(userId);

      // Clean up typing indicators
      for (const [communityId, typingUsers] of this.typingUsers.entries()) {
        if (typingUsers.has(userId)) {
          typingUsers.delete(userId);
          socket.to(communityId).emit("user_typing", {
            userId,
            userName: socket.user.name,
            isTyping: false,
          });
        }
      }

      // Update last seen and notify communities
      try {
        await Membership.updateMany({ userId }, { lastSeenAt: new Date() });

        // Notify all user's communities about offline status
        if (this.userCommunities.has(userId)) {
          for (const communityId of this.userCommunities.get(userId)) {
            socket.to(communityId).emit("user_offline", {
              userId,
              userName: socket.user.name,
              lastSeenAt: new Date(),
            });
          }
          this.userCommunities.delete(userId);
        }
      } catch (error) {
        console.error("Error handling user disconnection:", error);
      }
    });
  }

  // Public method to emit to specific users
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Public method to emit to community
  emitToCommunity(communityId, event, data) {
    this.io.to(communityId).emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users in community
  getUsersInCommunity(communityId) {
    const users = [];
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (
        this.userCommunities.has(userId) &&
        this.userCommunities.get(userId).has(communityId)
      ) {
        users.push(userId);
      }
    }
    return users;
  }
}

module.exports = SocketManager;
