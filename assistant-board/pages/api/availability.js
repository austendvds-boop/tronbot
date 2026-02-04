// Fetch real availability from Acuity

export const config = {
  api: {
    bodyParser: true,
  },
};

const acuityConfig = {
  austen: {
    userId: '23214568',
    apiKey: '49898594aad433ade289daad5fbd8e84'
  },
  dad: {
    userId: '28722957',
    apiKey: '2c8203e58babe46dd2a39ca9aade2229'
  }
};

// Appointment type IDs for License Ready package
const licenseReadyTypes = {
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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { city, account, days = 14 } = req.query;
  
  if (!city || !account) {
    return res.status(400).json({ error: 'Missing city or account' });
  }
  
  const config = acuityConfig[account];
  const aptTypeId = licenseReadyTypes[account]?.[city];
  
  if (!config || !aptTypeId) {
    return res.status(400).json({ error: 'Invalid city or account', city, account });
  }
  
  try {
    const credentials = Buffer.from(`${config.userId}:${config.apiKey}`).toString('base64');
    
    // Get dates to check
    const dates = [];
    const startDate = new Date();
    for (let i = 0; i < parseInt(days); i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    
    // Fetch availability for each date
    const allSlots = [];
    
    for (const date of dates) {
      try {
        const response = await fetch(
          `https://acuityscheduling.com/api/v1/availability/times?date=${date}&appointmentTypeID=${aptTypeId}`,
          {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const times = await response.json();
          if (times && times.length > 0) {
            times.forEach(t => {
              allSlots.push({
                date: date,
                time: t.time,
                endTime: t.endTime
              });
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching ${date}:`, e);
      }
    }
    
    res.status(200).json({
      city,
      account,
      slots: allSlots,
      count: allSlots.length
    });
    
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: error.message });
  }
}