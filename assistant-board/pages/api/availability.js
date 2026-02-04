// API route to fetch live availability from Acuity
// This runs on the server to keep API keys secure

import { acuityConfig } from '../../data/acuity-config.js';

export default async function handler(req, res) {
  const { city, account, date, days = 14 } = req.query;
  
  if (!city || !account) {
    return res.status(400).json({ error: 'City and account required' });
  }
  
  const config = acuityConfig[account];
  if (!config) {
    return res.status(400).json({ error: 'Invalid account' });
  }
  
  const cityConfig = config.cities[city];
  if (!cityConfig) {
    return res.status(400).json({ error: 'Invalid city' });
  }
  
  if (!cityConfig.active) {
    return res.status(200).json({ 
      available: false, 
      reason: 'Location not currently accepting bookings',
      city: cityConfig.name 
    });
  }
  
  try {
    const credentials = Buffer.from(`${config.accountId}:${config.apiKey}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json'
    };
    
    // Generate date range
    const startDate = date || new Date().toISOString().split('T')[0];
    const dates = [];
    for (let i = 0; i < parseInt(days); i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    
    // Fetch availability for each date
    const availability = [];
    const appointmentTypeId = cityConfig.appointmentTypeId;
    
    for (const checkDate of dates) {
      try {
        const url = `https://acuityscheduling.com/api/v1/availability/times?date=${checkDate}&appointmentTypeID=${appointmentTypeId}`;
        const response = await fetch(url, { headers });
        
        if (response.ok) {
          const times = await response.json();
          if (times && times.length > 0) {
            availability.push({
              date: checkDate,
              times: times.map(t => ({
                time: t.time,
                endTime: t.endTime,
                available: true
              }))
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching ${checkDate}:`, e);
      }
    }
    
    res.status(200).json({
      city: cityConfig.name,
      account: account,
      appointmentTypeId,
      specialPricing: cityConfig.specialPricing || null,
      availability
    });
    
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: error.message });
  }
}