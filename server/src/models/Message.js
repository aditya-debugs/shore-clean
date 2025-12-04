const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "system"],
      default: "text",
    },
    content: {
      text: {
        type: String,
        trim: true,
        maxlength: 4000, // Max message length
      },
      fileUrl: {
        type: String,
        trim: true,
      },
      fileName: {
        type: String,
        trim: true,
      },
      fileSize: {
        type: Number, // in bytes
      },
      mimeType: {
        type: String,
        trim: true,
      },
      duration: {
        type: Number, // for audio/video in seconds
      },
      thumbnailUrl: {
        type: String, // for videos
        trim: true,
      },
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: {
          type: String,
          trim: true,
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ communityId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ "readBy.userId": 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for message delivery status
messageSchema.virtual("deliveryStatus").get(function () {
  if (this.readBy.length > 0) return "read";
  if (this.deliveredTo.length > 0) return "delivered";
  return "sent";
});

module.exports = mongoose.model("Message", messageSchema);
