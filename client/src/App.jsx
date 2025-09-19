// App.jsx - Updated main app component with proper routing
import { Route, Routes, BrowserRouter } from "react-router-dom";
import ChatCommunity from "./pages/ChatCommunity";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/chat" element={<ChatCommunity />} />
        <Route path="/chat/:orgId" element={<ChatCommunity />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
