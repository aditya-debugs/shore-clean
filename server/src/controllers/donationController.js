// server/src/controllers/donationController.js
const Donation = require('../models/Donation');

const createDonation = async (req, res) => {
  try {
    // In real app you'd integrate with payment gateway and mark status after webhook
    const payload = {
      donor: req.user ? req.user.id : undefined,
      name: req.body.name,
      email: req.body.email,
      amount: req.body.amount,
      currency: req.body.currency || 'INR',
      event: req.body.event
    };
    const donation = await Donation.create(payload);
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const listDonations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const donations = await Donation.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createDonation, listDonations };
