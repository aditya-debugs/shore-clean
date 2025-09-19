import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await refreshAccessToken();
        const newToken = response.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken } = response.data;
    
    // Store access token in localStorage
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { accessToken } = response.data;
    
    // Store access token in localStorage
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  } catch (error) {
    // Even if logout fails on server, remove local token
    localStorage.removeItem('accessToken');
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const response = await api.get('/auth/refresh-token');
    const { accessToken } = response.data;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    
    return response.data;
  } catch (error) {
    localStorage.removeItem('accessToken');
    // Don't throw error if server is not running, just return null
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.log('Server not available, continuing without authentication');
      return null;
    }
    throw error;
  }
};

// Event API functions
export const getEvents = async (params = {}) => {
  try {
    const response = await api.get('/events', { params });
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
    const response = await api.post('/events', eventData);
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
    const response = await api.post('/registrations', { eventId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyRegistrations = async () => {
  try {
    const response = await api.get('/registrations/my');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Donation API functions
export const createDonation = async (donationData) => {
  try {
    const response = await api.post('/donations', donationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDonations = async () => {
  try {
    const response = await api.get('/donations');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Certificate API functions
export const getCertificates = async () => {
  try {
    const response = await api.get('/certificates');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
