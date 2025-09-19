// socketHandler.js - WebSocket event handlers for group-based real-time chat
const { saveMessage, getGroupMessages } = require('../controllers/chatController');
const Group = require('../models/Group');

// Store connected users per room (now group-based)
const activeRooms = new Map();
const userSockets = new Map();

// Helper function to get room ID (now group-based)
const getRoomId = (orgId, groupId) => {
  return `${orgId}_${groupId}`;
};

// Helper function to get room users
const getRoomUsers = (roomId) => {
  const room = activeRooms.get(roomId);
  return room ? Array.from(room.users.values()) : [];
};

// Helper function to add user to room
const addUserToRoom = (roomId, userData) => {
  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, {
      users: new Map(),
      typingUsers: new Set(),
    });
  }
  
  const room = activeRooms.get(roomId);
  room.users.set(userData.userId, userData);
  userSockets.set(userData.userId, userData.socketId);
};

// Helper function to remove user from room
const removeUserFromRoom = (roomId, userId) => {
  const room = activeRooms.get(roomId);
  if (room) {
    room.users.delete(userId);
    room.typingUsers.delete(userId);
    userSockets.delete(userId);
    
    // Clean up empty rooms
    if (room.users.size === 0) {
      activeRooms.delete(roomId);
    }
  }
};

// Initialize Socket.io handlers
const initializeSocketHandlers = (io) => {
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    let currentUser = null;
    let currentRoom = null;
    let currentGroupId = null;

    // Handle user joining a group room
    socket.on('join_room', async (data) => {
      try {
        const { orgId, groupId, userId, username } = data;
        
        if (!orgId || !groupId || !userId || !username) {
          socket.emit('error', { message: 'Missing required parameters: orgId, groupId, userId, username' });
          return;
        }

        // Verify group exists and user has access
        const group = await Group.findById(groupId);
        if (!group || !group.isActive) {
          socket.emit('error', { message: 'Group not found or inactive' });
          return;
        }

        // Check if user is member of the group or group is public
        const isMember = group.members.some(m => m.userId.toString() === userId);
        if (!isMember && !group.settings.isPublic) {
          socket.emit('error', { message: 'Access denied to this group' });
          return;
        }

        const roomId = getRoomId(orgId, groupId);
        currentRoom = roomId;
        currentGroupId = groupId;
        currentUser = {
          userId,
          username,
          socketId: socket.id,
          orgId,
          groupId,
          joinedAt: new Date(),
          status: 'online'
        };

        // Join the socket room
        socket.join(roomId);
        
        // Add user to our room tracking
        addUserToRoom(roomId, currentUser);

        console.log(`User ${username} joined group room: ${group.name} (${roomId})`);

        // Send recent messages to the user
        try {
          const recentMessages = await getGroupMessages(groupId, 20);
          if (recentMessages.success) {
            socket.emit('message_history', recentMessages.data);
          }
        } catch (error) {
          console.error('Error fetching recent messages:', error);
        }

        // Send group information
        socket.emit('group_info', {
          groupId: group._id,
          name: group.name,
          description: group.description,
          type: group.type,
          icon: group.icon,
          color: group.color,
          memberCount: group.members.length
        });

        // Notify room about new user
        socket.to(roomId).emit('user_joined', {
          userId,
          username,
          message: `${username} joined the group`,
          timestamp: new Date()
        });

        // Send updated user list to all users in room
        const roomUsers = getRoomUsers(roomId);
        io.to(roomId).emit('room_users', roomUsers);

        // Confirm successful join
        socket.emit('join_success', {
          roomId,
          groupId,
          groupName: group.name,
          message: `Successfully joined ${group.name}`,
          userCount: roomUsers.length
        });

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { orgId, groupId, userId, username, message, replyTo } = data;
        
        if (!currentRoom || !currentUser || !currentGroupId) {
          socket.emit('error', { message: 'You must join a group first' });
          return;
        }

        if (!message || !message.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Save message to database
        const savedMessage = await saveMessage(orgId, groupId, userId, message.trim(), 'text', replyTo);
        
        if (!savedMessage.success) {
          socket.emit('error', { message: savedMessage.message || 'Failed to save message' });
          return;
        }

        // Broadcast message to all users in the room
        const messageData = {
          _id: savedMessage.data._id,
          userId,
          username,
          message: message.trim(),
          timestamp: new Date(),
          messageType: 'text',
          orgId,
          groupId,
          replyTo: replyTo || null
        };

        io.to(currentRoom).emit('receive_message', messageData);
        
        console.log(`Message sent in group ${currentGroupId} by ${username}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      if (!currentRoom || !currentUser) return;

      const room = activeRooms.get(currentRoom);
      if (room) {
        room.typingUsers.add(currentUser.userId);
        socket.to(currentRoom).emit('user_typing', {
          userId: currentUser.userId,
          username: currentUser.username,
          groupId: currentGroupId,
          timestamp: new Date()
        });
      }
    });

    socket.on('stop_typing', (data) => {
      if (!currentRoom || !currentUser) return;

      const room = activeRooms.get(currentRoom);
      if (room) {
        room.typingUsers.delete(currentUser.userId);
        socket.to(currentRoom).emit('user_stopped_typing', {
          userId: currentUser.userId,
          username: currentUser.username,
          groupId: currentGroupId,
          timestamp: new Date()
        });
      }
    });

    // Handle user status updates
    socket.on('update_status', (data) => {
      if (!currentRoom || !currentUser) return;

      const { status } = data;
      currentUser.status = status;
      
      const room = activeRooms.get(currentRoom);
      if (room) {
        room.users.set(currentUser.userId, currentUser);
        const roomUsers = getRoomUsers(currentRoom);
        io.to(currentRoom).emit('room_users', roomUsers);
      }
    });

    // Handle message read receipts
    socket.on('message_read', (data) => {
      if (!currentRoom || !currentUser) return;

      const { messageId } = data;
      socket.to(currentRoom).emit('message_read_by', {
        messageId,
        userId: currentUser.userId,
        username: currentUser.username,
        groupId: currentGroupId,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      if (currentRoom && currentUser) {
        // Remove user from room
        removeUserFromRoom(currentRoom, currentUser.userId);

        // Notify room about user leaving
        socket.to(currentRoom).emit('user_left', {
          userId: currentUser.userId,
          username: currentUser.username,
          message: `${currentUser.username} left the group`,
          timestamp: new Date()
        });

        // Send updated user list
        const roomUsers = getRoomUsers(currentRoom);
        socket.to(currentRoom).emit('room_users', roomUsers);

        console.log(`User ${currentUser.username} left room: ${currentRoom}`);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'Connection error occurred' });
    });

  });

  // Periodic cleanup of inactive rooms
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of activeRooms.entries()) {
      // Remove users who haven't been active for more than 30 minutes
      for (const [userId, user] of room.users.entries()) {
        if (now - new Date(user.joinedAt).getTime() > 30 * 60 * 1000) {
          room.users.delete(userId);
          userSockets.delete(userId);
        }
      }
      
      // Clean up empty rooms
      if (room.users.size === 0) {
        activeRooms.delete(roomId);
        console.log(`Cleaned up empty room: ${roomId}`);
      }
    }
  }, 5 * 60 * 1000); // Run cleanup every 5 minutes

  console.log('Socket.io handlers initialized for group-based chat');
};

// Get active rooms status (for debugging/monitoring)
const getActiveRoomsStatus = () => {
  const status = {};
  for (const [roomId, room] of activeRooms.entries()) {
    status[roomId] = {
      userCount: room.users.size,
      typingCount: room.typingUsers.size,
      users: Array.from(room.users.values()).map(u => ({
        userId: u.userId,
        username: u.username,
        status: u.status,
        joinedAt: u.joinedAt,
        groupId: u.groupId
      }))
    };
  }
  return status;
};

module.exports = {
  initializeSocketHandlers,
  getActiveRoomsStatus,
  getRoomUsers,
  activeRooms
};