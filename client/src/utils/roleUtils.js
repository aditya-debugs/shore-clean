// Role utility functions for checking user permissions
export const USER_ROLES = {
  USER: "user",
  VOLUNTEER: "user", // Same as user role
  ORGANIZER: "org",
  ADMIN: "admin",
};

// Check if user is a volunteer (regular user)
export const isVolunteer = (user) => {
  return user && user.role === USER_ROLES.USER;
};

// Check if user is an organizer
export const isOrganizer = (user) => {
  return user && user.role === USER_ROLES.ORGANIZER;
};

// Check if user is an admin
export const isAdmin = (user) => {
  return user && user.role === USER_ROLES.ADMIN;
};

// Check if user can create events (organizers and admins)
export const canCreateEvents = (user) => {
  return isOrganizer(user) || isAdmin(user);
};

// Check if user can edit/delete events
export const canEditEvent = (user, event) => {
  if (!user || !event) return false;

  // Admin can edit any event
  if (isAdmin(user)) return true;

  // Organizer can edit their own events
  if (isOrganizer(user)) {
    return user._id === event.organizer?._id || user._id === event.organizer;
  }

  return false;
};

// Check if user can RSVP to events (volunteers only)
export const canRSVPToEvents = (user) => {
  return isVolunteer(user);
};

// Get user role display name
export const getUserRoleDisplayName = (user) => {
  if (!user) return "Guest";

  switch (user.role) {
    case USER_ROLES.USER:
      return "Volunteer";
    case USER_ROLES.ORGANIZER:
      return "Organizer";
    case USER_ROLES.ADMIN:
      return "Admin";
    default:
      return "User";
  }
};

// Get navigation items based on user role
export const getNavigationItems = (user) => {
  if (!user) {
    return [
      { name: "Events", path: "/events" },
      { name: "Testimonials", onClick: "scrollToTestimonials" },
    ];
  }

  if (isVolunteer(user)) {
    return [
      { name: "Events", path: "/events" },
      { name: "Testimonials", onClick: "scrollToTestimonials" },
      { name: "Donation", path: "/donations", isCtaButton: true },
    ];
  }

  if (isOrganizer(user)) {
    return [
      { name: "Events", path: "/events" },
      { name: "Testimonials", onClick: "scrollToTestimonials" },
      { name: "Community Chat", path: "/chat", isCtaButton: true },
    ];
  }

  return [];
};

// Get profile path based on user role
export const getProfilePath = (user) => {
  if (!user) return "/profile";

  if (isOrganizer(user)) {
    return `/organization/${user._id}`;
  }

  return "/profile";
};

// Get events filter for user role
export const getEventsFilter = (user) => {
  if (!user) return "all";

  if (isVolunteer(user)) {
    return "all"; // Volunteers see all events
  }

  if (isOrganizer(user)) {
    return "my-events"; // Organizers see only their events
  }

  return "all";
};
