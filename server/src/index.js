// server/src/index.js
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const { initializeSocketHandlers } = require("./utils/socketHandler");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donationRoutes = require("./routes/donationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const communityRoutes = require("./routes/communityRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const commentRoutes = require("./routes/commentRoutes.js");
const ratingRoutes = require("./routes/ratingRoutes.js");
const organizationRoutes = require("./routes/organizationRoutes");

const app = express();
const server = http.createServer(app);

// This must be before the express.json() middleware for Stripe webhooks
app.use("/api/webhooks", webhookRoutes);

// Initialize Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

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

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api", ratingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);
// Organization profile routes
const organizationRoutes = require("./routes/organizationRoutes");
app.use("/api/organizations", organizationRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/organizations", organizationRoutes);

// Initialize Socket.io handlers for real-time chat
initializeSocketHandlers(io);

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
      chat: true,
      websocket: true,
      database: true,
    },
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ShoreClean server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time chat`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`💬 Chat endpoints: http://localhost:${PORT}/api/chat`);
});
