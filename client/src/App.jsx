import React from "react";
import DonationSuccess from "./pages/DonationSuccess";
import {
  Route,
  Routes,
  BrowserRouter,
  useLocation,
  Link,
} from "react-router-dom";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventManagement from "./pages/EventManagement";
import CreateEvent from "./pages/admin/CreateEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatCommunity from "./pages/ChatCommunity";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import Organization from "./pages/Organization";
import Donations from "./pages/Donations"; // ✅ import Donations page

// Temporary placeholder component for missing pages
const ComingSoon = ({ pageName }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{pageName}</h1>
      <p className="text-gray-600 mb-8">This page is coming soon!</p>
      <Link
        to="/"
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 inline-block"
      >
        Back to Home
      </Link>
    </div>
  </div>
);
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
          <Route path="/success" element={<DonationSuccess />} />

          {/* Protected Routes */}
          <Route
            path="/admin/create-event"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id/manage"
            element={
              <PrivateRoute>
                <EventManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ComingSoon pageName="Dashboard" />
              </PrivateRoute>
            }
          />

          {/* ✅ Replace ComingSoon with Donations page */}
          <Route
            path="/donations"
            element={
              <PrivateRoute>
                <Donations />
              </PrivateRoute>
            }
          />

          {/* Chat Community Route */}
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatCommunity />
              </PrivateRoute>
            }
          />

          <Route
            path="/certificates"
            element={
              <PrivateRoute>
                <ComingSoon pageName="Certificates" />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/organization/:id"
            element={
              <PrivateRoute>
                <Organization />
              </PrivateRoute>
            }
          />
          <Route path="/impact" element={<ComingSoon pageName="Impact" />} />
          <Route path="/about" element={<ComingSoon pageName="About" />} />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <Link
                    to="/"
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 inline-block"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
