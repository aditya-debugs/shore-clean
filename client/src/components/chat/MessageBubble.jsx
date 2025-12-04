import React, { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import {
  File,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  Reply,
  MoreVertical,
  Trash2,
  Edit3,
  Copy,
  Heart,
  Smile,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";

const MessageBubble = ({ message, isOwn, isGrouped, community }) => {
  const { addReaction, isUserOnline } = useSocket();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeliveryStatus = () => {
    if (message.isOptimistic) return "sending";
    if (message.readBy?.length > 0) return "read";
    if (message.deliveredTo?.length > 0) return "delivered";
    return "sent";
  };

  const renderDeliveryStatus = () => {
    const status = getDeliveryStatus();

    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-gray-400" />;
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-cyan-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return (
          <div className="break-words">
            {message.content.text}
            {message.isEdited && (
              <span className="text-xs text-gray-400 ml-2">(edited)</span>
            )}
          </div>
        );

      case "image":
        return (
          <div className="max-w-sm">
            <img
              src={message.content.fileUrl}
              alt={message.content.fileName || "Image"}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.content.fileUrl, "_blank")}
            />
            {message.content.fileName && (
              <p className="text-xs text-gray-600 mt-1">
                {message.content.fileName}
              </p>
            )}
          </div>
        );

      case "video":
        return (
          <div className="max-w-sm">
            <video
              src={message.content.fileUrl}
              controls
              className="rounded-lg max-w-full h-auto"
              poster={message.content.thumbnailUrl}
            >
              Your browser does not support the video tag.
            </video>
            {message.content.fileName && (
              <p className="text-xs text-gray-600 mt-1">
                {message.content.fileName}
              </p>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 max-w-xs">
            <Music className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <audio controls className="w-full">
                <source src={message.content.fileUrl} />
                Your browser does not support the audio tag.
              </audio>
              {message.content.fileName && (
                <p className="text-xs text-gray-600 mt-1">
                  {message.content.fileName}
                </p>
              )}
            </div>
          </div>
        );

      case "file":
        return (
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 max-w-xs">
            <File className="h-8 w-8 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {message.content.fileName || "File"}
              </p>
              {message.content.fileSize && (
                <p className="text-xs text-gray-500">
                  {(message.content.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <a
              href={message.content.fileUrl}
              download={message.content.fileName}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </a>
          </div>
        );

      case "system":
        return (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
              {message.content.text}
            </p>
          </div>
        );

      default:
        return <div>Unsupported message type</div>;
    }
  };

  const handleReaction = (emoji) => {
    addReaction(message._id, emoji);
    setShowReactions(false);
  };

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  // System messages have special styling
  if (message.messageType === "system") {
    return (
      <div className="flex justify-center my-2">{renderMessageContent()}</div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
        {/* Sender info (only show if not grouped and not own message) */}
        {!isGrouped && !isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {message.senderId.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {message.senderId.name}
            </span>
            {isUserOnline(message.senderId._id) && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            relative px-4 py-2 rounded-2xl shadow-sm
            ${
              isOwn
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }
            ${isGrouped ? (isOwn ? "rounded-tr-md" : "rounded-tl-md") : ""}
            ${message.isOptimistic ? "opacity-60" : ""}
          `}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Reply context */}
          {message.replyTo && (
            <div
              className={`
              border-l-2 pl-3 mb-2 text-sm opacity-75
              ${isOwn ? "border-white/50" : "border-gray-300"}
            `}
            >
              <p className="font-medium">{message.replyTo.senderId.name}</p>
              <p className="truncate">{message.replyTo.content.text}</p>
            </div>
          )}

          {/* Message content */}
          {renderMessageContent()}

          {/* Message actions */}
          {showActions && (
            <div
              className={`
              absolute top-0 flex space-x-1
              ${isOwn ? "-left-20" : "-right-20"}
            `}
            >
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Smile className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                <Reply className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Reaction picker */}
          {showReactions && (
            <div
              className={`
              absolute top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 z-10
              ${isOwn ? "-left-16" : "-right-16"}
            `}
            >
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1 hover:bg-gray-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions
              .reduce((acc, reaction) => {
                const existing = acc.find((r) => r.emoji === reaction.emoji);
                if (existing) {
                  existing.count++;
                  existing.users.push(reaction.userId);
                } else {
                  acc.push({
                    emoji: reaction.emoji,
                    count: 1,
                    users: [reaction.userId],
                  });
                }
                return acc;
              }, [])
              .map(({ emoji, count, users }) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600">{count}</span>
                </button>
              ))}
          </div>
        )}

        {/* Message time and status */}
        {!isGrouped && (
          <div
            className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && renderDeliveryStatus()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
