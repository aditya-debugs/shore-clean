import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Users,
  FileText,
  Calendar,
  Mail,
  Save,
  Loader,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isOrganizer } from "../utils/roleUtils";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OrganizationDetailsForm = () => {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    organizationName: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    website: "",
    foundedYear: "",
    teamSize: "",
    mission: "",
    specializations: "",
  });

  // Redirect if user is not an organizer
  useEffect(() => {
    if (currentUser && !isOrganizer(currentUser)) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Load existing organization data if available
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!currentUser?._id) return;

      try {
        setLoading(true);
        const response = await api.get(
          `/organizations/profile/${currentUser._id}`
        );
        if (response.data) {
          setFormData(response.data);
        }
      } catch (error) {
        // If no profile exists yet, that's fine - user is filling it for first time
        console.log("No existing organization profile found");
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "organizationName",
      "description",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "phone",
      "foundedYear",
      "teamSize",
      "mission",
    ];

    for (const field of requiredFields) {
      const value = formData[field];

      // Check if field is empty or undefined
      if (!value) {
        return `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }

      // For string fields, also check if they're just whitespace
      if (typeof value === "string" && value.trim() === "") {
        return `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post("/organizations/profile", formData);
      console.log("Organization profile saved successfully:", response.data);

      // Update user in AuthContext and localStorage with profile completion flag
      updateCurrentUser({
        hasCompletedProfile: true,
        organizationId: response.data._id,
      });

      console.log("User updated with profile completion");
      setSuccess(true);

      // Redirect to home after 1 second (shorter delay)
      setTimeout(() => {
        console.log("Attempting to navigate to home page");
        navigate("/", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Error saving organization profile:", error);
      setError(
        error.response?.data?.message || "Failed to save organization details"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Navbar />
        <div className="pt-32 flex justify-center items-center">
          <Loader className="h-10 w-10 animate-spin text-cyan-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Navbar />
        <div className="pt-32 pb-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Profile Completed Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Your organization profile has been saved. Redirecting you to the
                home page...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Complete Your{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Organization Profile
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Tell us about your organization to get started with ShoreClean
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Organization Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 mr-2 text-cyan-500" />
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter organization name"
                  required
                />
              </div>

              {/* Founded Year */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-cyan-500" />
                  Founded Year *
                </label>
                <input
                  type="number"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 2020"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-cyan-500" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., +1 (555) 123-4567"
                  required
                />
              </div>

              {/* Website */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://yourorganization.com"
                />
              </div>

              {/* Team Size */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 mr-2 text-cyan-500" />
                  Team Size *
                </label>
                <select
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select team size</option>
                  <option value="1-10">1-10 people</option>
                  <option value="11-50">11-50 people</option>
                  <option value="51-200">51-200 people</option>
                  <option value="201-1000">201-1000 people</option>
                  <option value="1000+">1000+ people</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter city"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter state"
                  required
                />
              </div>

              {/* Zip Code */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                  Zip Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter zip code"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter country"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter complete address"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 mr-2 text-cyan-500" />
                Organization Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe your organization and its work"
                required
              />
            </div>

            {/* Mission */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 mr-2 text-cyan-500" />
                Mission Statement *
              </label>
              <textarea
                name="mission"
                value={formData.mission}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                placeholder="What is your organization's mission?"
                required
              />
            </div>

            {/* Specializations */}
            <div className="mb-8">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 mr-2 text-cyan-500" />
                Areas of Specialization
              </label>
              <textarea
                name="specializations"
                value={formData.specializations}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Marine conservation, Beach cleanup, Ocean research, Environmental education"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Complete Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default OrganizationDetailsForm;
