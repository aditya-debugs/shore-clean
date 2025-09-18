// server/src/models/Volunteer.js
const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  role: { type: String }, // e.g., usher, coordinator
  status: { type: String, enum: ['applied','accepted','rejected','cancelled'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now },
  notes: { type: String }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
