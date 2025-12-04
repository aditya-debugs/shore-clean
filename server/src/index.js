// server/src/index.js
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donationRoutes = require("./routes/donationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const commentRoutes = require("./routes/commentRoutes.js");
const ratingRoutes = require("./routes/ratingRoutes.js");
const organizationRoutes = require("./routes/organizationRoutes");
const communityRoutes = require("./routes/communityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// This must be before the express.json() middleware for Stripe webhooks
app.use("/api/webhooks", webhookRoutes);

// Initialize database connection
connectDB();

app.use(express.json());
app.use(cookieParser());

// CORS: allow client to send cookies to server
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      process.env.CLIENT_URL || "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api", ratingRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// example protected route
const { protect } = require("./middlewares/authMiddleware");
app.get("/api/profile", protect, async (req, res) => {
  // req.user set in protect
  res.json({ message: "Protected profile", user: req.user });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ShoreClean API is running",
    timestamp: new Date().toISOString(),
    features: {
      database: true,
    },
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 ShoreClean server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});

// Initialize Socket.IO
const SocketManager = require("./utils/socketManager");
const socketManager = new SocketManager(server);

// Make socket manager available globally for other parts of the application
global.socketManager = socketManager;
