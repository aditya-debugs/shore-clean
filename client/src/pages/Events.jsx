import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, MapPin, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../index.css";

const EVENTS_API = "/api/events";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);


  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${EVENTS_API}?page=${page}&limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        setEvents(data.events || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load events. Please try again later.");
        setLoading(false);
      });
  }, [page, limit]);

  const handleRSVP = async (eventId, alreadyRSVPed) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = alreadyRSVPed ? `${EVENTS_API}/${eventId}/cancel-rsvp` : `${EVENTS_API}/${eventId}/rsvp`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(alreadyRSVPed ? "Cancel RSVP failed" : "RSVP failed");
      const result = await res.json();
      setEvents((evts) =>
        evts.map((ev) =>
          ev._id === eventId ? { ...ev, attendees: result.event.attendees } : ev
        )
      );
    } catch {
      alert("Could not update RSVP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-900">
            Upcoming <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover and join coastal clean-up events near you. RSVP to secure your spot and make an impact!
          </p>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-500 py-12">
              {error}
              <div className="mt-4 text-sm text-gray-500">
                Please check your backend server and API route.<br />
                <span className="font-mono">GET /api/events</span> should return a list of events.<br />
                If you are running locally, make sure the server is started and CORS is configured if needed.
              </div>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="text-center py-12 bg-white/80 rounded-xl border border-gray-200/50 mb-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No upcoming events</h3>
              <p className="text-gray-500">Check back later for new coastal cleanup events.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event, idx) => (
                <div key={event._id} className="relative">
                  <Link
                    to={`/events/${event._id}`}
                    className="bg-white rounded-2xl shadow-lg transition-all duration-500 overflow-hidden border border-gray-100 group transform hover:scale-105 hover:shadow-2xl hover:border-cyan-400 animate-fade-in block"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div
                      className="h-48 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${event.bannerUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"})` }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                      <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-cyan-600 shadow-md backdrop-blur">
                        {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col justify-between min-h-[260px]">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2 min-h-[2.5em]">{event.description}</p>
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">{event.location}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-cyan-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{event.attendees?.length || 0} joined</span>
                          </div>
                          <div className="text-xs text-gray-500">by {event.organizer?.name || "Organizer"}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to={`/admin/create-event?edit=${event._id}`}
                    className="absolute top-4 left-4 z-10"
                  >
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold shadow hover:bg-cyan-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-xs cursor-pointer">
                      Update Event
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                className="p-2 rounded-full bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300 hover:bg-cyan-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 font-semibold text-cyan-700">Page {page} of {totalPages}</span>
              <button
                className="p-2 rounded-full bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300 hover:bg-cyan-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Events;