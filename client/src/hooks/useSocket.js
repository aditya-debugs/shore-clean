// WebSocket hook for real-time GROUP-BASED chat functionality
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const useSocket = (orgId, groupId = null, user = null) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [readReceipts, setReadReceipts] = useState(new Map()); // messageId -> array of users who read it

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!orgId || !groupId || !user) {
      // Clear state when no group/user is selected
      setIsConnected(false);
      setMessages([]);
      setTypingUsers([]);
      setOnlineUsers([]);
      setCurrentGroup(null);
      setError(null);
      return;
    }

    console.log(
      `🔌 Connecting socket to ${SOCKET_URL} for user: ${user.name} (${user._id}) to group: ${groupId}`
    );

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      setError(null);

      // Join the group room (new group-based approach)
      newSocket.emit("join_room", {
        orgId,
        groupId,
        userId: user._id,
        username: user.name,
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Failed to connect to chat server");
      setIsConnected(false);
    });

    // Chat message handlers
    newSocket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("message_history", (history) => {
      setMessages(history);
    });

    // Group info handler
    newSocket.on("group_info", (groupInfo) => {
      setCurrentGroup(groupInfo);
    });

    // Join success handler
    newSocket.on("join_success", (data) => {
      console.log(`Successfully joined group: ${data.groupName}`);
      setCurrentGroup({
        groupId: data.groupId,
        name: data.groupName,
        userCount: data.userCount,
      });
    });

    // Typing indicator handlers
    newSocket.on("user_typing", (data) => {
      setTypingUsers((prev) => {
        if (!prev.find((u) => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    newSocket.on("user_stopped_typing", (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Online users handlers
    newSocket.on("room_users", (users) => {
      console.log("Updated room users:", users);
      setOnlineUsers(users);

      // Update member count in real-time
      setCurrentGroup((prev) =>
        prev
          ? {
              ...prev,
              userCount: users.length,
            }
          : null
      );
    });

    newSocket.on("user_joined", (userData) => {
      console.log("User joined:", userData);
      // Note: room_users will be emitted right after this, so we don't need to manually add
      // This event is mainly for showing join notifications
    });

    newSocket.on("user_left", (userData) => {
      console.log("User left:", userData);
      // Note: room_users will be emitted right after this, so we don't need to manually remove
      // This event is mainly for showing leave notifications
    });

    // Read receipt handlers
    newSocket.on("message_read_by", (data) => {
      const { messageId, userId, username } = data;
      setReadReceipts((prev) => {
        const newReceipts = new Map(prev);
        const readers = newReceipts.get(messageId) || [];
        if (!readers.find((r) => r.userId === userId)) {
          newReceipts.set(messageId, [...readers, { userId, username }]);
        }
        return newReceipts;
      });
    });

    // Error handlers
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error.message || "An error occurred");
    });

    return () => {
      console.log("Cleaning up socket connection");
      if (newSocket) {
        newSocket.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsConnected(false);
      setSocket(null);
    };
  }, [orgId, groupId, user?._id]); // Add user._id as dependency

  // Send message function
  const sendMessage = (messageText) => {
    if (!socket || !isConnected || !messageText.trim()) return;

    const messageData = {
      orgId,
      groupId,
      userId: user._id,
      username: user.name,
      message: messageText.trim(),
      timestamp: new Date(),
    };

    // Emit to socket
    socket.emit("send_message", messageData);
  };

  // Typing indicator functions
  const startTyping = () => {
    if (!socket || !isConnected) return;

    socket.emit("typing", {
      orgId,
      groupId,
      userId: user._id,
      username: user.name,
    });
  };

  const stopTyping = () => {
    if (!socket || !isConnected) return;

    socket.emit("stop_typing", {
      orgId,
      groupId,
      userId: user._id,
      username: user.name,
    });
  };

  // Debounced typing handler
  const handleTyping = () => {
    startTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  // Mark message as read
  const markAsRead = (messageId) => {
    if (!socket || !isConnected || !messageId) return;

    socket.emit("message_read", { messageId });
  };

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    currentGroup,
    readReceipts,
    error,
    sendMessage,
    handleTyping,
    startTyping,
    stopTyping,
    markAsRead,
  };
};
