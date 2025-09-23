import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error logging and auth handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error Response:", error.response?.data);

    // Handle auth errors
    if (error.response?.status === 401) {
      // Token might be expired or invalid
      console.log("Authentication error detected, clearing user data");
      localStorage.removeItem("user");
      // Don't redirect here - let the app handle it through auth context
    }

    return Promise.reject(error);
  }
);

// Event API functions
export const getEvents = async (params = {}) => {
  try {
    const response = await api.get("/events", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post("/events", eventData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Registration API functions
export const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/registrations/${eventId}/register`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRegistrationStatus = async (eventId) => {
  try {
    const response = await api.get(`/registrations/${eventId}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEventRegistrations = async (eventId) => {
  try {
    const response = await api.get(`/registrations/${eventId}/registrations`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelRegistration = async (eventId) => {
  try {
    const response = await api.delete(`/registrations/${eventId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkInVolunteer = async (qrCode) => {
  try {
    const response = await api.post(`/registrations/checkin-qr`, { qrCode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkOutVolunteer = async (qrCode) => {
  try {
    const response = await api.post(`/registrations/checkout-qr`, { qrCode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyRegistrations = async () => {
  try {
    const response = await api.get("/registrations/my");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// RSVP API functions
export const rsvpForEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/rsvp`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelRsvpForEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/cancel-rsvp`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Donation API functions
export const createDonation = async (donationData) => {
  try {
    const response = await api.post("/donations", donationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDonations = async () => {
  try {
    const response = await api.get("/donations");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Certificate API functions
export const getCertificates = async () => {
  try {
    const response = await api.get("/certificates");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
