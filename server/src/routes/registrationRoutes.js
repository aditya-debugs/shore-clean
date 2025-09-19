const express = require('express');
const { registerForEvent, checkIn, checkOut } = require ("../controllers/registrationController.js");
const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Register for event (with QR generation)
router.post("/:eventId/register", protect, registerForEvent);

// Check-in
router.post("/:eventId/checkin", protect, checkIn);

// Check-out
router.post("/:eventId/checkout", protect, checkOut);

module.exports = router;
