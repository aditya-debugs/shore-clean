import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // communityId -> Set of userIds
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Create socket connection
      const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const newSocket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("📡 Connected to server");
        setConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("📡 Disconnected from server:", reason);
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("📡 Connection error:", error);
        setConnected(false);
      });

      // Presence event handlers
      newSocket.on("user_online", (data) => {
        setOnlineUsers((prev) => new Set([...prev, data.userId]));
      });

      newSocket.on("user_offline", (data) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });

      // Typing indicators
      newSocket.on("user_typing", (data) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const communityTypers = newMap.get(data.communityId) || new Set();

          if (data.isTyping) {
            communityTypers.add(data.userId);
          } else {
            communityTypers.delete(data.userId);
          }

          if (communityTypers.size > 0) {
            newMap.set(data.communityId, communityTypers);
          } else {
            newMap.delete(data.communityId);
          }

          return newMap;
        });
      });

      // Error handling
      newSocket.on("error", (error) => {
        console.error("📡 Socket error:", error);
      });

      return () => {
        console.log("📡 Cleaning up socket connection");
        newSocket.close();
        setSocket(null);
        setConnected(false);
        setOnlineUsers(new Set());
        setTypingUsers(new Map());
      };
    }
  }, [user, token]);

  // Socket helper functions
  const emitWithCallback = (event, data, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      if (!socket || !connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error("Socket timeout"));
      }, timeout);

      socket.emit(event, data, (response) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  };

  const joinCommunity = (communityId) => {
    if (socket && connected) {
      socket.emit("join_community", { communityId });
    }
  };

  const leaveCommunity = (communityId) => {
    if (socket && connected) {
      socket.emit("leave_community", { communityId });
    }
  };

  const sendMessage = (messageData) => {
    if (socket && connected) {
      socket.emit("send_message", messageData);
    }
  };

  const markMessageRead = (messageId, communityId) => {
    if (socket && connected) {
      socket.emit("mark_message_read", { messageId, communityId });
    }
  };

  const startTyping = (communityId) => {
    if (socket && connected) {
      socket.emit("typing_start", { communityId });
    }
  };

  const stopTyping = (communityId) => {
    if (socket && connected) {
      socket.emit("typing_stop", { communityId });
    }
  };

  const addReaction = (messageId, emoji) => {
    if (socket && connected) {
      socket.emit("add_reaction", { messageId, emoji });
    }
  };

  const updatePresence = () => {
    if (socket && connected) {
      socket.emit("update_presence");
    }
  };

  // Admin functions
  const removeMember = (communityId, memberId) => {
    if (socket && connected) {
      socket.emit("remove_member", { communityId, memberId });
    }
  };

  const updateCommunity = (communityId, updates) => {
    if (socket && connected) {
      socket.emit("update_community", { communityId, updates });
    }
  };

  const contextValue = {
    socket,
    connected,
    onlineUsers,
    typingUsers,

    // Helper functions
    emitWithCallback,
    joinCommunity,
    leaveCommunity,
    sendMessage,
    markMessageRead,
    startTyping,
    stopTyping,
    addReaction,
    updatePresence,
    removeMember,
    updateCommunity,

    // Utility functions
    isUserOnline: (userId) => onlineUsers.has(userId),
    getTypingUsers: (communityId) => typingUsers.get(communityId) || new Set(),
    isUserTyping: (communityId, userId) => {
      const communityTypers = typingUsers.get(communityId);
      return communityTypers ? communityTypers.has(userId) : false;
    },
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
