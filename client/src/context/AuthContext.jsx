import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Initializing auth state...");
    // Load user from localStorage on app start
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log("AuthContext: Found user in localStorage:", user);

        // Validate that the user object has required fields
        if (user && (user._id || user.id) && user.token) {
          // Normalize the user object to always have _id for consistency
          const normalizedUser = {
            ...user,
            _id: user._id || user.id,
          };
          setCurrentUser(normalizedUser);
          console.log("AuthContext: User validated and set:", normalizedUser);
        } else {
          console.log(
            "AuthContext: Invalid user data, removing from localStorage"
          );
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("AuthContext: No user found in localStorage");
    }
    setLoading(false);
    console.log("AuthContext: Initialization complete");
  }, []);

  const login = async (userData) => {
    try {
      const response = await api.post("/auth/login", userData);
      const { user, accessToken } = response.data;

      // Normalize user object to always have _id for consistency
      const userWithToken = {
        ...user,
        _id: user._id || user.id,
        token: accessToken,
      };

      // Save to localStorage and state
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setCurrentUser(userWithToken);

      console.log("AuthContext: Login successful, user set:", userWithToken);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { user, accessToken } = response.data;

      // Normalize user object to always have _id for consistency
      const userWithToken = {
        ...user,
        _id: user._id || user.id,
        token: accessToken,
      };

      // Save to localStorage and state
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setCurrentUser(userWithToken);

      console.log(
        "AuthContext: Registration successful, user set:",
        userWithToken
      );
      return { success: true };
    } catch (error) {
      console.error("Register error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
