// server/src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createEvent,
  updateEvent,
  deleteEvent,   // 👈 Add delete controller
  getEvent,
  listEvents,
  rsvpEvent,
  cancelRsvp
} = require('../controllers/eventController');

// Public Routes
router.get('/', listEvents);
router.get('/:id', getEvent);

// Organizer/Admin Routes
router.post('/', protect, authorize('organizer', 'admin', 'org'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin', 'org'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin', 'org'), deleteEvent); 

// Volunteer Routes
router.post('/:id/rsvp', protect, authorize('volunteer', 'organizer', 'admin', 'org'), rsvpEvent);
router.post('/:id/cancel-rsvp', protect, authorize('volunteer', 'organizer', 'admin', 'org'), cancelRsvp);

module.exports = router;
