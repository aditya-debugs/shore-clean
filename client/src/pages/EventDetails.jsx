import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  Loader,
  ArrowLeft,
  Trash2,
  Edit3,
  Save,
  X,
  User,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import {
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpForEvent,
  cancelRsvpForEvent,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { canEditEvent, canRSVPToEvents, isVolunteer } from "../utils/roleUtils";

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

  // Ratings (keeping localStorage for now since no backend implementation)
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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
    // Fetch ratings from MongoDB
    fetch(`/api/events/${id}/ratings`)
      .then((res) => res.json())
      .then((data) => {
        setRating(data.userRating || 0);
        setAvgRating(data.avgRating || 0);
      })
      .catch(() => {
        setRating(0);
        setAvgRating(0);
      });
  }, [id]);

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

  const handleRatingChange = async (newValue) => {
    setRating(newValue);
    try {
      const res = await fetch(`/api/events/${id}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newValue }),
      });
      const data = await res.json();
      setAvgRating(data.avgRating || newValue);
    } catch {
      // fallback: keep local rating
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment, userId: currentUser?._id }),
      });
      const data = await res.json();
      // If backend returns single comment, append; if array, replace
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments((prev) => [...prev, data]);
      }
      setNewComment("");
    } catch {
      // fallback: do nothing
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch {
      // fallback: do nothing
    }
  };

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
            <ArrowLeft className="h-5 w-5" /> Back to Events
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

              {/* Rating */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="legend"
                  className="text-lg font-semibold"
                >
                  Rate this Event
                </Typography>
                <Rating
                  name="event-rating"
                  value={rating}
                  onChange={(e, newValue) => handleRatingChange(newValue)}
                />
                {avgRating > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Average Rating: {avgRating.toFixed(1)} ⭐
                  </Typography>
                )}
              </Box>

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
                    <div className="mb-8">
                      <Link
                        to={`/organization/${
                          event.organizer._id || event.organizer
                        }`}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        <User className="h-5 w-5 mr-2" />
                        View Organization
                      </Link>
                    </div>
                  )}

                  {/* RSVP Button - Temporarily disabled */}
                  {/* {canRSVPToEvents(currentUser) && (
                    <div className="mb-8">
                      {event.attendees?.includes(currentUser._id) ? (
                        <button
                          onClick={() => handleRSVP(true)}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200"
                        >
                          Cancel RSVP
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRSVP(false)}
                          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors duration-200"
                        >
                          RSVP for Event
                        </button>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        {event.attendees?.length || 0} people have RSVP'd
                      </p>
                    </div>
                  )} */}
                </>
              )}

              {/* Comments Section */}
              <div className="mt-8 border-t pt-4">
                <h2 className="text-xl font-semibold mb-3">Comments</h2>
                {comments.map((c) => (
                  <div
                    key={c._id}
                    className="flex justify-between items-center bg-white p-2 rounded-lg shadow mb-2"
                  >
                    <span className="text-gray-800">{c.text}</span>
                    {String(c.userId) === String(currentUser?._id) && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex mt-3 gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
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
