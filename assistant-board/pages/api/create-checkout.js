// Create Stripe Checkout Session with booking metadata
import Stripe from 'stripe';

const stripeAusten = new Stripe(process.env.STRIPE_AUSTEN_SECRET_KEY);
const stripeDad = new Stripe(process.env.STRIPE_DAD_SECRET_KEY);

// Price IDs for each package (you'll need to create these in Stripe)
const priceIds = {
  austen: {
    ultimate: 'price_placeholder',
    license: 'price_placeholder',
    intro: 'price_placeholder',
    express: 'price_placeholder'
  },
  dad: {
    ultimate: 'price_placeholder',
    license: 'price_placeholder',
    intro: 'price_placeholder',
    express: 'price_placeholder'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      account, // 'austen' or 'dad'
      package: packageType,
      amount, // in cents
      location,
      selectedTimes,
      customerEmail,
      customerName
    } = req.body;

    const stripe = account === 'dad' ? stripeDad : stripeAusten;

    // Create checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${location} - ${packageType}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/book?success=true`,
      cancel_url: `${req.headers.origin}/book?canceled=true`,
      metadata: {
        account,
        packageType,
        location,
        selectedTimes: JSON.stringify(selectedTimes),
        customerEmail: customerEmail || '',
        customerName: customerName || ''
      }
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}