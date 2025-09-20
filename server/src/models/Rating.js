// models/Rating.js
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Ensure one rating per user per event
ratingSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
