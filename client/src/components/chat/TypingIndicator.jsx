import React from "react";

const TypingIndicator = ({ typingUsers, community }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const formatTypingUsers = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0]}, ${typingUsers[1]}, and ${typingUsers[2]} are typing`;
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]}, and ${
        typingUsers.length - 2
      } others are typing`;
    }
  };

  return (
    <div className="flex items-center space-x-3 px-4 py-2">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <span className="text-sm text-gray-500 italic">
        {formatTypingUsers()}
      </span>
    </div>
  );
};

export default TypingIndicator;
