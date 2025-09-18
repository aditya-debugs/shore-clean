import Registration from "../models/Registration.js";
import { generateQR } from "../utils/qrGenerator.js";

// Register user for event & generate QR
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id; // from JWT auth middleware

    // generate QR payload
    const payload = { eventId, userId };
    const qrCode = await generateQR(payload);

    const registration = new Registration({
      event: eventId,
      user: userId,
      qrCode,
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: "User registered for event",
      qrCode, // base64 string, can be displayed directly in frontend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-in
export const checkIn = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const registration = await Registration.findOne({ event: eventId, user: userId });
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    registration.checkedInAt = new Date();
    await registration.save();

    res.json({ success: true, message: "Check-in successful", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-out
export const checkOut = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const registration = await Registration.findOne({ event: eventId, user: userId });
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    registration.checkedOutAt = new Date();
    await registration.save();

    res.json({ success: true, message: "Check-out successful", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
