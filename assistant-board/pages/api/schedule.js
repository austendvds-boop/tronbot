// API route to fetch combined schedule from both Acuity accounts
// Uses Basic Auth: User ID as username, API Key as password

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Acuity API credentials
  const accounts = {
    austen: {
      userId: '23214568',
      apiKey: '49898594aad433ade289daad5fbd8e84',
      instructors: ['Austen', 'Aaron', 'Ryan']
    },
    dad: {
      userId: '28722957', 
      apiKey: '2c8203e58babe46dd2a39ca9aade2229',
      instructors: ['Ernie', 'Michelle', 'Allan', 'Bob', 'Brandon', 'Freddy']
    }
  };

  const baseUrl = 'https://acuityscheduling.com/api/v1';
  
  // Get date range (today + 7 days)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Fetch from both accounts in parallel
    const [austenData, dadData] = await Promise.all([
      fetchAppointments(accounts.austen, baseUrl, minDate, maxDate),
      fetchAppointments(accounts.dad, baseUrl, minDate, maxDate)
    ]);

    // Transform Acuity data to our format
    const transformAppointment = (apt, accountType) => {
      const instructor = apt.calendar || 'Unknown';
      const studentName = apt.firstName && apt.lastName 
        ? `${apt.firstName} ${apt.lastName}`
        : apt.firstName || 'Unknown Student';
      
      // Parse datetime
      const dateTime = new Date(apt.datetime);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase();

      // Extract lesson info from appointment type
      const aptType = apt.type || '';
      const lessonMatch = aptType.match(/(\d+)\s*lesson/i);
      const totalLessons = lessonMatch ? lessonMatch[1] : '?';
      
      // Try to determine current lesson number from notes or assume 1
      const lessonNum = apt.notes?.match(/lesson\s*(\d+)/i)?.[1] || '1';

      return {
        id: apt.id.toString(),
        student: studentName,
        time: time,
        instructor: instructor,
        lesson: `${lessonNum} of ${totalLessons}`,
        location: apt.location || 'TBD',
        date: date,
        datetime: apt.datetime,
        email: apt.email,
        phone: apt.phone,
        notes: apt.notes,
        account: accountType,
        raw: apt // Keep raw data for debugging
      };
    };

    const response = {
      austen: austenData.map(apt => transformAppointment(apt, 'austen')),
      dad: dadData.map(apt => transformAppointment(apt, 'dad')),
      meta: {
        fetchedAt: new Date().toISOString(),
        dateRange: { min: minDate, max: maxDate }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Failed to fetch Acuity data:', error);
    // Return mock data as fallback
    res.status(200).json({
      austen: getMockData().austen,
      dad: getMockData().dad,
      meta: { fallback: true, error: error.message }
    });
  }
}

async function fetchAppointments(account, baseUrl, minDate, maxDate) {
  // Use btoa for base64 encoding (works in both Node and Edge runtime)
  const auth = btoa(`${account.userId}:${account.apiKey}`);
  
  const url = `${baseUrl}/appointments?minDate=${minDate}&maxDate=${maxDate}&max=100`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Acuity API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Failed to fetch ${account.userId}:`, error);
    return [];
  }
}

function getMockData() {
  return {
    austen: [
      { id: '1', student: 'Will Weng', time: '8:30am', instructor: 'Aaron', lesson: '3 of 4', location: 'Tempe', date: '2026-02-03' },
      { id: '2', student: 'Demarious Johnson', time: '8:30am', instructor: 'Ryan', lesson: '3 of 4', location: 'Gilbert', date: '2026-02-03' },
      { id: '3', student: 'Enzo Cascio', time: '2:30pm', instructor: 'Ryan', lesson: '1 of 4', location: 'Scottsdale', date: '2026-02-03' },
      { id: '4', student: 'Alexis Hayes', time: '2:30pm', instructor: 'Austen', lesson: 'Single', location: 'Greenway', date: '2026-02-03' },
      { id: '5', student: 'Thomas Chutes', time: '2:30pm', instructor: 'Aaron', lesson: '1 of 4', location: 'Gilbert', date: '2026-02-03' },
      { id: '6', student: 'Keaton Huls', time: '5:30pm', instructor: 'Ryan', lesson: '1 of 2', location: 'Downtown Phoenix', date: '2026-02-03' },
      { id: '7', student: 'Lily Vaughan', time: '5:30pm', instructor: 'Aaron', lesson: '1 of ?', location: 'Gilbert', date: '2026-02-03' }
    ],
    dad: [
      { id: '8', student: 'Brayden Miller', time: '2:30pm', instructor: 'Ernie', lesson: '1 of 4', location: 'Peoria', date: '2026-02-04' },
      { id: '9', student: 'Samantha Jones', time: '9:00am', instructor: 'Michelle', lesson: '2 of 4', location: 'Glendale', date: '2026-02-03' },
      { id: '10', student: 'Marcus Chen', time: '11:00am', instructor: 'Allan', lesson: '3 of 4', location: 'Surprise', date: '2026-02-03' },
      { id: '11', student: 'Emma Rodriguez', time: '1:00pm', instructor: 'Bob', lesson: '1 of 4', location: 'Sun City', date: '2026-02-03' },
      { id: '12', student: 'Tyler Johnson', time: '3:30pm', instructor: 'Brandon', lesson: '2 of 2', location: 'Goodyear', date: '2026-02-03' },
      { id: '13', student: 'Ava Smith', time: '5:00pm', instructor: 'Freddy', lesson: '1 of 4', location: 'Litchfield Park', date: '2026-02-03' }
    ]
  };
}