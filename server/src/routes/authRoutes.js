// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, logout, refreshAccessToken, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/refresh-token', refreshAccessToken); // client calls to get new access token (uses cookie)
router.get('/profile', protect, getProfile); // protected route to get user profile
router.put('/profile', protect, updateProfile); // protected route to update user profile

module.exports = router;
