import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  QrCode,
  ArrowLeft,
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Search,
  Calendar,
  MapPin,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QRScanner from '../components/QRScanner';
import { getEventById, getEventRegistrations } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { canEditEvent, isOrganizer } from '../utils/roleUtils';

const EventManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('checkin');

  // Redirect if not organizer
  useEffect(() => {
    if (currentUser && !isOrganizer(currentUser)) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventData, registrationData] = await Promise.all([
          getEventById(id),
          getEventRegistrations(id)
        ]);
        
        setEvent(eventData);
        setRegistrations(registrationData.registrations);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load event data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && isOrganizer(currentUser)) {
      fetchData();
    }
  }, [id, currentUser]);

  const openQRScanner = (mode) => {
    setScannerMode(mode);
    setShowQRScanner(true);
  };

  const handleScanSuccess = (result) => {
    // Refresh registrations data
    getEventRegistrations(id)
      .then((data) => {
        setRegistrations(data.registrations);
      })
      .catch(console.error);
    
    alert(`Volunteer ${scannerMode === 'checkin' ? 'checked in' : 'checked out'} successfully!`);
  };

  const exportRegistrations = () => {
    const csvContent = [
      'Name,Email,Status,Registered At,Checked In,Checked Out',
      ...filteredRegistrations.map(reg => 
        `"${reg.user.name}","${reg.user.email}","${reg.status}","${new Date(reg.createdAt).toLocaleString()}","${reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : 'Not checked in'}","${reg.checkedOutAt ? new Date(reg.checkedOutAt).toLocaleString() : 'Not checked out'}"`
      )
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title}-registrations.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    registered: 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-green-100 text-green-800',
    'checked-out': 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    registered: Clock,
    'checked-in': CheckCircle,
    'checked-out': CheckCircle,
    cancelled: XCircle
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Navbar />
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <Loader className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Navbar />
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-red-500 py-12">{error}</div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            className="flex items-center gap-2 mb-8 px-4 py-2 bg-white border border-cyan-200 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 font-semibold cursor-pointer"
            onClick={() => navigate(`/events/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" /> Back to Event Details
          </button>

          {/* Event Header */}
          {event && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{registrations.length} registered volunteers</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openQRScanner('checkin')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <QrCode className="h-4 w-4" />
                    Check In
                  </button>
                  <button
                    onClick={() => openQRScanner('checkout')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <QrCode className="h-4 w-4" />
                    Check Out
                  </button>
                  <button
                    onClick={exportRegistrations}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
                <div className="text-sm text-gray-600">Total Registered</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {registrations.filter(r => r.status === 'checked-in').length}
                </div>
                <div className="text-sm text-gray-600">Checked In</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {registrations.filter(r => r.status === 'checked-out').length}
                </div>
                <div className="text-sm text-gray-600">Checked Out</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {registrations.filter(r => r.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="registered">Registered</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Registrations List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Volunteer Registrations ({filteredRegistrations.length})
              </h2>
            </div>
            
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No registrations found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters.' 
                    : 'No volunteers have registered for this event yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volunteer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegistrations.map((registration) => {
                      const StatusIcon = statusIcons[registration.status];
                      return (
                        <tr key={registration._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {registration.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {registration.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[registration.status]}`}>
                              <StatusIcon className="h-3 w-3" />
                              {registration.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.checkedInAt 
                              ? new Date(registration.checkedInAt).toLocaleString()
                              : '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.checkedOutAt 
                              ? new Date(registration.checkedOutAt).toLocaleString()
                              : '-'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <QRScanner
        eventId={id}
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onSuccess={handleScanSuccess}
        mode={scannerMode}
      />
      
      <Footer />
    </div>
  );
};

export default EventManagement;