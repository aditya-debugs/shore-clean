import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isOrganizer } from "../utils/roleUtils";

const OrganizationRoute = ({ children }) => {
  const { currentUser, loading, checkProfileCompletion } = useAuth();

  console.log("OrganizationRoute - currentUser:", currentUser);
  console.log("OrganizationRoute - loading:", loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log("OrganizationRoute - No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If user is not an organizer, allow normal access
  if (!isOrganizer(currentUser)) {
    console.log("OrganizationRoute - User is not organizer, allowing access");
    return children;
  }

  // If user is an organizer but hasn't completed profile, redirect to completion form
  const profileCompleted = checkProfileCompletion(currentUser);
  console.log("OrganizationRoute - Profile completed:", profileCompleted);
  console.log(
    "OrganizationRoute - hasCompletedProfile:",
    currentUser.hasCompletedProfile
  );

  if (!profileCompleted) {
    console.log(
      "OrganizationRoute - Profile not completed, redirecting to form"
    );
    return <Navigate to="/organization-details" replace />;
  }

  console.log("OrganizationRoute - All checks passed, rendering children");
  return children;
};

export default OrganizationRoute;
