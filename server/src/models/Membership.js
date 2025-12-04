const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "muted", "banned"],
      default: "active",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    typingLastUpdated: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique membership per user per community
membershipSchema.index({ communityId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1 });
membershipSchema.index({ communityId: 1, status: 1 });
membershipSchema.index({ lastSeenAt: -1 });

module.exports = mongoose.model("Membership", membershipSchema);
