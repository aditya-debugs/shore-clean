const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
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
    avatar: {
      type: String, // URL to avatar image
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true, // Each organization has only one community
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberCount: {
      type: Number,
      default: 1, // Admin is always the first member
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: false, // Only admins can add members by default
      },
      muteNewMembers: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessagePreview: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
communitySchema.index({ organizationId: 1 });
communitySchema.index({ adminId: 1 });
communitySchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Community", communitySchema);
