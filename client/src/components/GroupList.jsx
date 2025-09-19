// GroupList.jsx - Display groups within a community with proper categorization
import { useState, useEffect } from "react";
import { groupsAPI } from "../utils/api";

const GroupList = ({
  orgId,
  orgName,
  onSelectGroup,
  currentUser,
  selectedGroupId,
}) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await groupsAPI.getByOrganization(orgId);
        setGroups(response.data || []);
      } catch (err) {
        setError("Failed to load community groups");
        console.error("Error loading groups:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orgId) {
      loadGroups();
    }
  }, [orgId]);

  // Group categories for better organization
  const categorizeGroups = (groups) => {
    const categories = {
      events: [],
      certificates: [],
      custom: [],
    };

    groups.forEach((group) => {
      switch (group.type) {
        case "event":
          categories.events.push(group);
          break;
        case "certificate":
          categories.certificates.push(group);
          break;
        default:
          categories.custom.push(group);
      }
    });

    return categories;
  };

  const categorizedGroups = categorizeGroups(groups);

  // Group icons by type
  const getGroupIcon = (type) => {
    switch (type) {
      case "event":
        return "🏖️";
      case "certificate":
        return "🏆";
      default:
        return "💬";
    }
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    onSelectGroup(group);
  };

  // Join group function
  const handleJoinGroup = async (groupId, e) => {
    e.stopPropagation();
    try {
      await groupsAPI.joinGroup(groupId);
      // Refresh groups to update membership
      const response = await groupsAPI.getOrgGroups(orgId);
      setGroups(response.data || []);
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  // Check if user is member of group
  const isMember = (group) => {
    return (
      group.members?.some((member) => member.userId === currentUser.id) ||
      group.settings?.isPublic
    );
  };

  const renderGroupCategory = (title, groups, emoji) => {
    if (groups.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
          <span className="mr-2">{emoji}</span>
          {title}
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {groups.length}
          </span>
        </h3>
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => handleGroupSelect(group)}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${
                selectedGroupId === group._id
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0"
                    style={{ backgroundColor: group.color || "#3B82F6" }}
                  >
                    {group.icon || getGroupIcon(group.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {group.name}
                    </h4>
                    {group.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <span>{group.members?.length || 0} members</span>
                      {group.settings?.isPublic ? (
                        <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded">
                          Public
                        </span>
                      ) : (
                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!isMember(group) && (
                  <button
                    onClick={(e) => handleJoinGroup(group._id, e)}
                    className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">💬</div>
        <p className="text-gray-600 text-sm">
          No groups available in this community
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Contact organizers to create groups for events, certificates, or
          discussions
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {orgName} Community
        </h2>
        <p className="text-sm text-gray-600">
          Select a group to start chatting
        </p>
      </div>

      {renderGroupCategory("Event Groups", categorizedGroups.events, "🏖️")}
      {renderGroupCategory(
        "Certificate Groups",
        categorizedGroups.certificates,
        "🏆"
      )}
      {renderGroupCategory("Discussion Groups", categorizedGroups.custom, "💬")}
    </div>
  );
};

export default GroupList;
