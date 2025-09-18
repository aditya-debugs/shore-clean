import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
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
  checkedInAt: {
    type: Date,
    default: null,
  },
  checkedOutAt: {
    type: Date,
    default: null,
  },
  qrCode: {
    type: String, // store QR code data (or file URL if you generate image)
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("Registration", registrationSchema);
