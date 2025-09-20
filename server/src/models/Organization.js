const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['NGO', 'College Club', 'Corporate CSR', 'Government Body', 'Independent Community'],
    required: true
  },
  registrationNumber: { type: String }, // License ID for NGOs/CSR
  email: { type: String, required: true, trim: true },
  contactNumber: { type: String },
  address: { type: String },
  operatingRegions: [{ type: String }],
  website: { type: String },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    twitter: { type: String }
  },
  logoUrl: { type: String },
  coverImageUrl: { type: String },
  tagline: { type: String },
  pan: { type: String }, // Tax ID
  certificate80G: { type: String }, // File path or URL
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Pending'],
    default: 'Pending'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Only for organizer
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
