import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      const response = await api.post('/auth/login', userData);
      const { user, accessToken } = response.data;
      
      const userWithToken = {
        ...user,
        token: accessToken
      };

      // Save to localStorage and state
  localStorage.setItem('user', JSON.stringify(userWithToken));
  localStorage.setItem('token', accessToken); // Ensure token is stored separately
  console.log('Token stored after login:', accessToken);
  setCurrentUser(userWithToken);
  return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken } = response.data;
      const userWithToken = {
        ...user,
        token: accessToken
      };
  localStorage.setItem('user', JSON.stringify(userWithToken));
  localStorage.setItem('token', accessToken); // Ensure token is stored separately
  console.log('Token stored after register:', accessToken);
  setCurrentUser(userWithToken);
  return { success: true };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      const { user } = response.data;
      const userWithToken = {
        ...user,
        token: currentUser.token
      };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      setCurrentUser(userWithToken);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
