// ChatCommunity.jsx - Real-time chat component for ShoreClean
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { chatAPI } from "../utils/api";
import MessageBubble from "../components/MessageBubble";
import OnlineUsersList from "../components/OnlineUsersList";
import TypingIndicator from "../components/TypingIndicator";

// Mock user data - replace with actual auth context
const mockUser = {
  id: "currentUser",
  name: "You",
  email: "user@example.com",
  role: "volunteer",
};

const ChatCommunity = () => {
  // Component state
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("event"); // 'event' or 'org'
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Mock data - replace with actual props/params
  const orgId = "org123";
  const eventId = "event456";
  const eventName = "Marine Beach Cleanup Drive";
  const orgName = "Mumbai Coastal Guardians";

  // WebSocket connection
  const {
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    error,
    sendMessage,
    handleTyping,
  } = useSocket(orgId, activeTab === "event" ? eventId : null, mockUser);

  // Refs for auto-scroll and input
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from API
  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true);
      try {
        let response;
        if (activeTab === "event" && eventId) {
          response = await chatAPI.getEventChat(orgId, eventId);
        } else {
          response = await chatAPI.getOrgChat(orgId);
        }
        setChatHistory(response.data.messages || []);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [activeTab, orgId, eventId]);

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !isConnected) return;

    sendMessage(messageInput);
    setMessageInput("");
    setShowEmojiPicker(false);

    // Stop typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      handleTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date for message grouping
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  // Quick emoji reactions
  const quickEmojis = ["👍", "❤️", "😊", "🎉", "👏", "🌊", "🏖️", "♻️"];

  const addEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const messageGroups = groupMessagesByDate([...chatHistory, ...messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Community Chat
              </h1>
              <p className="text-gray-600 mt-1">
                Connect with fellow volunteers and organizers
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>

              {/* Online Users Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <div className="flex -space-x-1">
                    {onlineUsers.slice(0, 3).map((user, index) => (
                      <div
                        key={user.userId}
                        className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {onlineUsers.length} online
                  </span>
                </button>

                <OnlineUsersList
                  users={onlineUsers}
                  isVisible={showOnlineUsers}
                  onToggle={() => setShowOnlineUsers(!showOnlineUsers)}
                />
              </div>
            </div>
          </div>

          {/* Chat Tabs */}
          <div className="mt-6 flex space-x-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("event")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "event"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🏖️ {eventName}
            </button>
            <button
              onClick={() => setActiveTab("org")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "org"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🌊 {orgName}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages Area */}
          <div
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading messages...</span>
              </div>
            ) : (
              <>
                {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
                  <div key={dateKey}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                        {formatDate(new Date(dateKey))}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dayMessages.map((message, index) => (
                      <MessageBubble
                        key={message._id || index}
                        message={message}
                        isCurrentUser={message.userId === mockUser.id}
                        showSender={true}
                      />
                    ))}
                  </div>
                ))}

                {/* Typing Indicator */}
                <TypingIndicator
                  typingUsers={typingUsers}
                  currentUserId={mockUser.id}
                />

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="text-lg hover:bg-gray-200 rounded-lg p-2 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={`Message ${
                    activeTab === "event" ? eventName : orgName
                  }...`}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  disabled={!isConnected}
                />

                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  😊
                </button>
              </div>

              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Press Enter to send, Shift+Enter for new line</span>
                {isTyping && (
                  <span className="text-blue-500 font-medium">
                    You are typing...
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span>{onlineUsers.length} people online</span>
                <span>•</span>
                <span
                  className={isConnected ? "text-green-600" : "text-red-600"}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📋 View Event Details
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📱 Share Location
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📷 Upload Photo
              </button>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Event Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>📅 Tomorrow at 8:00 AM</div>
              <div>📍 Marine Drive, Mumbai</div>
              <div>👥 42 volunteers joined</div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Community
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                💬 {messages.length + chatHistory.length} messages today
              </div>
              <div>👥 {onlineUsers.length} online now</div>
              <div>🌊 Mumbai Coastal Guardians</div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handler for online users */}
      {showOnlineUsers && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowOnlineUsers(false)}
        />
      )}
    </div>
  );
};

export default ChatCommunity;
