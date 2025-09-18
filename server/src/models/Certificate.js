// server/src/models/Certificate.js
const mongoose = require('mongoose');

const certSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedAt: { type: Date, default: Date.now },
  certUrl: { type: String }, // link to generated PDF/image
  metadata: { type: Object } // extra info like role, score
});

module.exports = mongoose.model('Certificate', certSchema);
