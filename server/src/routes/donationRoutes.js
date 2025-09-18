// server/src/routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createDonation, listDonations } = require('../controllers/donationController');

router.post('/', protect, createDonation); // or allow guest donations by removing protect
router.get('/', protect, listDonations); // admin/organizer view
module.exports = router;
