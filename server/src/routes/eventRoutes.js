// server/src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createEvent, updateEvent, getEvent, listEvents, rsvpEvent, cancelRsvp
} = require('../controllers/eventController');

router.get('/', listEvents);
router.post('/', protect, createEvent); // organizer or admin can create
router.get('/:id', getEvent);
router.put('/:id', protect, updateEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
router.post('/:id/cancel-rsvp', protect, cancelRsvp);

module.exports = router;
