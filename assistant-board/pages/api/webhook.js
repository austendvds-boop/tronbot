// Stripe webhook - auto-books into Acuity after payment

// Acuity API helper
async function bookAcuityAppointment(config, appointmentData) {
  const auth = Buffer.from(`${config.userId}:${config.apiKey}`).toString('base64');
  
  const res = await fetch('https://acuityscheduling.com/api/v1/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });
  
  if (!res.ok) {
    throw new Error(`Acuity API error: ${res.status}`);
  }
  
  return res.json();
}

// Map cities to appointment type IDs
const appointmentTypes = {
  austen: {
    gilbert: '44842781',
    chandler: '76015901',
    mesa: '83323017',
    tempe: '80855531',
    scottsdale: '50528939',
    ahwatukee: '76003665',
    caveCreek: '66596547',
    apacheJunction: '70526040',
    casaGrande: '79425195',
    downtownPhoenix: '44842749',
    queenCreek: '50528924',
    sanTanValley: '53640646',
    westValley: '80855448'
  },
  dad: {
    anthem: '50529545',
    glendale: '50529754',
    northPhoenix: '50529794',
    peoria: '80856319',
    sunCity: '80856381',
    surprise: '80856400'
  }
};

const acuityConfig = {
  austen: { userId: '23214568', apiKey: '49898594aad433ade289daad5fbd8e84' },
  dad: { userId: '28722957', apiKey: '2c8203e58babe46dd2a39ca9aade2229' }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString();
    const event = JSON.parse(rawBody);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      
      const {
        account,
        packageType,
        location,
        selectedTimes,
        customerEmail,
        customerName
      } = metadata;

      console.log('Auto-booking:', { customerName, location, packageType });

      // Get appointment type ID
      const aptTypeId = appointmentTypes[account]?.[location];
      if (!aptTypeId) {
        console.error('Unknown location:', location);
        return res.status(200).json({ received: true, booked: false, error: 'Unknown location' });
      }

      // Parse times
      const times = JSON.parse(selectedTimes || '[]');
      
      // Book each lesson
      const bookings = [];
      for (const time of times) {
        try {
          const appointment = await bookAcuityAppointment(acuityConfig[account], {
            appointmentTypeID: aptTypeId,
            datetime: time,
            firstName: customerName?.split(' ')[0] || 'Student',
            lastName: customerName?.split(' ').slice(1).join(' ') || 'Name',
            email: customerEmail || 'no-email@example.com',
            notes: `Auto-booked from website. Package: ${packageType}`
          });
          bookings.push(appointment);
        } catch (err) {
          console.error('Booking failed for time:', time, err);
        }
      }

      console.log('Booked', bookings.length, 'appointments');
      return res.status(200).json({ received: true, booked: bookings.length });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ received: true }); // Always return 200
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};