// routes/ratingRoutes.js
const express = require("express");
const Rating = require("../models/Rating");
const Event = require("../models/Event");

const router = express.Router();

// ✅ Add or Update Rating
router.post("/ratings", async (req, res) => {
  try {
    const { rating, eventId, userId } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Find existing rating or create new one
    const existingRating = await Rating.findOne({ eventId, userId });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      res.json({ message: "Rating updated", rating: existingRating });
    } else {
      const newRating = new Rating({ eventId, userId, rating });
      await newRating.save();
      res.status(201).json({ message: "Rating added", rating: newRating });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Event Average Rating
router.get("/ratings/event/:eventId/average", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.query;

    // Get all ratings for the event
    const ratings = await Rating.find({ eventId });

    // Calculate average rating
    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.json({
      average: Number(average.toFixed(1)),
      count: ratings.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get User's Rating for an Event
router.get("/ratings/event/:eventId/user", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.query;

    // Get user's specific rating
    const userRating = await Rating.findOne({ eventId, userId });

    res.json({
      rating: userRating ? userRating.rating : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Rating
router.delete("/ratings", async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    await Rating.findOneAndDelete({ eventId, userId });
    res.json({ message: "Rating deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
