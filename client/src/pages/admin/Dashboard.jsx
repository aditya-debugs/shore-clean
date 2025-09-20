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
  Plus,
  BarChart3,
  Settings,
  UserCheck,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { isAdmin, isOrganizer } from "../../utils/roleUtils";
import { getEvents } from "../../utils/api";

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeVolunteers: 0,
    totalRegistrations: 0,
    completedEvents: 0,
  });

  // Redirect if not admin/organizer
  useEffect(() => {
    if (currentUser && !isAdmin(currentUser) && !isOrganizer(currentUser)) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);

        // Calculate stats
        const now = new Date();
        const completedEvents = eventsData.filter(event => new Date(event.endDate || event.startDate) < now);
        
        setStats({
          totalEvents: eventsData.length,
          activeVolunteers: 150, // Mock data - you can fetch from API
          totalRegistrations: 450, // Mock data
          completedEvents: completedEvents.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && (isAdmin(currentUser) || isOrganizer(currentUser))) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (!currentUser || (!isAdmin(currentUser) && !isOrganizer(currentUser))) {
    return null;
  }

  const recentEvents = events.slice(0, 3);

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
              Admin Dashboard 👋
            </h1>
            <p className="text-xl text-gray-600">
              Manage events, volunteers, and track your organization's impact.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Active Volunteers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeVolunteers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Registrations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRegistrations}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Completed Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedEvents}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Events */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-cyan-500" />
                  Recent Events
                </h2>
                <Link
                  to="/admin/create-event"
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Event
                </Link>
              </div>
              {recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event._id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
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
                        </div>
                        <Link
                          to={`/events/${event._id}/manage`}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
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
                  <p className="text-gray-500 mb-4">No events created yet.</p>
                  <Link
                    to="/admin/create-event"
                    className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-500" />
                Organization Metrics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">This Month's Events</span>
                  <span className="font-bold text-green-700">
                    {events.filter(e => {
                      const eventMonth = new Date(e.startDate).getMonth();
                      const currentMonth = new Date().getMonth();
                      return eventMonth === currentMonth;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Avg. Volunteers per Event</span>
                  <span className="font-bold text-blue-700">15</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700">Completion Rate</span>
                  <span className="font-bold text-yellow-700">92%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Total Impact Hours</span>
                  <span className="font-bold text-purple-700">1,350</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link
                to="/admin/create-event"
                className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors text-center"
              >
                <Plus className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Create Event</p>
              </Link>
              <Link
                to="/admin/volunteers"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Manage Volunteers</p>
              </Link>
              <Link
                to="/events"
                className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
              >
                <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">View All Events</p>
              </Link>
              <Link
                to="/admin/profile"
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Organization Settings</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
