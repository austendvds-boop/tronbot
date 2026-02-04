// Stripe webhook - auto-books into Acuity after payment
// Edge Runtime for Vercel

export const config = {
  runtime: 'edge',
};

// API base URL for looking up bookings
const API_BASE = 'https://assistant-board-c0dhb0217-austs-projects-ee024705.vercel.app';

// Updated appointment type IDs (confirmed with user)
const appointmentTypes = {
  austen: {
    gilbert: '44842749',
    chandler: '50528663',
    mesa: '44842781',
    tempe: '50528939',
    scottsdale: '53640646',
    ahwatukee: '50528435',
    caveCreek: '63747690',
    apacheJunction: '50528555',
    casaGrande: '70526040',
    downtownPhoenix: '50528736',
    queenCreek: '50528913',
    sanTanValley: '50528924',
    westValley: '85088423',
    // Cities routing to West Valley
    avondale: '85088423',
    goodyear: '85088423',
    tolleson: '85088423',
    buckeye: '85088423'
  },
  dad: {
    anthem: '50529545',
    apacheJunction: '50528555',
    glendale: '50529778',
    northPhoenix: '50529846',
    peoria: '50529862',
    scottsdale: '44843350', // North of Shea
    scottsdaleDad: '44843350',
    sunCity: '50529915',
    surprise: '50529929',
    elMirage: '50529929'
  }
};

const acuityConfig = {
  austen: { userId: '23214568', apiKey: '49898594aad433ade289daad5fbd8e84' },
  dad: { userId: '28722957', apiKey: '2c8203e58babe46dd2a39ca9aade2229' }
};

// Book appointment in Acuity
async function bookAcuityAppointment(account, appointmentData) {
  const config = acuityConfig[account];
  if (!config) throw new Error('Invalid account');
  
  const credentials = btoa(`${config.userId}:${config.apiKey}`);
  
  const res = await fetch('https://acuityscheduling.com/api/v1/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Acuity API error: ${res.status} - ${errorText}`);
  }
  
  return res.json();
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const event = await request.json();

    // Handle successful checkout
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const session = event.data?.object || event.data;
      
      // Get customer email for matching
      const customerEmail = session.customer_details?.email || session.customer_email;
      
      console.log('Webhook received:', { 
        type: event.type, 
        customer: session.customer_details?.name || session.customer_email,
        email: customerEmail
      });

      // Try to find booking data by customer email (stored before payment)
      let bookingData = {};
      try {
        const lookupRes = await fetch(`${API_BASE}/api/store-booking?email=${encodeURIComponent(customerEmail || '')}`);
        if (lookupRes.ok) {
          bookingData = await lookupRes.json();
          console.log('Retrieved booking data by email:', bookingData);
        }
      } catch (err) {
        console.log('No booking data found for email:', customerEmail);
      }

      const {
        account,
        city,
        packageType,
        packageName,
        customerName,
        customerEmail,
        customerPhone,
        selectedTimes,
        studentFirstName,
        studentLastName,
        studentPhone,
        pickupAddress,
        birthdate,
        permitDuration,
        notes
      } = bookingData;

      // Validate required data
      if (!account || !city || !selectedTimes) {
        console.error('Missing required data:', { account, city, selectedTimes });
        return new Response(JSON.stringify({ 
          received: true, 
          booked: false, 
          error: 'Missing required booking data' 
        }), { status: 200 });
      }

      // Get appointment type ID
      const aptTypeId = appointmentTypes[account]?.[city];
      if (!aptTypeId) {
        console.error('Unknown city:', city, 'for account:', account);
        return new Response(JSON.stringify({ 
          received: true, 
          booked: false, 
          error: `Unknown city: ${city}` 
        }), { status: 200 });
      }

      // Parse times
      let times = [];
      try {
        times = JSON.parse(selectedTimes);
      } catch (e) {
        console.error('Failed to parse times:', selectedTimes);
        return new Response(JSON.stringify({ 
          received: true, 
          booked: false, 
          error: 'Invalid times format' 
        }), { status: 200 });
      }

      // Build student info for notes
      const studentInfo = [];
      if (birthdate) studentInfo.push(`Birthdate: ${birthdate}`);
      if (permitDuration) studentInfo.push(`Permit duration: ${permitDuration}`);
      if (pickupAddress) studentInfo.push(`Pickup: ${pickupAddress}`);
      if (notes) studentInfo.push(`Notes: ${notes}`);
      
      const fullNotes = studentInfo.join('\n') || `Package: ${packageName || packageType}`;

      // Book each lesson
      const bookings = [];
      const errors = [];
      
      for (const timeSlot of times) {
        try {
          // Format datetime for Acuity (ISO format)
          const datetime = timeSlot.fullTime || `${timeSlot.date}T${timeSlot.time}`;
          
          const appointment = await bookAcuityAppointment(account, {
            appointmentTypeID: parseInt(aptTypeId),
            datetime: datetime,
            firstName: studentFirstName || customerName?.split(' ')[0] || 'Student',
            lastName: studentLastName || customerName?.split(' ').slice(1).join(' ') || '',
            email: customerEmail || 'no-email@deervalleyschool.com',
            phone: studentPhone || customerPhone || '',
            notes: fullNotes
          });
          
          bookings.push({
            id: appointment.id,
            time: datetime,
            confirmation: appointment.confirmationCode
          });
          
          console.log('Booked appointment:', appointment.id);
        } catch (err) {
          console.error('Booking failed for time:', timeSlot, err.message);
          errors.push({ time: timeSlot, error: err.message });
        }
      }

      console.log(`Booked ${bookings.length}/${times.length} appointments`);
      
      return new Response(JSON.stringify({ 
        received: true, 
        booked: bookings.length,
        bookings: bookings,
        errors: errors.length > 0 ? errors : undefined
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Acknowledge other events
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ 
      received: true, 
      error: err.message 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}