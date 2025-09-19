// server/src/index.js
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const donationRoutes = require('./routes/donationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const registrationRoutes = require('./routes/registrationRoutes');


const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

// CORS: allow client to send cookies to server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use("/api/registrations", registrationRoutes);


// example protected route
const { protect } = require('./middlewares/authMiddleware');
app.get('/api/profile', protect, async (req, res) => {
  // req.user set in protect
  res.json({ message: 'Protected profile', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
