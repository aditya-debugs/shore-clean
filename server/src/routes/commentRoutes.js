// routes/commentRoutes.js
const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();

// ✅ Add Comment
router.post("/:eventId", async (req, res) => {
  try {
    const { text, userId } = req.body;
    const { eventId } = req.params;

    const comment = new Comment({ text, eventId, userId });
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Comments for an Event
router.get("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const comments = await Comment.find({ eventId }).populate("userId", "name");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Comment
router.delete("/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
