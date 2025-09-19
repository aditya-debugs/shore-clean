// TypingIndicator.jsx - Shows when users are typing
const TypingIndicator = ({ typingUsers, currentUserId }) => {
  const activeTypers = typingUsers.filter(
    (user) => user.userId !== currentUserId
  );

  if (activeTypers.length === 0) return null;

  const getTypingText = () => {
    if (activeTypers.length === 1) {
      return `${activeTypers[0].username} is typing...`;
    } else if (activeTypers.length === 2) {
      return `${activeTypers[0].username} and ${activeTypers[1].username} are typing...`;
    } else {
      return `${activeTypers[0].username} and ${
        activeTypers.length - 1
      } others are typing...`;
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
        <div className="text-xs text-gray-600 mb-1">{getTypingText()}</div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
