import React, { useState } from "react";
import { Users, Settings, Info, Crown, Hash } from "lucide-react";

const ChatHeader = ({ community, isAdmin }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {community.avatar ? (
                <img
                  src={community.avatar}
                  alt={community.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-white" />
                </div>
              )}
              {isAdmin && (
                <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                {community.name}
                {isAdmin && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{community.memberCount} members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Community Info"
            >
              <Info className="h-5 w-5 text-gray-600" />
            </button>

            {isAdmin && (
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Community Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {community.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {community.description}
          </p>
        )}
      </div>

      {/* Community Info Panel */}
      {showInfo && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="max-w-2xl">
            <h3 className="font-semibold text-gray-800 mb-2">
              About this community
            </h3>

            {community.description && (
              <p className="text-gray-700 mb-3">{community.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Members:</span>
                <span className="ml-2 text-gray-800">
                  {community.memberCount}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(community.createdAt).toLocaleDateString()}
                </span>
              </div>

              {community.organizationId && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-600">
                    Organization:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {community.organizationId.organizationName}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-3 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              Hide details
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
