// Stripe webhook handler for DVDS booking system

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, just acknowledge receipt
  // Full implementation needs Stripe SDK and signature verification
  console.log('Webhook received:', req.body);
  
  res.json({ received: true, status: 'ok' });
}