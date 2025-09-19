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
    const response = await api.post("/registrations", { eventId });
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

// Community API functions
export const communityAPI = {
  getAll: async () => {
    const response = await api.get("/communities");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/communities/${id}`);
    return response.data;
  },
  create: async (communityData) => {
    const response = await api.post("/communities", communityData);
    return response.data;
  },
  update: async (id, communityData) => {
    const response = await api.put(`/communities/${id}`, communityData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/communities/${id}`);
    return response.data;
  },
  join: async (id) => {
    const response = await api.post(`/communities/${id}/join`);
    return response.data;
  },
  leave: async (id) => {
    const response = await api.post(`/communities/${id}/leave`);
    return response.data;
  },
};

// Groups API functions
export const groupsAPI = {
  getByOrganization: async (orgId) => {
    const response = await api.get(`/groups/${orgId}`);
    return response.data;
  },
  getByCommunity: async (communityId) => {
    const response = await api.get(`/groups/community/${communityId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },
  create: async (orgId, groupData) => {
    const response = await api.post(`/groups/${orgId}`, groupData);
    return response.data;
  },
  update: async (id, groupData) => {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },
  join: async (id) => {
    const response = await api.post(`/groups/${id}/join`);
    return response.data;
  },
  leave: async (id) => {
    const response = await api.post(`/groups/${id}/leave`);
    return response.data;
  },
  getMessages: async (groupId, page = 1, limit = 50) => {
    const response = await api.get(`/groups/${groupId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },
};

// Chat API functions
export const chatAPI = {
  getMessages: async (groupId, page = 1, limit = 50) => {
    const response = await api.get(`/groups/${groupId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },
  sendMessage: async (groupId, content) => {
    const response = await api.post(`/chat/${groupId}/messages`, {
      content,
    });
    return response.data;
  },
};

export default api;
