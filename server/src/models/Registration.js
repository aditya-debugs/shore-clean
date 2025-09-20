const mongoose = require("mongoose");
const crypto = require("crypto");

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrCode: {
      type: String, // store QR code data (or file URL if you generate image)
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "checked-in", "checked-out", "cancelled"],
      default: "registered",
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedOutAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure one registration per volunteer per event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;
