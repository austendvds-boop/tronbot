// Stripe webhook handler for DVDS booking system
// This receives payment notifications and books into Acuity

export const config = {
  api: {
    bodyParser: false, // Stripe needs raw body
  },
};

import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Acuity configs
const acuityConfig = {
  austen: {
    userId: '23214568',
    apiKey: '49898594aad433ade289daad5fbd8e84'
  },
  dad: {
    userId: '28722957',
    apiKey: '2c8203e58babe46dd2a39ca9aade2229'
  }
};

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  const buf = await buffer(req);

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
    const payment = event.data.object;
    
    // Extract metadata
    const metadata = payment.metadata || {};
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      package: packageType,
      times,
      account,
      location
    } = metadata;

    console.log('Payment received:', { firstName, lastName, email, city, packageType });

    // Return success to Stripe immediately
    res.json({ received: true, booked: false });
    
    // TODO: Process async - book into Acuity
    return;
  }

  // Return success for other events
  res.json({ received: true });
}