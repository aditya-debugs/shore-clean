// App.jsx - Updated main app component with routing to chat
import { useState } from "react";
import ChatCommunity from "./pages/ChatCommunity";import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "chat":
        return <ChatCommunity />;
      case "home":
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center p-8">
              {/* ShoreClean Logo/Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  🌊 ShoreClean
                </h1>
                <p className="text-lg text-gray-600">
                  Protecting Our Coastal Heritage
                </p>
              </div>

              {/* Demo Description */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Community Chat Demo
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Experience our real-time chat feature that connects volunteers
                  and organizers. Join event-specific conversations or
                  participate in organization-wide discussions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      🏖️ Event Chat
                    </h3>
                    <p className="text-sm text-blue-700">
                      Coordinate with fellow volunteers for specific cleanup
                      events
                    </p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-teal-900 mb-2">
                      🌊 Organization Chat
                    </h3>
                    <p className="text-sm text-teal-700">
                      Connect with the broader ShoreClean community
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentPage("chat")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105 font-semibold"
                >
                  Try Community Chat
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl mb-2">💬</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Real-time Messaging
                  </h3>
                  <p className="text-sm text-gray-600">
                    Instant communication with Socket.io
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Online Presence
                  </h3>
                  <p className="text-sm text-gray-600">
                    See who's online and typing indicators
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl mb-2">📱</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Mobile Friendly
                  </h3>
                  <p className="text-sm text-gray-600">
                    Responsive design for all devices
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
<<<<<<< HEAD
    <div className="App">
      {currentPage === "chat" && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setCurrentPage("home")}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white shadow-sm border border-gray-200 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Home</span>
          </button>
        </div>
      )}
      {renderPage()}
    </div>
  );
}

export default App;
=======
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
>>>>>>> b03850d3bac081d658221a295117b072d821be81
