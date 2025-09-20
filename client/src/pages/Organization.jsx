import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Edit3,
  MessageCircle,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isVolunteer, isOrganizer } from "../utils/roleUtils";
import api from "../utils/api";

const Organization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrganization();
    fetchOrganizationEvents();
  }, [id]);

  const fetchOrganization = async () => {
    try {
      const response = await api.get(`/auth/user/${id}`);
      setOrganization(response.data);
    } catch (err) {
      setError("Failed to load organization details");
      console.error("Error fetching organization:", err);
    }
  };

  const fetchOrganizationEvents = async () => {
    try {
      const response = await api.get(`/events?organizer=${id}`);
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching organization events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = () => {
    navigate("/community-chat");
  };

  const handleEditProfile = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">Loading organization...</span>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Organization Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The organization you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isViewingOwnProfile = user?.id === organization._id;
  const canEdit = isViewingOwnProfile && isOrganizer(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        {/* Organization Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-green-500"></div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-start space-x-6 mb-6">
              <div className="relative">
                {organization.profilePicture ? (
                  <img
                    src={organization.profilePicture}
                    alt={organization.organizationName || organization.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {organization.organizationName || organization.name}
                </h1>
                <p className="text-gray-600 text-lg mb-4">
                  {organization.description ||
                    "Environmental conservation organization"}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {isVolunteer(user) && !isViewingOwnProfile && (
                    <button
                      onClick={handleJoinCommunity}
                      className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join Community
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={handleEditProfile}
                      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Contact Information
                </h3>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{organization.email}</span>
                </div>

                {organization.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">
                      {organization.location}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">
                    Member since{" "}
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Statistics
                </h3>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">
                    {events.length} event{events.length !== 1 ? "s" : ""}{" "}
                    organized
                  </span>
                </div>

                {organization.website && (
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-5 w-5 text-gray-500" />
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isViewingOwnProfile ? "My Events" : "Organized Events"}
            </h2>
            {canEdit && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Event
              </Link>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {isViewingOwnProfile
                  ? "No events created yet"
                  : "No events organized yet"}
              </h3>
              <p className="text-gray-500">
                {isViewingOwnProfile
                  ? "Create your first event to start making an impact!"
                  : "This organization hasn't organized any events yet."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.registrations?.length || 0} participants
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
