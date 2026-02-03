// API route to fetch combined schedule from both Acuity accounts
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return mock data for now
  res.status(200).json({
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
    ],
    meta: { 
      fetchedAt: new Date().toISOString(),
      fallback: true 
    }
  });
}