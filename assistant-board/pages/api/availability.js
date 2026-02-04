export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, account } = req.query;
  
  if (!city || !account) {
    return res.status(400).json({ error: 'Missing city or account' });
  }

  // Return mock data for now
  res.status(200).json({
    city,
    account,
    slots: [
      { date: '2026-02-05', time: '10:00am' },
      { date: '2026-02-05', time: '2:00pm' },
      { date: '2026-02-06', time: '9:00am' }
    ],
    note: 'Real Acuity integration pending'
  });
}