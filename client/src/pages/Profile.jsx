import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Calendar, Shield, Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setProfileData(response.data);
      setEditData({
        name: response.data.name,
        email: response.data.email
      });
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        // Token is invalid or expired, logout and redirect to login
        setError('Your session has expired. Please login again.');
        logout();
        // The PrivateRoute will automatically redirect to login
      } else {
        setError('Failed to load profile data');
      }
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditData({
        name: profileData.name,
        email: profileData.email
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      // You can add a PUT /auth/profile endpoint later for updating profile
      // For now, just toggle edit mode off
      setIsEditing(false);
      // await api.put('/auth/profile', editData);
      // await fetchProfile();
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      org: 'bg-purple-100 text-purple-800 border-purple-200',
      user: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const roleNames = {
      admin: 'Administrator',
      org: 'Organization',
      user: 'Volunteer'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${roleStyles[role] || roleStyles.user}`}>
        <Shield className="w-4 h-4 inline mr-1" />
        {roleNames[role] || 'Volunteer'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 pt-24 pb-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p>{error}</p>
              {error.includes('session has expired') && (
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Go to Login
                </button>
              )}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-cyan-600" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">
                      {profileData?.name || currentUser?.name || 'User'}
                    </h1>
                    <p className="text-cyan-100 mt-1">
                      {profileData?.email || currentUser?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getRoleBadge(profileData?.role || currentUser?.role)}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="max-w-2xl mx-auto">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                <button
                  onClick={isEditing ? handleSave : handleEditToggle}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={handleEditToggle}
                    className="ml-2 flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {profileData?.name || currentUser?.name || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {profileData?.email || currentUser?.email || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Account Type
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    {getRoleBadge(profileData?.role || currentUser?.role)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Member Since
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {profileData?.createdAt ? formatDate(profileData.createdAt) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {!error?.includes('session has expired') && (
              <button 
                onClick={() => {/* Navigate to settings */}}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium"
              >
                Account Settings
              </button>
            )}
            <button 
              onClick={logout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;