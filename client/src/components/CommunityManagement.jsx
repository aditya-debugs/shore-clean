// CommunityManagement.jsx - Component for organizers to create and manage communities
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const CommunityManagement = ({ onClose, onCommunityCreated }) => {
  const { currentUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    category: "environmental",
    location: {
      city: "",
      state: "",
      country: "",
    },
    settings: {
      isPublic: true,
      requireApproval: false,
      allowMemberInvites: true,
    },
  });

  // Categories for communities
  const categories = [
    { value: "environmental", label: "Environmental" },
    { value: "cleanup", label: "Cleanup Events" },
    { value: "conservation", label: "Conservation" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
  ];

  // Load user's communities
  useEffect(() => {
    loadMyCommunities();
  }, []);

  const loadMyCommunities = async () => {
    try {
      const response = await fetch("/api/communities?my=true", {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMyCommunities(data.data);
      }
    } catch (error) {
      console.error("Error loading communities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Auto-generate slug from name
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: !prev.settings[name],
      },
    }));
  };

  // Create community
  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        // Reset form
        setFormData({
          name: "",
          description: "",
          slug: "",
          category: "environmental",
          location: { city: "", state: "", country: "" },
          settings: {
            isPublic: true,
            requireApproval: false,
            allowMemberInvites: true,
          },
        });

        // Reload communities
        await loadMyCommunities();

        // Notify parent component
        if (onCommunityCreated) {
          onCommunityCreated(data.data);
        }

        alert("Community created successfully!");
      } else {
        alert(data.message || "Failed to create community");
      }
    } catch (error) {
      console.error("Error creating community:", error);
      alert("Failed to create community");
    } finally {
      setIsCreating(false);
    }
  };

  // Check if user can create communities
  const canCreateCommunities =
    currentUser?.role === "organizer" || currentUser?.role === "admin";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Community Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
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

        <div className="p-6">
          {/* Create Community Section */}
          {canCreateCommunities && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Create New Community
              </h3>

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Community Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai Beach Cleanup"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="mumbai-beach-cleanup"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your community's mission and goals..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">
                    Community Settings
                  </h4>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.settings.isPublic}
                      onChange={() => handleCheckboxChange("isPublic")}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Public community (anyone can find and join)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.settings.requireApproval}
                      onChange={() => handleCheckboxChange("requireApproval")}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Require approval for new members
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.settings.allowMemberInvites}
                      onChange={() =>
                        handleCheckboxChange("allowMemberInvites")
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Allow members to invite others
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Community"}
                </button>
              </form>
            </div>
          )}

          {/* My Communities Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              My Communities
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading communities...</p>
              </div>
            ) : myCommunities.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                {canCreateCommunities ? (
                  <p>You haven't created any communities yet.</p>
                ) : (
                  <p>You're not a member of any communities yet.</p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {myCommunities.map((community) => (
                  <div
                    key={community._id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {community.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {community.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            📍 {community.location?.city || "No location"}
                          </span>
                          <span>
                            👥 {community.stats?.totalMembers || 0} members
                          </span>
                          <span>
                            💬 {community.stats?.totalGroups || 0} groups
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {community.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityManagement;
