// WebSocket hook for real-time GROUP-BASED chat functionality
import { useEffect, useRef, useState } from "react";
// import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = (orgId, groupId = null, user = null) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!orgId || !groupId || !user) return;

    // Initialize socket connection (commented out for now since socket.io-client isn't installed)
    /*
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      
      // Join the group room (new group-based approach)
      newSocket.emit('join_room', {
        orgId,
        groupId,
        userId: user.id,
        username: user.name,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to chat server');
      setIsConnected(false);
    });

    // Chat message handlers
    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_history', (history) => {
      setMessages(history);
    });

    // Group info handler
    newSocket.on('group_info', (groupInfo) => {
      setCurrentGroup(groupInfo);
    });

    // Join success handler
    newSocket.on('join_success', (data) => {
      console.log(`Successfully joined group: ${data.groupName}`);
      setCurrentGroup({ 
        groupId: data.groupId, 
        name: data.groupName,
        userCount: data.userCount 
      });
    });

    // Typing indicator handlers
    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    newSocket.on('user_stopped_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Online users handlers
    newSocket.on('room_users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_joined', (userData) => {
      setOnlineUsers(prev => [...prev, userData]);
    });

    newSocket.on('user_left', (userData) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    // Error handlers
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    });

    return () => {
      newSocket.close();
    };
    */

    // Temporary mock data for development
    setIsConnected(true);
    setMessages([
      {
        _id: "1",
        userId: "user1",
        username: "Sarah Wilson",
        message: "Hey everyone! Excited for tomorrow's beach cleanup! 🏖️",
        timestamp: new Date(Date.now() - 3600000),
        messageType: "text",
      },
      {
        _id: "2",
        userId: "user2",
        username: "Mike Chen",
        message:
          "Same here! I'll be bringing extra gloves for anyone who needs them.",
        timestamp: new Date(Date.now() - 3000000),
        messageType: "text",
      },
      {
        _id: "3",
        userId: user?.id || "currentUser",
        username: user?.name || "You",
        message: "Thanks Mike! What time should we meet at the parking area?",
        timestamp: new Date(Date.now() - 1800000),
        messageType: "text",
      },
    ]);
    setOnlineUsers([
      { userId: "user1", username: "Sarah Wilson", status: "online" },
      { userId: "user2", username: "Mike Chen", status: "online" },
      {
        userId: user?.id || "currentUser",
        username: user?.name || "You",
        status: "online",
      },
    ]);
  }, [orgId, groupId, user]);

  // Send message function
  const sendMessage = (messageText) => {
    if (!socket || !isConnected || !messageText.trim()) return;

    const messageData = {
      orgId,
      groupId,
      userId: user.id,
      username: user.name,
      message: messageText.trim(),
      timestamp: new Date(),
    };

    // Emit to socket (commented out for now)
    // socket.emit('send_message', messageData);

    // Add message locally for development
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        _id: Date.now().toString(),
        messageType: "text",
      },
    ]);
  };

  // Typing indicator functions
  const startTyping = () => {
    if (!socket || !isConnected) return;

    // socket.emit('typing', {
    //   orgId,
    //   groupId,
    //   userId: user.id,
    //   username: user.name,
    // });
  };

  const stopTyping = () => {
    if (!socket || !isConnected) return;

    // socket.emit('stop_typing', {
    //   orgId,
    //   groupId,
    //   userId: user.id,
    //   username: user.name,
    // });
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

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    currentGroup,
    error,
    sendMessage,
    handleTyping,
    startTyping,
    stopTyping,
  };
};
