// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, logout, refreshAccessToken } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/refresh-token', refreshAccessToken); // client calls to get new access token (uses cookie)

module.exports = router;
