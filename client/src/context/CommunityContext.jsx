import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import api from "../utils/api";

const CommunityContext = createContext();

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
};

export const CommunityProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [communities, setCommunities] = useState([]);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [messages, setMessages] = useState(new Map()); // communityId -> messages array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's communities
  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading communities for user:", user);
      const response = await api.get("/communities/my-communities");
      console.log("Communities API response:", response.data);
      if (response.data.success) {
        setCommunities(response.data.data);
        console.log("Communities loaded:", response.data.data);
      }
    } catch (error) {
      console.error("Error loading communities:", error);
      setError("Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load messages for a community
  const loadMessages = useCallback(
    async (communityId, page = 1, before = null) => {
      try {
        const params = { page, limit: 50 };
        if (before) params.before = before;

        const response = await api.get(`/messages/${communityId}`, { params });
        if (response.data.success) {
          const newMessages = response.data.data.messages;

          setMessages((prev) => {
            const currentMessages = prev.get(communityId) || [];
            const updatedMessages =
              page === 1 ? newMessages : [...newMessages, ...currentMessages];

            const newMap = new Map(prev);
            newMap.set(communityId, updatedMessages);
            return newMap;
          });

          return {
            messages: newMessages,
            hasNext: response.data.data.pagination.hasNext,
          };
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        throw new Error("Failed to load messages");
      }
    },
    []
  );

  // Send message
  const sendMessage = useCallback(
    async (communityId, messageData) => {
      const tempId = `temp_${Date.now()}_${Math.random()}`;

      // Optimistic update
      const optimisticMessage = {
        _id: tempId,
        communityId,
        senderId: { _id: user.id, name: user.name, role: user.role },
        messageType: messageData.messageType,
        content: messageData.content,
        createdAt: new Date().toISOString(),
        readBy: [],
        deliveredTo: [],
        reactions: [],
        isOptimistic: true,
      };

      setMessages((prev) => {
        const currentMessages = prev.get(communityId) || [];
        const newMap = new Map(prev);
        newMap.set(communityId, [...currentMessages, optimisticMessage]);
        return newMap;
      });

      try {
        // Send via HTTP API
        const response = await api.post(
          `/messages/${communityId}`,
          messageData
        );

        if (response.data.success) {
          const realMessage = response.data.data;

          // Replace optimistic message with real message
          setMessages((prev) => {
            const currentMessages = prev.get(communityId) || [];
            const updatedMessages = currentMessages.map((msg) =>
              msg._id === tempId ? realMessage : msg
            );
            const newMap = new Map(prev);
            newMap.set(communityId, updatedMessages);
            return newMap;
          });

          return realMessage;
        }
      } catch (error) {
        // Remove optimistic message on error
        setMessages((prev) => {
          const currentMessages = prev.get(communityId) || [];
          const updatedMessages = currentMessages.filter(
            (msg) => msg._id !== tempId
          );
          const newMap = new Map(prev);
          newMap.set(communityId, updatedMessages);
          return newMap;
        });

        throw error;
      }
    },
    [user]
  );

  // Join community
  const joinCommunity = useCallback(
    async (communityId) => {
      try {
        const response = await api.post(`/communities/${communityId}/join`);
        if (response.data.success) {
          await loadCommunities();
          return response.data.data;
        }
      } catch (error) {
        console.error("Error joining community:", error);
        throw new Error("Failed to join community");
      }
    },
    [loadCommunities]
  );

  // Leave community
  const leaveCommunity = useCallback(
    async (communityId) => {
      try {
        const response = await api.delete(`/communities/${communityId}/leave`);
        if (response.data.success) {
          setCommunities((prev) =>
            prev.filter((c) => c.community._id !== communityId)
          );
          setMessages((prev) => {
            const newMap = new Map(prev);
            newMap.delete(communityId);
            return newMap;
          });

          if (currentCommunity?._id === communityId) {
            setCurrentCommunity(null);
          }

          return true;
        }
      } catch (error) {
        console.error("Error leaving community:", error);
        throw new Error("Failed to leave community");
      }
    },
    [currentCommunity]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (communityId, messageIds = []) => {
      try {
        await api.put(`/messages/${communityId}/mark-read`, { messageIds });

        // Update local state
        setCommunities((prev) =>
          prev.map((c) =>
            c.community._id === communityId
              ? { ...c, membership: { ...c.membership, unreadCount: 0 } }
              : c
          )
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    []
  );

  // Get community by organization
  const getCommunityByOrganization = useCallback(async (organizationId) => {
    try {
      const response = await api.get(
        `/communities/organization/${organizationId}`
      );
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error getting community by organization:", error);
      throw new Error("Failed to get community");
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !connected) return;

    // New message received
    const handleNewMessage = (data) => {
      const { message, tempId } = data;

      setMessages((prev) => {
        const currentMessages = prev.get(message.communityId) || [];

        // Remove temp message if it exists
        const filteredMessages = tempId
          ? currentMessages.filter((msg) => msg._id !== tempId)
          : currentMessages;

        // Check if message already exists (avoid duplicates)
        const messageExists = filteredMessages.some(
          (msg) => msg._id === message._id
        );
        if (messageExists) return prev;

        const newMap = new Map(prev);
        newMap.set(message.communityId, [...filteredMessages, message]);
        return newMap;
      });

      // Update community last message
      setCommunities((prev) =>
        prev.map((c) =>
          c.community._id === message.communityId
            ? {
                ...c,
                community: {
                  ...c.community,
                  lastMessageAt: message.createdAt,
                  lastMessagePreview:
                    message.messageType === "text"
                      ? message.content.text
                      : `Sent a ${message.messageType}`,
                },
                membership: {
                  ...c.membership,
                  unreadCount:
                    message.senderId._id !== user.id
                      ? (c.membership.unreadCount || 0) + 1
                      : c.membership.unreadCount,
                },
              }
            : c
        )
      );
    };

    // Message read receipt
    const handleMessageRead = (data) => {
      const { messageId, readBy, readAt } = data;

      setMessages((prev) => {
        const newMap = new Map();

        for (const [communityId, messages] of prev.entries()) {
          const updatedMessages = messages.map((msg) => {
            if (msg._id === messageId) {
              const readByArray = msg.readBy || [];
              const alreadyRead = readByArray.some((r) => r.userId === readBy);

              if (!alreadyRead) {
                return {
                  ...msg,
                  readBy: [...readByArray, { userId: readBy, readAt }],
                };
              }
            }
            return msg;
          });

          newMap.set(communityId, updatedMessages);
        }

        return newMap;
      });
    };

    // Message reaction
    const handleMessageReaction = (data) => {
      const { messageId, reactions } = data;

      setMessages((prev) => {
        const newMap = new Map();

        for (const [communityId, messages] of prev.entries()) {
          const updatedMessages = messages.map((msg) =>
            msg._id === messageId ? { ...msg, reactions } : msg
          );
          newMap.set(communityId, updatedMessages);
        }

        return newMap;
      });
    };

    // Member removed
    const handleRemovedFromCommunity = (data) => {
      const { communityId } = data;

      setCommunities((prev) =>
        prev.filter((c) => c.community._id !== communityId)
      );
      setMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(communityId);
        return newMap;
      });

      if (currentCommunity?._id === communityId) {
        setCurrentCommunity(null);
      }
    };

    // Community updated
    const handleCommunityUpdated = (data) => {
      const { communityId, updates } = data;

      setCommunities((prev) =>
        prev.map((c) =>
          c.community._id === communityId
            ? { ...c, community: { ...c.community, ...updates } }
            : c
        )
      );

      if (currentCommunity?._id === communityId) {
        setCurrentCommunity((prev) => ({ ...prev, ...updates }));
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_read", handleMessageRead);
    socket.on("message_reaction", handleMessageReaction);
    socket.on("removed_from_community", handleRemovedFromCommunity);
    socket.on("community_updated", handleCommunityUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("message_reaction", handleMessageReaction);
      socket.off("removed_from_community", handleRemovedFromCommunity);
      socket.off("community_updated", handleCommunityUpdated);
    };
  }, [socket, connected, user, currentCommunity]);

  // Load communities on mount
  useEffect(() => {
    if (user) {
      loadCommunities();
    }
  }, [user, loadCommunities]);

  const contextValue = {
    communities,
    currentCommunity,
    messages,
    loading,
    error,

    // Actions
    loadCommunities,
    loadMessages,
    sendMessage,
    joinCommunity,
    leaveCommunity,
    markMessagesAsRead,
    getCommunityByOrganization,
    setCurrentCommunity,

    // Utilities
    getCommunityMessages: (communityId) => messages.get(communityId) || [],
    getTotalUnreadCount: () =>
      communities.reduce(
        (total, c) => total + (c.membership.unreadCount || 0),
        0
      ),
    hasCommunities: () => communities.length > 0,
  };

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
};
