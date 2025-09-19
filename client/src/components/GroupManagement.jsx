// GroupManagement.jsx - Interface for organizers to manage groups
import { useState, useEffect } from "react";
import { groupsAPI } from "../utils/api";

const GroupManagement = ({ orgId, currentUser, onClose }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "custom",
    eventId: "",
    color: "#3B82F6",
    icon: "💬",
    isPublic: true,
  });

  // Group type options
  const groupTypes = [
    { value: "event", label: "Event Group", icon: "🏖️" },
    { value: "certificate", label: "Certificate Group", icon: "🏆" },
    { value: "custom", label: "Discussion Group", icon: "💬" },
  ];

  // Color options
  const colorOptions = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  // Load groups on component mount
  useEffect(() => {
    loadGroups();
  }, [orgId]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const response = await groupsAPI.getOrgGroups(orgId);
      setGroups(response.data || []);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingGroup) {
        // Update existing group
        await groupsAPI.updateGroup(editingGroup._id, formData);
      } else {
        // Create new group
        await groupsAPI.createGroup({
          ...formData,
          orgId,
          createdBy: currentUser.id,
        });
      }

      // Reset form and reload groups
      resetForm();
      loadGroups();
    } catch (error) {
      console.error("Failed to save group:", error);
      alert("Failed to save group. Please try again.");
    }
  };

  // Handle group deletion
  const handleDelete = async (groupId) => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await groupsAPI.deleteGroup(groupId);
      loadGroups();
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  // Start editing a group
  const startEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      type: group.type,
      eventId: group.eventId || "",
      color: group.color || "#3B82F6",
      icon: group.icon || "💬",
      isPublic: group.settings?.isPublic || true,
    });
    setShowCreateForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "custom",
      eventId: "",
      color: "#3B82F6",
      icon: "💬",
      isPublic: true,
    });
    setEditingGroup(null);
    setShowCreateForm(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Group Management
            </h2>
            <p className="text-gray-600 mt-1">
              Create and manage community groups
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showCreateForm ? (
            /* Groups List View */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Existing Groups ({groups.length})
                </h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Create Group</span>
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No groups yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first group to start organizing your community
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Group
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div
                      key={group._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: group.color }}
                          >
                            {group.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {group.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {group.description}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {
                                  groupTypes.find((t) => t.value === group.type)
                                    ?.label
                                }
                              </span>
                              <span className="text-xs text-gray-500">
                                {group.members?.length || 0} members
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  group.settings?.isPublic
                                    ? "bg-green-100 text-green-600"
                                    : "bg-yellow-100 text-yellow-600"
                                }`}
                              >
                                {group.settings?.isPublic
                                  ? "Public"
                                  : "Private"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(group)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(group._id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Create/Edit Form */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingGroup ? "Edit Group" : "Create New Group"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Groups
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the purpose of this group"
                  />
                </div>

                {/* Group Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {groupTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          formData.type === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">
                            {type.label}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Color and Icon */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, color }))
                          }
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color
                              ? "border-gray-400"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon/Emoji
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="😊"
                      maxLength="2"
                    />
                  </div>
                </div>

                {/* Privacy Setting */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-700">
                        Public Group
                      </div>
                      <div className="text-sm text-gray-600">
                        Anyone in the organization can join this group
                      </div>
                    </div>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingGroup ? "Update Group" : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupManagement;
