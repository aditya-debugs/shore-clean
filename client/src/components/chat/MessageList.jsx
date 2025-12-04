import React from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, currentUserId, community }) => {
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  // Check if messages should be grouped (same sender, within 5 minutes)
  const shouldGroupWithPrevious = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;

    const isSameSender =
      currentMessage.senderId._id === previousMessage.senderId._id;
    const timeDiff =
      new Date(currentMessage.createdAt) - new Date(previousMessage.createdAt);
    const isWithinTimeLimit = timeDiff < 5 * 60 * 1000; // 5 minutes
    const isSameType =
      currentMessage.messageType === previousMessage.messageType;

    return (
      isSameSender &&
      isWithinTimeLimit &&
      isSameType &&
      currentMessage.messageType !== "system"
    );
  };

  const messageGroups = groupMessagesByDate(messages);
  const dates = Object.keys(messageGroups).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="space-y-4">
      {dates.map((date) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDateHeader(date)}
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {messageGroups[date].map((message, index) => {
              const previousMessage =
                index > 0 ? messageGroups[date][index - 1] : null;
              const isGrouped = shouldGroupWithPrevious(
                message,
                previousMessage
              );

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.senderId._id === currentUserId}
                  isGrouped={isGrouped}
                  community={community}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
