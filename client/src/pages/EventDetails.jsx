import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  Loader,
  ArrowLeft,
  Edit3,
  Save,
  X,
  User,
  QrCode,
  Download,
  CheckCircle,
   Star,
  Heart,
  Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import QRCode from "../components/QRCode";
import Comments from "../components/Comments";
import StarRating from "../components/StarRating";
import {
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpForEvent,
  cancelRsvpForEvent,
  registerForEvent,
  getRegistrationStatus,
  cancelRegistration,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { canEditEvent, canRSVPToEvents, isVolunteer } from "../utils/roleUtils";
import api from "../utils/api";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Ratings
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Registration state
  const [registration, setRegistration] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch event details using API function
        const eventData = await getEventById(id);
        setEvent(eventData);
        setEditFormData(eventData); // Initialize edit form with current data
        setLoading(false);
      } catch (err) {
        setError("Event not found.");
        setLoading(false);
      }
    };

    fetchEventData();

    // Fetch comments from MongoDB
    fetch(`/api/comments/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => setComments([]));

    // Check registration status if user is a volunteer
    if (currentUser && isVolunteer(currentUser)) {
      getRegistrationStatus(id)
        .then((data) => {
          if (data.registered) {
            setRegistration(data.registration);
          }
        })
        .catch(() => {
          // User is not registered, which is fine
        });
    }
  }, [id, currentUser]);

  // Separate useEffect for ratings that depends on currentUser
  useEffect(() => {
    const fetchEventRatings = async () => {
      if (!id) return;

      try {
        const ratingsResponse = await api.get(`/ratings/event/${id}/average`);
        setAvgRating(ratingsResponse.data.average || 0);
        setTotalRatings(ratingsResponse.data.count || 0);

        // Fetch user's rating if authenticated and currentUser is available
        if (currentUser?._id) {
          const userRatingResponse = await api.get(
            `/ratings/event/${id}/user?userId=${currentUser._id}`
          );
          setUserRating(userRatingResponse.data.rating || 0);
        }
      } catch (error) {
        console.log("No ratings found or error fetching ratings");
      }
    };

    fetchEventRatings();
  }, [id, currentUser]);

  const handleRSVP = async (alreadyRSVPed) => {
    if (!event || !currentUser) return;

    try {
      const result = alreadyRSVPed
        ? await cancelRsvpForEvent(event._id)
        : await rsvpForEvent(event._id);
      setEvent(result.event);
    } catch (error) {
      console.error("RSVP error:", error);
      alert("Could not update RSVP. Please try again.");
    }
  };

  const handleRegister = async () => {
    if (!event || !currentUser) return;

    setRegistrationLoading(true);
    try {
      const result = await registerForEvent(event._id);
      setRegistration(result.registration);
      setShowQR(true);
      alert("Successfully registered for the event! Your QR code has been generated.");
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Could not register for event. Please try again.";
      alert(message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event || !currentUser || !registration) return;

    const confirmCancel = window.confirm("Are you sure you want to cancel your registration for this event?");
    if (!confirmCancel) return;

    try {
      await cancelRegistration(event._id);
      setRegistration(null);
      setShowQR(false);
      alert("Your registration has been cancelled.");
    } catch (error) {
      console.error("Cancel registration error:", error);
      const message = error.response?.data?.message || "Could not cancel registration. Please try again.";
      alert(message);
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#qr-code canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `event-${event.title}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  const handleRating = async (newRating) => {
    if (ratingLoading || !currentUser?._id) return;

    setRatingLoading(true);
    try {
      await api.post("/ratings", {
        eventId: id,
        rating: newRating,
        userId: currentUser._id,
      });

      setUserRating(newRating);

      // Refetch ratings to update average
      const ratingsResponse = await api.get(`/ratings/event/${id}/average`);
      setAvgRating(ratingsResponse.data.average || 0);
      setTotalRatings(ratingsResponse.data.count || 0);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Could not submit rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditFormData({ ...event });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ ...event });
  };

  const handleFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updatedEvent = await updateEvent(event._id, editFormData);
      setEvent(updatedEvent);
      setIsEditing(false);
      alert("Event updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteEvent(event._id);
      alert("Event deleted successfully!");
      navigate("/events");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  // Helper function to check if current user can edit/delete the event
  const canEditEventCheck = canEditEvent(currentUser, event);

  const statusColors = {
    draft: "bg-gray-200 text-gray-700",
    published: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <button
            className="flex items-center gap-2 mb-8 px-4 py-2 bg-white border border-cyan-200 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 font-semibold cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" /> Go back
          </button>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : event ? (
            <div className="w-full animate-fade-in">
              {/* Banner */}
              <div
                className="w-full h-64 md:h-80 bg-cover bg-center mb-8 relative rounded-2xl"
                style={{
                  backgroundImage: `url(${
                    event.bannerUrl ||
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                  })`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-4 left-6 flex flex-wrap gap-2">
                  {event.tags &&
                    event.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold shadow"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
                <span
                  className={`absolute top-4 left-6 px-4 py-1 rounded-full text-sm font-semibold shadow-md backdrop-blur ${
                    statusColors[event.status]
                  }`}
                >
                  {event.status}
                </span>
              </div>

              {/* Title and Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-0">
                  {event.title}
                </h1>

                {/* Edit and Delete buttons for organizers/admins */}
                {canEditEventCheck && (
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <>
                        <Link
                          to={`/events/${event._id}/manage`}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          <Users className="h-4 w-4" />
                          Manage Volunteers
                        </Link>
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Event
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Event
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Form or Event Details */}
              {isEditing ? (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title
                      </label>
                      <input
                        type="text"
                        value={editFormData.title || ""}
                        onChange={(e) =>
                          handleFormChange("title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editFormData.location || ""}
                        onChange={(e) =>
                          handleFormChange("location", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          editFormData.startDate
                            ? new Date(editFormData.startDate)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          handleFormChange("startDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          editFormData.endDate
                            ? new Date(editFormData.endDate)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          handleFormChange("endDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={editFormData.capacity || ""}
                        onChange={(e) =>
                          handleFormChange(
                            "capacity",
                            parseInt(e.target.value) || ""
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editFormData.status || "published"}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editFormData.description || ""}
                        onChange={(e) =>
                          handleFormChange("description", e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banner URL
                      </label>
                      <input
                        type="url"
                        value={editFormData.bannerUrl || ""}
                        onChange={(e) =>
                          handleFormChange("bannerUrl", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Info */}
                  <div className="flex flex-wrap gap-8 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="text-lg font-medium">
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span className="text-base">
                        {new Date(event.startDate).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {event.endDate
                          ? ` - ${new Date(event.endDate).toLocaleString(
                              "en-US",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span className="text-base">
                        Capacity: {event.capacity || "Unlimited"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Description
                    </h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* View Organization Button for Volunteers */}
                  {isVolunteer(currentUser) && event.organizer && (
                    <div className="mb-8 space-y-4">
                      <Link
                        to={`/organization/${
                          event.organizer._id || event.organizer
                        }`}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        <User className="h-5 w-5 mr-2" />
                        View Organization
                      </Link>

                      {/* Donate Now Button - Only visible to volunteers */}
                      <div>
                        <Link
                          to="/donations"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          Donate Now
                        </Link>
                        <p className="text-sm text-gray-600 mt-2">
                          Support environmental conservation efforts
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Volunteer Registration Section */}
                  {isVolunteer(currentUser) && (
                    <div className="mb-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan-600" />
                        Volunteer Registration
                      </h3>
                      
                      {registration ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-600 mb-4">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">You are registered for this event!</span>
                          </div>
                          
                          {/* Registration Status */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Status: <span className="font-medium text-green-700 capitalize">{registration.status}</span></p>
                                <p className="text-sm text-gray-600">Registered: {new Date(registration.createdAt).toLocaleDateString()}</p>
                                {registration.checkedInAt && (
                                  <p className="text-sm text-gray-600">Checked In: {new Date(registration.checkedInAt).toLocaleString()}</p>
                                )}
                                {registration.checkedOutAt && (
                                  <p className="text-sm text-gray-600">Checked Out: {new Date(registration.checkedOutAt).toLocaleString()}</p>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowQR(!showQR)}
                                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                                >
                                  <QrCode className="h-4 w-4" />
                                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                                </button>
                                
                                <button
                                  onClick={handleCancelRegistration}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                  Cancel Registration
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* QR Code Display */}
                          {showQR && registration.qrCode && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                              <h4 className="text-lg font-medium text-gray-900 mb-4">Your Event QR Code</h4>
                              <div className="flex justify-center mb-4" id="qr-code">
                                <QRCode 
                                  value={registration.qrCode} 
                                  size={200}
                                  level="M"
                                  includeMargin={true}
                                />
                              </div>
                              <p className="text-sm text-gray-600 mb-4">
                                Present this QR code to event organizers for check-in and check-out.
                              </p>
                              <button
                                onClick={downloadQR}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
                              >
                                <Download className="h-4 w-4" />
                                Download QR Code
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-600 mb-4">
                            Register as a volunteer for this event to receive your unique QR code for check-in.
                          </p>
                          <button
                            onClick={handleRegister}
                            disabled={registrationLoading}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white rounded-lg font-semibold transition-colors duration-200"
                          >
                            {registrationLoading ? 'Registering...' : 'Register as Volunteer'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Rating Section */}
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Rate this Event
                  </h2>
                  {avgRating > 0 && (
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <StarRating
                          rating={avgRating}
                          readOnly={true}
                          size="sm"
                        />
                        <span className="text-lg font-semibold text-gray-700">
                          {avgRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {totalRatings}{" "}
                        {totalRatings === 1 ? "rating" : "ratings"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
                  <p className="text-gray-700 mb-4 text-center">
                    How would you rate this event?
                  </p>
                  <div className="flex justify-center">
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRating}
                      readOnly={ratingLoading}
                      size="lg"
                    />
                  </div>
                  {userRating > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-3">
                      You rated this event {userRating}{" "}
                      {userRating === 1 ? "star" : "stars"}
                    </p>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <Comments eventId={id} />
              </div>

              {/* RSVP - Temporarily disabled */}
              {/* {canRSVPToEvents(currentUser) &&
                (event.attendees?.includes(currentUser._id) ? (
                  <button
                    className="w-full mt-6 px-4 py-3 bg-cyan-100 text-cyan-600 rounded-xl border border-cyan-300 font-bold cursor-pointer hover:bg-cyan-200 transition-all duration-300 shadow-lg"
                    onClick={() => handleRSVP(true)}
                  >
                    Cancel RSVP
                  </button>
                ) : (
                  <button
                    className="w-full mt-6 px-4 py-3 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-all duration-300 font-bold shadow-lg"
                    onClick={() => handleRSVP(false)}
                  >
                    RSVP
                  </button>
                ))} */}
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventDetails;