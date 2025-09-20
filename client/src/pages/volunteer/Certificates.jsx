import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Download,
  Calendar,
  ArrowLeft,
  Loader,
  Star,
  Trophy,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { isVolunteer } from "../../utils/roleUtils";

const VolunteerCertificates = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not a volunteer
  useEffect(() => {
    if (currentUser && !isVolunteer(currentUser)) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        // Mock certificates data - replace with actual API call
        const mockCertificates = [
          {
            id: 1,
            title: "Coastal Cleanup Volunteer",
            eventName: "Beach Cleanup - Santa Monica",
            dateEarned: "2024-03-15",
            type: "participation",
            downloadUrl: "/certificates/cert-1.pdf",
          },
          {
            id: 2,
            title: "Environmental Champion",
            eventName: "Multiple Events Completion",
            dateEarned: "2024-02-20",
            type: "achievement",
            downloadUrl: "/certificates/cert-2.pdf",
          },
          {
            id: 3,
            title: "Ocean Guardian",
            eventName: "Pier Cleanup - Long Beach",
            dateEarned: "2024-01-10",
            type: "participation",
            downloadUrl: "/certificates/cert-3.pdf",
          },
        ];

        setCertificates(mockCertificates);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCertificates();
    }
  }, [currentUser]);

  const handleDownload = (certificate) => {
    // In a real app, this would download the actual certificate
    alert(`Downloading certificate: ${certificate.title}`);
  };

  const getCertificateIcon = (type) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case "participation":
        return <Award className="h-8 w-8 text-blue-500" />;
      default:
        return <Star className="h-8 w-8 text-purple-500" />;
    }
  };

  const getCertificateColor = (type) => {
    switch (type) {
      case "achievement":
        return "border-yellow-200 bg-yellow-50";
      case "participation":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-purple-200 bg-purple-50";
    }
  };

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
              My Certificates
            </h1>
            <p className="text-xl text-gray-600">
              Recognition for your volunteer contributions to coastal
              conservation
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Certificates
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certificates.length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-cyan-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Participation Certs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      certificates.filter((c) => c.type === "participation")
                        .length
                    }
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Achievement Certs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      certificates.filter((c) => c.type === "achievement")
                        .length
                    }
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-500 mb-6">
                Participate in events to earn certificates and recognition!
              </p>
              <button
                onClick={() => navigate("/events")}
                className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className={`bg-white rounded-xl shadow-lg border-2 ${getCertificateColor(
                    certificate.type
                  )} overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getCertificateIcon(certificate.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {certificate.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {certificate.eventName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Earned on{" "}
                            {new Date(
                              certificate.dateEarned
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(certificate)}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>

                    {/* Certificate Preview/Badge */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Certificate of {certificate.type}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {certificate.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Presented to {currentUser.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Information Section */}
          <div className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About Certificates
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  Participation Certificates
                </h3>
                <p className="text-gray-600 text-sm">
                  Earned by attending and completing volunteer events. These
                  recognize your contribution to coastal conservation efforts.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Achievement Certificates
                </h3>
                <p className="text-gray-600 text-sm">
                  Special recognition for milestones like attending multiple
                  events, leadership roles, or exceptional contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VolunteerCertificates;
