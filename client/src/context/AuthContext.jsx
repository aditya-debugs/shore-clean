import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { isOrganizer } from "../utils/roleUtils";

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
      localStorage.setItem("token", accessToken); // Ensure token is stored separately
      console.log("Token stored after login:", accessToken);
      setCurrentUser(userWithToken);

      return {
        success: true,
        user: userWithToken,
        needsProfileCompletion:
          isOrganizer(userWithToken) && !userWithToken.hasCompletedProfile,
      };
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
      const userWithToken = {
        ...user,
        _id: user._id || user.id,
        token: accessToken,
      };
      localStorage.setItem("user", JSON.stringify(userWithToken));
      localStorage.setItem("token", accessToken); // Ensure token is stored separately
      console.log("Token stored after register:", accessToken);
      setCurrentUser(userWithToken);

      return {
        success: true,
        user: userWithToken,
        needsProfileCompletion:
          isOrganizer(userWithToken) && !userWithToken.hasCompletedProfile,
      };
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
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);
      const { user } = response.data;
      const userWithToken = {
        ...user,
        token: currentUser.token,
      };
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setCurrentUser(userWithToken);
      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const checkProfileCompletion = (user) => {
    console.log("checkProfileCompletion - user:", user);
    console.log("checkProfileCompletion - isOrganizer:", isOrganizer(user));
    if (!user || !isOrganizer(user)) return true;
    const completed = user.hasCompletedProfile === true;
    console.log("checkProfileCompletion - completed:", completed);
    return completed;
  };

  const updateCurrentUser = (updatedUserData) => {
    console.log("updateCurrentUser - currentUser before:", currentUser);
    console.log("updateCurrentUser - updatedUserData:", updatedUserData);
    const updatedUser = {
      ...currentUser,
      ...updatedUserData,
    };
    console.log("updateCurrentUser - updatedUser after merge:", updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("updateCurrentUser - localStorage updated");
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    updateProfile,
    checkProfileCompletion,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
