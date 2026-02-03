// Demo webhook endpoint - simulates Stripe payment + auto-books in Acuity
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customer, package: pkgName, location, times, account } = req.body;

  console.log('=== SIMULATED STRIPE PAYMENT RECEIVED ===');
  console.log('Customer:', customer);
  console.log('Package:', pkgName);
  console.log('Location:', location);
  console.log('Times:', times);
  console.log('Account:', account);
  console.log('==========================================');

  // Simulate booking in Acuity
  const bookings = [];
  for (const time of times) {
    bookings.push({
      datetime: time,
      customer: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      package: pkgName,
      status: 'CONFIRMED'
    });
  }

  // Return success
  res.status(200).json({
    success: true,
    message: 'Payment received and lessons booked!',
    bookings: bookings,
    confirmationNumber: 'DVDS-' + Math.random().toString(36).substr(2, 8).toUpperCase()
  });
}