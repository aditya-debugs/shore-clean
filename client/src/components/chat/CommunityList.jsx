import React from "react";
import { Users, Crown } from "lucide-react";

const CommunityList = ({
  communities,
  selectedCommunityId,
  onCommunitySelect,
}) => {
  const formatLastMessage = (community) => {
    if (!community.lastMessagePreview) return "No messages yet";

    const preview = community.lastMessagePreview;
    return preview.length > 50 ? `${preview.substring(0, 50)}...` : preview;
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;

    return messageTime.toLocaleDateString();
  };

  return (
    <div className="space-y-1 p-2">
      {communities.map(({ community, membership }) => (
        <div
          key={community._id}
          onClick={() => onCommunitySelect(community._id)}
          className={`
            p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50
            ${
              selectedCommunityId === community._id
                ? "bg-cyan-50 border-l-4 border-cyan-500"
                : ""
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <h3 className="font-semibold text-gray-800 truncate flex-1">
                  {community.name}
                </h3>
                {membership.role === "admin" && (
                  <Crown className="h-4 w-4 text-yellow-500 ml-1 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Users className="h-3 w-3 mr-1" />
                <span>{community.memberCount} members</span>
              </div>

              <p className="text-sm text-gray-600 truncate">
                {formatLastMessage(community)}
              </p>
            </div>

            <div className="flex flex-col items-end ml-2">
              <span className="text-xs text-gray-400 mb-1">
                {formatLastMessageTime(community.lastMessageAt)}
              </span>

              {membership.unreadCount > 0 && (
                <div className="bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {membership.unreadCount > 99 ? "99+" : membership.unreadCount}
                </div>
              )}
            </div>
          </div>

          {community.organizationId?.logo && (
            <div className="flex items-center mt-2">
              <img
                src={community.organizationId.logo}
                alt={community.organizationId.organizationName}
                className="h-6 w-6 rounded-full mr-2"
              />
              <span className="text-xs text-gray-500 truncate">
                {community.organizationId.organizationName}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommunityList;
