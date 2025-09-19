const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Find and update the donation
      const donation = await Donation.findOne({ paymentProviderId: session.id });
      if (donation) {
        donation.status = 'completed';
        donation.paymentDetails = {
          paymentIntentId: session.payment_intent,
          paymentStatus: session.payment_status,
          amountReceived: session.amount_total / 100, // Convert from paise to INR
          paymentMethod: session.payment_method_types[0],
          customerEmail: session.customer_details?.email,
          customerName: session.customer_details?.name
        };
        await donation.save();
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;