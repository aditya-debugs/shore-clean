const express = require('express');
const { 
  registerForEvent, 
  getRegistrationStatus,
  getEventRegistrations,
  checkInVolunteer,
  checkOutVolunteer,
  cancelRegistration,
  checkIn, 
  checkOut 
} = require ("../controllers/registrationController.js");
const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Register for event (with QR generation)
router.post("/:eventId/register", protect, registerForEvent);

// Get registration status for current user
router.get("/:eventId/status", protect, getRegistrationStatus);

// Get all registrations for an event (organizers only)
router.get("/:eventId/registrations", protect, getEventRegistrations);

// Cancel registration
router.delete("/:eventId/cancel", protect, cancelRegistration);

// QR Code based check-in/check-out
router.post("/checkin-qr", protect, checkInVolunteer);
router.post("/checkout-qr", protect, checkOutVolunteer);

// Legacy check-in/check-out (for backwards compatibility)
router.post("/:eventId/checkin", protect, checkIn);
router.post("/:eventId/checkout", protect, checkOut);

module.exports = router;
