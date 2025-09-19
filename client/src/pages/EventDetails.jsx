import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, MapPin, Loader, ArrowLeft, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  // Ratings
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    const events = JSON.parse(localStorage.getItem("events")) || [];
    const found = events.find((ev) => ev._id === id);

    if (found) {
      setEvent(found);

      // Load ratings
      const ratings = JSON.parse(localStorage.getItem("ratings")) || {};
      if (ratings[id]) {
        const { userRatings } = ratings[id];
        const userRating = userRatings[userId] || 0;
        setRating(userRating);

        const values = Object.values(userRatings);
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          setAvgRating(avg);
        }
      }

      // Load comments
      const allComments = JSON.parse(localStorage.getItem("comments")) || {};
      setComments(allComments[id] || []);
    } else {
      setError("Event not found.");
    }

    setLoading(false);
  }, [id, userId]);

  const handleRSVP = async (alreadyRSVPed) => {
    if (!event) return;
    try {
      const endpoint = alreadyRSVPed
        ? `/api/events/${event._id}/cancel-rsvp`
        : `/api/events/${event._id}/rsvp`;
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error(alreadyRSVPed ? "Cancel RSVP failed" : "RSVP failed");
      const result = await res.json();
      setEvent(result.event);
    } catch {
      alert("Could not update RSVP. Please try again.");
    }
  };

  const handleRatingChange = (newValue) => {
    setRating(newValue);

    const ratings = JSON.parse(localStorage.getItem("ratings")) || {};
    if (!ratings[id]) ratings[id] = { userRatings: {} };
    ratings[id].userRatings[userId] = newValue;

    const values = Object.values(ratings[id].userRatings);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    setAvgRating(avg);

    localStorage.setItem("ratings", JSON.stringify(ratings));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const allComments = JSON.parse(localStorage.getItem("comments")) || {};
    if (!allComments[id]) allComments[id] = [];

    const newEntry = {
      id: Date.now().toString(),
      userId,
      text: newComment,
    };

    allComments[id].push(newEntry);
    setComments(allComments[id]);
    localStorage.setItem("comments", JSON.stringify(allComments));
    setNewComment("");
  };

  const handleDeleteComment = (commentId) => {
    const allComments = JSON.parse(localStorage.getItem("comments")) || {};
    if (allComments[id]) {
      allComments[id] = allComments[id].filter((c) => c.id !== commentId);
      setComments(allComments[id]);
      localStorage.setItem("comments", JSON.stringify(allComments));
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
                  className={`absolute top-4 left-6 px-4 py-1 rounded-full text-sm font-semibold shadow-md backdrop-blur ${statusColors[event.status]}`}
                >
                  {event.status}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>

              {/* Rating */}
              <Box sx={{ mb: 3 }}>
                <Typography component="legend" className="text-lg font-semibold">
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

              {/* Info */}
              <div className="flex flex-wrap gap-8 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg font-medium">{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-base">
                    {new Date(event.startDate).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {event.endDate
                      ? ` - ${new Date(event.endDate).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}`
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

              {/* Comments Section */}
              <div className="mt-8 border-t pt-4">
                <h2 className="text-xl font-semibold mb-3">Comments</h2>
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center bg-white p-2 rounded-lg shadow mb-2"
                  >
                    <span className="text-gray-800">{c.text}</span>
                    {c.userId === userId && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
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

              {/* RSVP */}
              {userId &&
                (event.attendees?.includes(userId) ? (
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
                ))}
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventDetails;
