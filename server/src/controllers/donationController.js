// server/src/controllers/donationController.js
const Donation = require('../models/Donation');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create donation (Stripe Checkout)
const createDonation = async (req, res) => {
  try {
    const { amount, name, email, event } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    // Create a new donation record (status = pending)
    const donation = await Donation.create({
      donor: req.user ? req.user.id : undefined,
      name,
      email,
      amount,
      currency: 'INR',
      event,
      status: 'pending',
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: `Donation` },
            unit_amount: Math.round(Number(amount)) * 100, // convert to paise
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      customer_email: email,
      metadata: {
        donationId: donation._id.toString(),
      },
    });

    // Save session id in donation (to match later)
    donation.paymentProviderId = session.id;
    await donation.save();

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Payment failed', details: err.message });
  }
};

// List donations (for admin/organizers)
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
