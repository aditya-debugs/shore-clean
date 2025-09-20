import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Mail,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Edit3,
  MessageCircle,
  ArrowLeft,
  Loader,
  Phone,
  Globe,
  FileText,
  Award,
  TrendingUp,
  CheckCircle,
  Target,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isVolunteer, isOrganizer } from "../utils/roleUtils";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { safeArray, safeGet } from "../utils/devUtils";

const Organization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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
      // First try to get organization profile
      const orgResponse = await api.get(`/organizations/profile/${id}`);
      console.log("Organization profile response:", orgResponse.data);
      setOrganization(orgResponse.data);
    } catch (err) {
      // If no organization profile, try getting user data
      try {
        const userResponse = await api.get(`/auth/user/${id}`);
        console.log("User response:", userResponse.data);
        setOrganization(userResponse.data);
      } catch (userErr) {
        setError("Failed to load organization details");
        console.error("Error fetching organization:", err, userErr);
      }
    }
  };

  const fetchOrganizationEvents = async () => {
    try {
      console.log("Fetching events for organization ID:", id);
      const response = await api.get(`/events?organizer=${id}`);
      console.log("Events API response:", response.data);
      // Handle the API response structure { page, limit, events }
      const eventsData = response.data.events || [];
      console.log("Events data after processing:", eventsData);
      console.log("Number of events found:", eventsData.length);
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching organization events:", err);
      console.error("Error details:", err.response?.data);
      // Set empty array on error to prevent map errors
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = () => {
    navigate("/chat");
  };

  const handleEditProfile = () => {
    navigate("/organization-details");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader className="h-6 w-6 animate-spin text-cyan-500" />
            <span className="text-lg text-gray-700">
              Loading organization...
            </span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Organization Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The organization you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isViewingOwnProfile =
    currentUser?._id === organization.userId?._id ||
    currentUser?._id === organization._id;
  const canEdit = isViewingOwnProfile && isOrganizer(currentUser);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-cyan-600 hover:text-cyan-800 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </button>
          </div>

          {/* Organization Hero Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
            {/* Cover Photo */}
            <div className="h-64 bg-gradient-to-r from-cyan-500 to-blue-500 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <h1 className="text-4xl font-bold mb-2">
                  {organization.organizationName || organization.name}
                </h1>
                {organization.verified && (
                  <div className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified Organization
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              {/* Organization Logo and Basic Info */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="relative -mt-16">
                  {organization.logo ? (
                    <img
                      src={organization.logo}
                      alt={organization.organizationName || organization.name}
                      className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                        {organization.description ||
                          "Environmental conservation organization"}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Founded{" "}
                            {organization.foundedYear ||
                              new Date(organization.createdAt).getFullYear()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {organization.teamSize || "Team size not specified"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Member since{" "}
                            {new Date(
                              organization.createdAt ||
                                organization.userId?.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {isVolunteer(currentUser) && !isViewingOwnProfile && (
                        <button
                          onClick={handleJoinCommunity}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Join Community
                        </button>
                      )}

                      {canEdit && (
                        <button
                          onClick={handleEditProfile}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Mission & About */}
            <div className="lg:col-span-2 space-y-8">
              {/* Mission Statement */}
              {organization.mission && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <Target className="h-6 w-6 text-cyan-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {organization.mission}
                  </p>
                </div>
              )}

              {/* About & Specializations */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-cyan-500 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">About Us</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {organization.description ||
                    "This organization is committed to environmental conservation and marine protection."}
                </p>

                {organization.specializations && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Areas of Specialization
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {organization.specializations}
                    </p>
                  </div>
                )}
              </div>

              {/* Impact Metrics */}
              {organization.impactMetrics && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <TrendingUp className="h-6 w-6 text-cyan-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      Environmental Impact
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                      <div className="text-3xl font-bold text-cyan-600 mb-2">
                        {organization.impactMetrics.wasteCollected || 0}kg
                      </div>
                      <div className="text-gray-600">Waste Collected</div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {organization.impactMetrics.coastlineCleaned || 0}km
                      </div>
                      <div className="text-gray-600">Coastline Cleaned</div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {organization.impactMetrics.volunteersEngaged || 0}
                      </div>
                      <div className="text-gray-600">Volunteers Engaged</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact & Details Sidebar */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <Mail className="h-6 w-6 text-cyan-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Contact Info
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-gray-700">
                        {organization.userId?.email || organization.email}
                      </div>
                    </div>
                  </div>

                  {organization.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="text-gray-700">
                          {organization.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {organization.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Website</div>
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:text-cyan-800 transition-colors flex items-center"
                        >
                          Visit Website
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}

                  {(organization.address || organization.city) && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="text-gray-700">
                          {organization.address && (
                            <div>{organization.address}</div>
                          )}
                          {(organization.city || organization.state) && (
                            <div>
                              {organization.city}
                              {organization.city && organization.state && ", "}
                              {organization.state} {organization.zipCode}
                            </div>
                          )}
                          {organization.country && (
                            <div>{organization.country}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <Award className="h-6 w-6 text-cyan-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Organization Stats
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Events Organized</span>
                    <span className="text-xl font-semibold text-gray-800">
                      {(events || []).length}
                    </span>
                  </div>

                  {organization.foundedYear && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Founded</span>
                      <span className="text-xl font-semibold text-gray-800">
                        {organization.foundedYear}
                      </span>
                    </div>
                  )}

                  {organization.teamSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Team Size</span>
                      <span className="text-xl font-semibold text-gray-800">
                        {organization.teamSize}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="text-xl font-semibold text-gray-800">
                      {new Date(
                        organization.createdAt || organization.userId?.createdAt
                      ).getFullYear()}
                    </span>
                  </div>

                  {organization.verified && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="font-semibold">Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media Links */}
              {organization.socialMedia && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <Heart className="h-6 w-6 text-cyan-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Follow Us
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {organization.socialMedia.facebook && (
                      <a
                        href={organization.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Facebook
                      </a>
                    )}

                    {organization.socialMedia.twitter && (
                      <a
                        href={organization.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Twitter
                      </a>
                    )}

                    {organization.socialMedia.instagram && (
                      <a
                        href={organization.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    )}

                    {organization.socialMedia.linkedin && (
                      <a
                        href={organization.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-cyan-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {isViewingOwnProfile ? "My Events" : "Organized Events"}
                </h2>
              </div>
              {canEdit && (
                <Link
                  to="/admin/create-event"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              )}
            </div>

            {(events || []).length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-600 mb-3">
                  {isViewingOwnProfile
                    ? "No events created yet"
                    : "No events organized yet"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {isViewingOwnProfile
                    ? "Create your first event to start making an impact in your community!"
                    : "This organization hasn't organized any events yet. Check back soon!"}
                </p>
                {canEdit && (
                  <Link
                    to="/admin/create-event"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-6"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(events || []).slice(0, 3).map((event, idx) => (
                    <div key={event._id} className="relative">
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-white rounded-2xl shadow-lg transition-all duration-500 overflow-hidden border border-gray-100 group transform hover:scale-105 hover:shadow-2xl hover:border-cyan-400 animate-fade-in block"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div
                          className="h-32 bg-cover bg-center relative"
                          style={{
                            backgroundImage: `url(${
                              event.bannerUrl ||
                              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                            })`,
                          }}
                        >
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                          <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-cyan-600 shadow-md backdrop-blur">
                            {new Date(
                              event.startDate || event.date
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between min-h-[180px]">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 tracking-tight line-clamp-2">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2 text-sm min-h-[2.5em]">
                              {event.description}
                            </p>
                            <div className="flex items-center text-gray-600 mb-3">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium line-clamp-1">
                                {event.location}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-cyan-500">
                                <Users className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">
                                  {event.attendees?.length ||
                                    event.registrations?.length ||
                                    0}{" "}
                                  joined
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                by {event.organizer?.name || "Organizer"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* View All Events Button - Show if there are more than 3 events */}
                {events.length > 3 && (
                  <div className="text-center mt-8">
                    <Link
                      to={`/events?organizer=${id}`}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <Calendar className="h-5 w-5 mr-3" />
                      View All Events ({events.length})
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Organization;
