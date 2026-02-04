// Stripe webhook handler for DVDS booking system
// This receives payment notifications and books into Acuity

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
    const payment = event.data.object;
    
    // Extract metadata (you'll set this when creating the Stripe session)
    const metadata = payment.metadata || {};
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      package: packageType,
      times, // JSON array of selected times
      account, // 'austen' or 'dad'
      location // which city/zone
    } = metadata;

    console.log('Payment received:', { firstName, lastName, email, city, packageType });

    // TODO: Book into Acuity
    // This will need the appointmentTypeID for the location
    // and calendar IDs for the instructors

    // For now, just log it
    console.log('Would book into Acuity:', {
      account,
      location,
      times: JSON.parse(times || '[]')
    });

    // Return success to Stripe
    return res.json({ received: true, booked: false, note: 'Manual booking required until Acuity integration complete' });
  }

  // Return success for other events
  res.json({ received: true });
};