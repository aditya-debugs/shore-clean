// OnlineUsersList.jsx - Display online users component
import { useState } from "react";

const OnlineUsersList = ({ users, isVisible, onToggle }) => {
  if (!isVisible) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return "👑";
      case "organizer":
        return "🏆";
      case "volunteer":
        return "🙋‍♂️";
      default:
        return "👤";
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Online Now ({users.length})
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {users.map((user) => (
            <div key={user.userId} className="flex items-center space-x-3 py-2">
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {/* Status Indicator */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(
                    user.status || "online"
                  )} rounded-full border-2 border-white`}
                ></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </span>
                  <span className="text-xs">{getRoleIcon(user.role)}</span>
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.role || "volunteer"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No one is online right now
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsersList;
