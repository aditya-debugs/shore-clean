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
  // Get organization community messages (legacy)
  getOrgChat: (orgId, page = 1, limit = 50) =>
    apiRequest(`/chat/${orgId}?page=${page}&limit=${limit}`),

  // Get event-specific chat messages (legacy)
  getEventChat: (orgId, eventId, page = 1, limit = 50) =>
    apiRequest(`/chat/${orgId}/${eventId}?page=${page}&limit=${limit}`),

  // NEW GROUP-BASED ENDPOINTS
  // Get all groups for an organization
  getOrgGroups: (orgId) => apiRequest(`/groups/org/${orgId}`),

  // Get messages for a specific group
  getGroupMessages: (groupId, page = 1, limit = 50) =>
    apiRequest(`/chat/groups/${groupId}?page=${page}&limit=${limit}`),

  // Send message to a group
  sendGroupMessage: (groupId, messageData) =>
    apiRequest(`/chat/groups/${groupId}`, {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
};

// Groups APIs
export const groupsAPI = {
  // Get all groups for organization
  getOrgGroups: (orgId) => apiRequest(`/groups/org/${orgId}`),

  // Get specific group details
  getGroup: (groupId) => apiRequest(`/groups/${groupId}`),

  // Create new group (organizers only)
  createGroup: (groupData) =>
    apiRequest("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    }),

  // Update group (organizers only)
  updateGroup: (groupId, groupData) =>
    apiRequest(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    }),

  // Delete group (admins only)
  deleteGroup: (groupId) =>
    apiRequest(`/groups/${groupId}`, { method: "DELETE" }),

  // Join group
  joinGroup: (groupId) =>
    apiRequest(`/groups/${groupId}/join`, { method: "POST" }),

  // Leave group
  leaveGroup: (groupId) =>
    apiRequest(`/groups/${groupId}/leave`, { method: "POST" }),
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
