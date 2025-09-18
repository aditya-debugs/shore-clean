// server/src/routes/volunteerRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { applyVolunteer, listVolunteersForEvent, updateVolunteerStatus } = require('../controllers/volunteerController');

router.post('/apply/:eventId', protect, applyVolunteer);
router.get('/event/:eventId', protect, listVolunteersForEvent); // restrict later to organizer/admin
router.put('/:id/status', protect, updateVolunteerStatus);

module.exports = router;
