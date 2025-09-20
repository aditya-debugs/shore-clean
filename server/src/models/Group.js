const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Organization/Admin user
      required: true,
      index: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["event", "general", "announcements", "certificates", "custom"],
      default: "general",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false, // Only for event-type groups
    },
    icon: {
      type: String,
      default: "💬", // Emoji or icon identifier
    },
    color: {
      type: String,
      default: "#3B82F6", // Hex color for group identification
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "moderator", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      allowFileUploads: {
        type: Boolean,
        default: true,
      },
      allowMentions: {
        type: Boolean,
        default: true,
      },
      isPublic: {
        type: Boolean,
        default: true, // If false, invitation required
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
groupSchema.index({ orgId: 1, isActive: 1 });
groupSchema.index({ orgId: 1, type: 1 });
groupSchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Group", groupSchema);
