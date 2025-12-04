import React, { useState, useEffect, useRef } from "react";
import { useCommunity } from "../../context/CommunityContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({ community, isAdmin }) => {
  const { user } = useAuth();
  const {
    getCommunityMessages,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
  } = useCommunity();
  const { joinCommunity, getTypingUsers } = useSocket();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  const messages = getCommunityMessages(community._id);
  const typingUsers = getTypingUsers(community._id);

  // Join community socket room when component mounts
  useEffect(() => {
    if (community?._id) {
      joinCommunity(community._id);
    }
  }, [community?._id, joinCommunity]);

  // Load initial messages
  useEffect(() => {
    if (community && messages.length === 0) {
      loadInitialMessages();
    }
  }, [community]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when user views them
  useEffect(() => {
    if (community && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) =>
          msg.senderId._id !== user.id &&
          !msg.readBy?.some((read) => read.userId === user.id)
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg._id);
        markMessagesAsRead(community._id, messageIds);
      }
    }
  }, [community, messages, user.id, markMessagesAsRead]);

  const loadInitialMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadMessages(community._id, 1);
      setHasMore(result.hasNext);
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading initial messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const oldestMessage = messages[0];
      const before = oldestMessage ? oldestMessage.createdAt : null;

      const result = await loadMessages(community._id, 1, before);
      setHasMore(result.hasNext);
    } catch (err) {
      setError("Failed to load more messages");
      console.error("Error loading more messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      await sendMessage(community._id, messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      // Error handling is done in the context with optimistic updates
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;

    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  };

  if (!community) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader community={community} isAdmin={isAdmin} />

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {/* Loading indicator for loading more messages */}
        {loading && messages.length > 0 && (
          <div className="text-center py-2">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
              <span className="text-sm">Loading more messages...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-center py-2">
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg inline-block">
              {error}
            </div>
          </div>
        )}

        {/* Initial loading */}
        {loading && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <MessageList
            messages={messages}
            currentUserId={user.id}
            community={community}
          />
        )}

        {/* No messages */}
        {!loading && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Welcome to {community.name}!</p>
              <p>Start the conversation by sending the first message.</p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <TypingIndicator
            typingUsers={Array.from(typingUsers)}
            community={community}
          />
        )}

        {/* Scroll anchor */}
        <div ref={lastMessageRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          community={community}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
