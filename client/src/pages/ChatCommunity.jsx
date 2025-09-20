// ChatCommunity.jsx - Group-based real-time chat component for ShoreClean
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { chatAPI, groupsAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MessageBubble from "../components/MessageBubble";
import OnlineUsersList from "../components/OnlineUsersList";
import TypingIndicator from "../components/TypingIndicator";
import GroupList from "../components/GroupList";
import GroupManagement from "../components/GroupManagement";

const ChatCommunity = () => {
  // Get authenticated user
  const { currentUser } = useAuth();

  // Component state
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Demo organization data - replace with actual props/params or context
  const orgId = "674d123456789012345678ab";
  const orgName = "Mumbai Coastal Guardians Community";

  // Auto-seed groups for testing
  useEffect(() => {
    const seedGroups = async () => {
      try {
        // Try to seed groups for testing (this will only create if none exist)
        const response = await fetch(`/api/groups/${orgId}/seed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Seed groups response:", data);
        }
      } catch (error) {
        console.log(
          "Seed groups error (this is normal if groups already exist):",
          error
        );
      }
    };

    if (orgId && currentUser) {
      seedGroups();
    }
  }, [orgId, currentUser]);

  // WebSocket connection - now group-based with authenticated user
  const {
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    currentGroup,
    readReceipts,
    error,
    sendMessage,
    handleTyping,
    markAsRead,
  } = useSocket(orgId, selectedGroup?._id, currentUser);

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

  // Early return if user is not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  // Load chat history from API - now group-based
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedGroup) {
        setChatHistory([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await chatAPI.getGroupMessages(selectedGroup._id);
        setChatHistory(response.data.messages || []);
      } catch (error) {
        console.error("Failed to load group chat history:", error);
        setChatHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [selectedGroup]);

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setChatHistory([]); // Clear previous messages
  };

  // Handle back to group list
  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setChatHistory([]);
  };

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (
      (!messageInput.trim() && !selectedFile) ||
      !isConnected ||
      !selectedGroup
    )
      return;

    if (selectedFile) {
      // For now, just send a file message indication (full file upload would need server support)
      sendMessage(
        `📄 ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(
          2
        )} MB)`
      );
      setSelectedFile(null);
    } else {
      sendMessage(messageInput);
    }

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

  // Quick emoji selector
  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🌊", "🏖️"];

  const addEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const messageGroups = groupMessagesByDate([...chatHistory, ...messages]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 pt-20">
        {/* Back to Home Button */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white shadow-lg border-b border-gray-100">
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
                {/* Current User Display */}
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  <span>👤</span>
                  <span>{currentUser.name}</span>
                </div>

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

                {/* Group Management Button (for organizers/admins) */}
                {(currentUser.role === "organizer" ||
                  currentUser.role === "admin") && (
                  <button
                    onClick={() => setShowGroupManagement(true)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    <span className="text-sm font-medium">Manage</span>
                  </button>
                )}
              </div>
            </div>

            {/* Group Navigation */}
            {selectedGroup ? (
              <div className="mt-6 flex items-center justify-between bg-gray-100 rounded-xl p-3">
                <button
                  onClick={handleBackToGroups}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span>←</span>
                  <span className="text-sm">Back to Groups</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{
                      backgroundColor: selectedGroup.color || "#3B82F6",
                    }}
                  >
                    {selectedGroup.icon || "💬"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedGroup.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {selectedGroup.type === "event"
                        ? "Event Group"
                        : selectedGroup.type === "certificate"
                        ? "Certificate Group"
                        : "Discussion Group"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {currentGroup?.userCount ||
                    selectedGroup.members?.length ||
                    0}{" "}
                  members
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-gray-100 rounded-xl p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  🌊 {orgName} Community
                </h3>
                <p className="text-xs text-gray-600">
                  Select a group below to start chatting with members
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {!selectedGroup ? (
              /* Group Selection View */
              <GroupList
                orgId={orgId}
                orgName={orgName}
                onSelectGroup={handleGroupSelect}
                currentUser={currentUser}
                selectedGroupId={selectedGroup?._id}
              />
            ) : (
              <>
                {/* Chat Messages Area */}
                <div
                  ref={chatContainerRef}
                  className="h-96 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-600">
                        Loading messages...
                      </span>
                    </div>
                  ) : chatHistory.length === 0 && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="text-4xl mb-3">💬</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Start the conversation!
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Be the first to send a message in {selectedGroup.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {Object.entries(messageGroups).map(
                        ([dateKey, dayMessages]) => (
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
                                isCurrentUser={
                                  message.userId === currentUser._id
                                }
                                showSender={true}
                                readReceipts={
                                  readReceipts.get(message._id) || []
                                }
                                onMarkAsRead={markAsRead}
                              />
                            ))}
                          </div>
                        )
                      )}

                      {/* Typing Indicator */}
                      <TypingIndicator
                        typingUsers={typingUsers}
                        currentUserId={currentUser._id}
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

                  {/* Selected File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>📄</span>
                        <span className="text-sm text-gray-700">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder={`Message ${selectedGroup.name}...`}
                        className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        disabled={!isConnected}
                      />

                      {/* File Upload Button */}
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                      <label
                        htmlFor="file-upload"
                        className="absolute right-10 top-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        📎
                      </label>

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
                      disabled={
                        (!messageInput.trim() && !selectedFile) || !isConnected
                      }
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
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <div className="flex items-center space-x-2">
                      <span>{onlineUsers.length} people online</span>
                      <span>•</span>
                      <span
                        className={
                          isConnected ? "text-green-600" : "text-red-600"
                        }
                      >
                        {isConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Click outside handler for online users */}
        {showOnlineUsers && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowOnlineUsers(false)}
          />
        )}

        {/* Group Management Modal */}
        {showGroupManagement && (
          <GroupManagement
            orgId={orgId}
            currentUser={currentUser}
            onClose={() => setShowGroupManagement(false)}
          />
        )}
      </div>
    </>
  );
};

export default ChatCommunity;
