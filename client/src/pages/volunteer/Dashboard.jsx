import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Award,
  Activity,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { isVolunteer } from "../../utils/roleUtils";
import { getEvents } from "../../utils/api";

const VolunteerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    eventsAttended: 0,
    hoursVolunteered: 0,
    certificatesEarned: 0,
    impactPoints: 0,
  });

  // Redirect if not a volunteer
  useEffect(() => {
    if (currentUser && !isVolunteer(currentUser)) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const events = await getEvents();
        setUpcomingEvents(events.slice(0, 3)); // Show first 3 upcoming events

        // Filter events user has RSVP'd to
        const userEvents = events.filter(
          (event) =>
            event.attendees && event.attendees.includes(currentUser._id)
        );
        setMyEvents(userEvents);

        // Calculate stats (mock data for now)
        setStats({
          eventsAttended: userEvents.length,
          hoursVolunteered: userEvents.length * 3, // Assuming 3 hours per event
          certificatesEarned: Math.floor(userEvents.length / 3), // 1 cert per 3 events
          impactPoints: userEvents.length * 25, // 25 points per event
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (!currentUser || !isVolunteer(currentUser)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            className="flex items-center gap-2 mb-8 px-4 py-2 bg-white border border-cyan-200 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 font-semibold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" /> Back to Home
          </button>

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Ready to make a difference in coastal conservation?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Events Attended
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.eventsAttended}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Hours Volunteered
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.hoursVolunteered}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Certificates
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.certificatesEarned}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Impact Points
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.impactPoints}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* My Events */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-cyan-500" />
                My Events
              </h2>
              {myEvents.length > 0 ? (
                <div className="space-y-4">
                  {myEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {myEvents.length > 3 && (
                    <Link
                      to="/volunteer/my-events"
                      className="block text-center py-2 text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      View all {myEvents.length} events →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    You haven't RSVP'd to any events yet.
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Browse Events
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-6 w-6 text-green-500" />
                Upcoming Events
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {event.attendees?.length || 0} volunteers signed up
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/events"
                    className="block text-center py-2 text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    View all events →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming events found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link
                to="/events"
                className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors text-center"
              >
                <Calendar className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Browse Events</p>
              </Link>
              <Link
                to="/volunteer/my-events"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">My Events</p>
              </Link>
              <Link
                to="/volunteer/certificates"
                className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
              >
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Certificates</p>
              </Link>
              <Link
                to="/profile"
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Profile</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VolunteerDashboard;
