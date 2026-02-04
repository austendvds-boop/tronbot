// Simple in-memory store for pending bookings (resets on deploy, but fine for testing)
// For production, use Vercel KV or Upstash Redis
const pendingBookings = new Map();

// Store booking data before payment
export default async function handler(request) {
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store for 1 hour
      pendingBookings.set(bookingId, {
        ...data,
        createdAt: Date.now()
      });
      
      // Cleanup old entries (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (const [key, value] of pendingBookings) {
        if (value.createdAt < oneHourAgo) {
          pendingBookings.delete(key);
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        bookingId: bookingId 
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ 
        error: err.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('id');
    const email = url.searchParams.get('email');
    
    // Lookup by ID
    if (bookingId) {
      const data = pendingBookings.get(bookingId);
      if (!data) {
        return new Response(JSON.stringify({ error: 'Booking not found or expired' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Lookup by email
    if (email) {
      for (const [key, value] of pendingBookings) {
        if (value.customerEmail === email || value.studentInfo?.email === email) {
          return new Response(JSON.stringify(value), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      return new Response(JSON.stringify({ error: 'Booking not found for email' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Missing booking ID or email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const config = {
  runtime: 'edge',
};