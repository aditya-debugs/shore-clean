// server/src/routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createDonation, listDonations } = require('../controllers/donationController');

// If you want donations open to guests → remove `protect`
router.post('/', createDonation);  
router.get('/', protect, listDonations); 

module.exports = router;
