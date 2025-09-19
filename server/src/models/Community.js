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
      maxlength: 1000,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String, // URL to community avatar/logo
      default: null,
    },
    banner: {
      type: String, // URL to community banner image
      default: null,
    },
    category: {
      type: String,
      enum: ["environmental", "cleanup", "conservation", "education", "other"],
      default: "environmental",
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "moderator"],
          default: "moderator",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "inactive", "banned"],
          default: "active",
        },
      },
    ],
    settings: {
      isPublic: {
        type: Boolean,
        default: true, // If false, invitation/approval required
      },
      requireApproval: {
        type: Boolean,
        default: false, // If true, organizers must approve new members
      },
      allowMemberInvites: {
        type: Boolean,
        default: true, // If false, only organizers can invite
      },
    },
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      totalGroups: {
        type: Number,
        default: 0,
      },
      totalMessages: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
communitySchema.index({ slug: 1 });
communitySchema.index({ createdBy: 1 });
communitySchema.index({ category: 1, isActive: 1 });
communitySchema.index({ "members.userId": 1 });
communitySchema.index({ "organizers.userId": 1 });

// Virtual for groups in this community
communitySchema.virtual("groups", {
  ref: "Group",
  localField: "_id",
  foreignField: "communityId",
});

module.exports = mongoose.model("Community", communitySchema);
