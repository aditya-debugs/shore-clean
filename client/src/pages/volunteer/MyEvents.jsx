import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowLeft,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { isVolunteer } from "../../utils/roleUtils";
import { getEvents, cancelRsvpForEvent } from "../../utils/api";

const MyEvents = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, past

  // Redirect if not a volunteer
  useEffect(() => {
    if (currentUser && !isVolunteer(currentUser)) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const events = await getEvents();
        // Filter events user has RSVP'd to
        const userEvents = events.filter(
          (event) =>
            event.attendees && event.attendees.includes(currentUser._id)
        );
        setMyEvents(userEvents);
      } catch (error) {
        console.error("Error fetching my events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMyEvents();
    }
  }, [currentUser]);

  const handleCancelRSVP = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your RSVP for this event?"
      )
    ) {
      return;
    }

    try {
      await cancelRsvpForEvent(eventId);
      // Remove event from my events list
      setMyEvents((prev) => prev.filter((event) => event._id !== eventId));
      alert("RSVP cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      alert("Failed to cancel RSVP. Please try again.");
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return myEvents.filter((event) => new Date(event.startDate) > now);
      case "past":
        return myEvents.filter((event) => new Date(event.startDate) <= now);
      default:
        return myEvents;
    }
  };

  const filteredEvents = getFilteredEvents();

  if (!currentUser || !isVolunteer(currentUser)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            className="flex items-center gap-2 mb-8 px-4 py-2 bg-white border border-cyan-200 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 font-semibold cursor-pointer"
            onClick={() => navigate("/volunteer/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              My Events
            </h1>
            <p className="text-xl text-gray-600">
              Events you've RSVP'd to and your volunteer history
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-cyan-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Events ({myEvents.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-cyan-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Upcoming (
              {
                myEvents.filter((e) => new Date(e.startDate) > new Date())
                  .length
              }
              )
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "past"
                  ? "bg-cyan-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Past (
              {
                myEvents.filter((e) => new Date(e.startDate) <= new Date())
                  .length
              }
              )
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {filter === "all"
                  ? "No events found"
                  : filter === "upcoming"
                  ? "No upcoming events"
                  : "No past events"}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === "all"
                  ? "You haven't RSVP'd to any events yet."
                  : filter === "upcoming"
                  ? "You don't have any upcoming events."
                  : "You haven't attended any events yet."}
              </p>
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event) => {
                const isUpcoming = new Date(event.startDate) > new Date();
                const isPast = new Date(event.startDate) <= new Date();

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {event.title}
                            </h3>
                            {isUpcoming && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Upcoming
                              </span>
                            )}
                            {isPast && (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.startDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(event.startDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.attendees?.length || 0} volunteers
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Link
                            to={`/events/${event._id}`}
                            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                          >
                            View Details
                          </Link>
                          {isUpcoming && (
                            <button
                              onClick={() => handleCancelRSVP(event._id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel RSVP
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Event Status Bar */}
                      {isPast && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-800 text-sm font-medium">
                            ✅ Event completed! Thank you for volunteering.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyEvents;
