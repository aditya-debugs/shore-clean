// server/src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
    );

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error:", err);

    // Don't exit immediately in development, retry instead
    if (process.env.NODE_ENV !== "development") {
      process.exit(1);
    } else {
      console.log("🔄 Retrying connection in 5 seconds...");
      setTimeout(connectDB, 5000);
    }
  }
};

module.exports = connectDB;
