const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    // Keep eventId for backward compatibility and direct event linking
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "system", "announcement"],
      default: "text",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient room-based queries
chatSchema.index({ orgId: 1, groupId: 1, timestamp: -1 });
chatSchema.index({ groupId: 1, timestamp: -1 });

// Virtual for room identifier (now group-based)
chatSchema.virtual("roomId").get(function () {
  return `${this.orgId}_${this.groupId}`;
});

module.exports = mongoose.model("Chat", chatSchema);

// Virtual for room identifier
chatSchema.virtual("roomId").get(function () {
  return `${this.orgId}_${this.eventId}`;
});

module.exports = mongoose.model("Chat", chatSchema);
