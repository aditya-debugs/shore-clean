// API utility functions for ShoreClean frontend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for authentication
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  getProfile: () => apiRequest("/profile"),
};

// Chat APIs
export const chatAPI = {
  // Get organization community messages
  getOrgChat: (orgId, page = 1, limit = 50) =>
    apiRequest(`/chat/${orgId}?page=${page}&limit=${limit}`),

  // Get event-specific chat messages
  getEventChat: (orgId, eventId, page = 1, limit = 50) =>
    apiRequest(`/chat/${orgId}/${eventId}?page=${page}&limit=${limit}`),
};

// Events APIs
export const eventsAPI = {
  getEvents: () => apiRequest("/events"),
  getEvent: (id) => apiRequest(`/events/${id}`),
  createEvent: (eventData) =>
    apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),
  updateEvent: (id, eventData) =>
    apiRequest(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),
  deleteEvent: (id) => apiRequest(`/events/${id}`, { method: "DELETE" }),
};

// Volunteers APIs
export const volunteersAPI = {
  getVolunteers: () => apiRequest("/volunteers"),
  registerVolunteer: (volunteerData) =>
    apiRequest("/volunteers", {
      method: "POST",
      body: JSON.stringify(volunteerData),
    }),
};

// Donations APIs
export const donationsAPI = {
  getDonations: () => apiRequest("/donations"),
  createDonation: (donationData) =>
    apiRequest("/donations", {
      method: "POST",
      body: JSON.stringify(donationData),
    }),
};

// Certificates APIs
export const certificatesAPI = {
  getCertificates: () => apiRequest("/certificates"),
  generateCertificate: (certificateData) =>
    apiRequest("/certificates", {
      method: "POST",
      body: JSON.stringify(certificateData),
    }),
};

export default {
  authAPI,
  chatAPI,
  eventsAPI,
  volunteersAPI,
  donationsAPI,
  certificatesAPI,
};
