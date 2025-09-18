// server/src/models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional guest donation
  name: { type: String }, // donor name for guest
  email: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // optional link to event
  paymentProviderId: { type: String }, // id from Stripe/Paypal/Razorpay
  status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
