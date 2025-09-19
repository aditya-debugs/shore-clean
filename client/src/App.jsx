import React from 'react';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Route, Routes, BrowserRouter, useLocation } from 'react-router-dom';
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/admin/CreateEvent';
function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/admin/create-event" element={<CreateEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App