// server/src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  capacity: { type: Number, default: 0 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // RSVPed users
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  bannerUrl: { type: String }, // optional image url
  status: { type: String, enum: ['draft','published','cancelled'], default: 'draft' }
});

module.exports = mongoose.model('Event', eventSchema);
