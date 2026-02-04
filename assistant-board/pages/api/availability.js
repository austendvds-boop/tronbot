// Fetch real availability from Acuity using Edge Runtime
export const config = {
  runtime: 'edge',
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

// Correct appointment type IDs from Acuity
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
    westValley: '85088423'
  },
  dad: {
    anthem: '50529545',
    glendale: '50529778',
    northPhoenix: '50529846',
    peoria: '50529862',
    sunCity: '50529915',
    surprise: '50529929'
  }
};

export default async function handler(request) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city');
  const account = url.searchParams.get('account');
  const days = parseInt(url.searchParams.get('days') || '14');
  
  if (!city || !account) {
    return new Response(JSON.stringify({ error: 'Missing city or account' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const config = acuityConfig[account];
  const aptTypeId = appointmentTypes[account]?.[city];
  
  if (!config || !aptTypeId) {
    return new Response(JSON.stringify({ error: 'Invalid city or account', city, account }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const credentials = btoa(`${config.userId}:${config.apiKey}`);
    const slots = [];
    
    // Get dates to check
    const startDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      try {
        const response = await fetch(
          `https://acuityscheduling.com/api/v1/availability/times?date=${dateStr}&appointmentTypeID=${aptTypeId}`,
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
              slots.push({
                date: dateStr,
                time: t.time,
                endTime: t.endTime
              });
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching ${dateStr}:`, e);
      }
    }
    
    return new Response(JSON.stringify({
      city,
      account,
      slots,
      count: slots.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}