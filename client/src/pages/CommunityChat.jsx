import React, { useState, useEffect } from "react";
import { useCommunity } from "../context/CommunityContext";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import ChatWindow from "../components/chat/ChatWindow";
import CommunityList from "../components/chat/CommunityList";
import { MessageCircle, Users, Hash, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityChat = () => {
  const { user } = useAuth();
  const {
    communities,
    currentCommunity,
    setCurrentCommunity,
    loading,
    getTotalUnreadCount,
  } = useCommunity();
  const { connected } = useSocket();
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  // Define user role check early
  const isOrganization = user?.role === "org";

  // Auto-select first community for organization users, or handle manual selection
  useEffect(() => {
    if (!selectedCommunityId && communities.length > 0) {
      // For organization users, auto-select their community (they should only have one)
      if (isOrganization) {
        const firstCommunity = communities[0];
        setSelectedCommunityId(firstCommunity.community._id);
        setCurrentCommunity(firstCommunity.community);
      }
    } else if (selectedCommunityId) {
      const community = communities.find(
        (c) => c.community._id === selectedCommunityId
      );
      if (community) {
        setCurrentCommunity(community.community);
      }
    }
  }, [selectedCommunityId, communities, setCurrentCommunity, isOrganization]);

  const handleCommunitySelect = (communityId) => {
    setSelectedCommunityId(communityId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  // For organization users, they should have their community automatically
  // For volunteers, show instructions if they haven't joined any communities
  const isVolunteer = user?.role === "user";

  if (communities.length === 0) {
    // Organization users should not see this - they should have a community automatically
    if (isOrganization) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <MessageCircle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Community Setup Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Your organization community will be created when you complete
                  your organization profile.
                </p>
                <div className="space-y-4">
                  <Link
                    to="/organization"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 mr-4"
                  >
                    Complete Profile
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        const userData = localStorage.getItem("user");
                        const user = userData ? JSON.parse(userData) : null;

                        const response = await fetch(
                          `${
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:8000/api"
                          }/organizations/create-community`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${user?.token}`,
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (response.ok) {
                          window.location.reload();
                        } else {
                          const error = await response.json();
                          alert(error.message || "Failed to create community");
                        }
                      } catch (error) {
                        console.error("Error creating community:", error);
                        alert("Failed to create community. Please try again.");
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 border-2 border-cyan-500 text-cyan-500 font-semibold rounded-xl hover:bg-cyan-50 transition-all duration-300"
                  >
                    Create Community Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For volunteers - show instructions to join communities
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <MessageCircle className="h-16 w-16 text-cyan-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Community Chat
              </h1>
              <p className="text-gray-600 mb-6">
                You haven't joined any communities yet. To get started:
              </p>
              <div className="text-left max-w-md mx-auto space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-100 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    Join an event from the Events page
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-100 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">View the event details</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-100 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Click "View Organization"</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-100 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Join the community chat!</p>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/events"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For organization users with only one community, show direct chat
  // For volunteers or users with multiple communities, show the sidebar
  const showSidebar = !isOrganization || communities.length > 1;

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar - Community List (conditional for organizations) */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <Hash className="h-6 w-6 text-cyan-500 mr-2" />
                {isOrganization ? "Your Community" : "Communities"}
              </h1>
              {getTotalUnreadCount() > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                  {getTotalUnreadCount() > 99 ? "99+" : getTotalUnreadCount()}
                </div>
              )}
            </div>
            <div className="flex items-center mt-2">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Community List */}
          <div className="flex-1 overflow-y-auto">
            <CommunityList
              communities={communities}
              selectedCommunityId={selectedCommunityId}
              onCommunitySelect={handleCommunitySelect}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentCommunity ? (
          <ChatWindow
            community={currentCommunity}
            isAdmin={
              communities.find((c) => c.community._id === currentCommunity._id)
                ?.membership.role === "admin"
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                {isOrganization
                  ? "Loading Your Community..."
                  : "Select a Community"}
              </h2>
              <p className="text-gray-500">
                {isOrganization
                  ? "Setting up your organization's community chat..."
                  : "Choose a community from the sidebar to start chatting"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityChat;
