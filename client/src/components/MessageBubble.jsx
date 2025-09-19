// MessageBubble.jsx - Individual message component
import { useState, useEffect } from "react";

const MessageBubble = ({
  message,
  isCurrentUser,
  showSender = true,
  readReceipts = [],
  onMarkAsRead,
}) => {
  const [showFullTime, setShowFullTime] = useState(false);

  // Mark message as read when it becomes visible (if not current user's message)
  useEffect(() => {
    if (!isCurrentUser && onMarkAsRead && message._id) {
      onMarkAsRead(message._id);
    }
  }, [message._id, isCurrentUser, onMarkAsRead]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return showFullTime
      ? date.toLocaleString()
      : date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const getMessageStatusIcon = () => {
    if (!isCurrentUser) return null;

    const readCount = readReceipts.length;

    if (readCount > 0) {
      return (
        <div className="inline-flex ml-1 items-center">
          <svg
            className="w-3 h-3 text-blue-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className="w-3 h-3 text-blue-300 -ml-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {readCount > 1 && (
            <span className="text-xs ml-1 text-blue-200">{readCount}</span>
          )}
        </div>
      );
    }

    // Message status indicators (sent, delivered, read)
    return (
      <div className="inline-flex ml-1">
        <svg
          className="w-3 h-3 text-blue-200"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };

  return (
    <div
      className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${
          isCurrentUser ? "order-2" : "order-1"
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 cursor-pointer transition-all hover:shadow-md ${
            isCurrentUser
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-900 hover:border-gray-300"
          }`}
          onClick={() => setShowFullTime(!showFullTime)}
        >
          {/* Sender Name (only for others) */}
          {!isCurrentUser && showSender && (
            <div className="text-xs font-medium text-blue-600 mb-1">
              {message.username}
            </div>
          )}

          {/* Message Text */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.messageType === "file" ? (
              <div className="flex items-center space-x-2">
                <span>📄</span>
                <span className="text-blue-600 underline cursor-pointer">
                  {message.fileName || "File attachment"}
                </span>
              </div>
            ) : (
              message.message
            )}
          </div>

          {/* Message Type Indicators */}
          {message.messageType === "system" && (
            <div className="text-xs italic opacity-75 mt-1">System message</div>
          )}

          {/* Timestamp and Status */}
          <div
            className={`flex items-center justify-between mt-2 ${
              isCurrentUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span className="text-xs">{formatTime(message.timestamp)}</span>
            {getMessageStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
