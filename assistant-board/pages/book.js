import { useState } from 'react';
import Head from 'next/head';

const packages = {
  ultimate: { name: 'Ultimate Package', price: 1299, lessons: 8, hours: 20 },
  license: { name: 'License Ready Package', price: 680, lessons: 4, hours: 10 },
  intro: { name: 'Intro to Driving', price: 350, lessons: 2, hours: 5 },
  express: { name: 'Express Lesson', price: 200, lessons: 1, hours: 2.5 }
};

const locations = {
  gilbert: { name: 'Gilbert', account: 'austen', instructors: 'Aaron/Ryan' },
  chandler: { name: 'Chandler', account: 'austen', instructors: 'Aaron/Ryan' },
  mesa: { name: 'Mesa', account: 'austen', instructors: 'Aaron/Ryan' },
  scottsdale: { name: 'Scottsdale', account: 'austen', instructors: 'Austen' },
  tempe: { name: 'Tempe', account: 'austen', instructors: 'Austen' },
  anthem: { name: 'Anthem', account: 'austen', instructors: 'Austen' },
  glendale: { name: 'Glendale', account: 'dad', instructors: 'Ernie/Michelle' },
  peoria: { name: 'Peoria', account: 'dad', instructors: 'Ernie/Freddy' }
};

// Generate mock times once
const generateMockTimes = () => {
  const times = [];
  const baseDate = new Date('2026-02-04');
  
  for (let week = 0; week < 8; week++) {
    const weekDate = new Date(baseDate);
    weekDate.setDate(weekDate.getDate() + (week * 7));
    const dateStr = weekDate.toISOString().split('T')[0];
    
    times.push({ date: dateStr, time: '8:00am' });
    times.push({ date: dateStr, time: '10:30am' });
    times.push({ date: dateStr, time: '1:00pm' });
    times.push({ date: dateStr, time: '3:30pm' });
    
    const tuesday = new Date(weekDate);
    tuesday.setDate(tuesday.getDate() + 1);
    const tueStr = tuesday.toISOString().split('T')[0];
    times.push({ date: tueStr, time: '9:00am' });
    times.push({ date: tueStr, time: '11:30am' });
    times.push({ date: tueStr, time: '2:00pm' });
  }
  return times;
};

const mockTimes = generateMockTimes();

export default function Booking() {
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [times, setTimes] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');

  const detectLocation = () => {
    const input = city.toLowerCase();
    if (input.includes('gilbert')) setLocation(locations.gilbert);
    else if (input.includes('chandler')) setLocation(locations.chandler);
    else if (input.includes('mesa')) setLocation(locations.mesa);
    else if (input.includes('scottsdale')) setLocation(locations.scottsdale);
    else if (input.includes('tempe')) setLocation(locations.tempe);
    else if (input.includes('anthem')) setLocation(locations.anthem);
    else if (input.includes('glendale')) setLocation(locations.glendale);
    else if (input.includes('peoria')) setLocation(locations.peoria);
    else setLocation(locations.gilbert);
    setStep(2);
  };

  const styles = {
    container: { maxWidth: '100%', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '20px' },
    title: { fontSize: '26px', fontWeight: '700' },
    card: { background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d', marginBottom: '16px' },
    input: { width: '100%', padding: '16px', border: '1px solid #30363d', borderRadius: '10px', background: '#0d1117', color: '#c9d1d9', fontSize: '17px', marginBottom: '16px' },
    button: { padding: '18px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', width: '100%', background: '#238636', color: 'white' },
    package: { padding: '18px', borderRadius: '10px', border: '2px solid #30363d', marginBottom: '12px', cursor: 'pointer' },
    pkgSelected: { borderColor: '#238636', background: '#1f2937' },
    price: { fontSize: '28px', fontWeight: 'bold', color: '#58a6ff' },
    timeBtn: { padding: '14px', borderRadius: '8px', border: '2px solid #30363d', background: '#0d1117', color: '#c9d1d9', cursor: 'pointer', fontSize: '15px' },
    timeSelected: { borderColor: '#238636', background: '#238636', color: 'white' }
  };

  // Step 1: City
  if (step === 1) {
    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <div style={styles.header}><h1 style={styles.title}>Book Your Lessons</h1></div>
        <div style={styles.card}>
          <h2>Where are you located?</h2>
          <input placeholder="e.g. Gilbert, AZ" style={styles.input} value={city} onChange={e => setCity(e.target.value)} />
          <button style={styles.button} onClick={detectLocation}>Continue â†’</button>
        </div>
      </div>
    );
  }

  // Step 2: Package
  if (step === 2) {
    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}><h1 style={styles.title}>{location.name}</h1><p>{location.instructors}</p></div>
        <div style={styles.card}>
          <h2>Select Package</h2>
          {Object.entries(packages).map(([key, p]) => (
            <div key={key} style={{...styles.package, ...(pkg?.name === p.name && styles.pkgSelected)}} onClick={() => setPkg(p)}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontWeight: 'bold'}}>{p.name}</span>
                <span style={styles.price}>${p.price}</span>
              </div>
              <div style={{color: '#8b949e'}}>{p.lessons} lessons â€¢ {p.hours} hrs</div>
            </div>
          ))}
          {pkg && <button style={styles.button} onClick={() => setStep(3)}>Select {pkg.lessons} Times â†’</button>}
        </div>
      </div>
    );
  }

  // Step 3: Times
  if (step === 3 && pkg) {
    const isComplete = times.length === pkg.lessons;
    
    // Check for violations
    let violation = false;
    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        const t1 = mockTimes[times[i]];
        const t2 = mockTimes[times[j]];
        if (t1 && t2) {
          const d1 = new Date(t1.date);
          const d2 = new Date(t2.date);
          const diff = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
          if (diff < 7) violation = true;
        }
      }
    }

    // Get selected dates
    const selectedDates = new Set();
    times.forEach(idx => {
      const t = mockTimes[idx];
      if (t) selectedDates.add(t.date);
    });

    // Filter times
    const filteredTimes = mockTimes.map((t, i) => ({...t, index: i})).filter(t => {
      if (selectedDates.has(t.date) && !times.includes(t.index)) return false;
      const date = new Date(t.date);
      const day = date.getDay();
      const hour = parseInt(t.time);
      const isPM = t.time.includes('pm');
      const isAfternoon = isPM && hour >= 1;
      const isMorning = !isPM || (isPM && hour === 12);
      
      if (timeFilter === 'weekend') return day === 0 || day === 6;
      if (timeFilter === 'afternoon') return (day >= 1 && day <= 5) && isAfternoon;
      if (timeFilter === 'morning') return (day >= 1 && day <= 5) && isMorning;
      return true;
    });

    const tabStyle = (active) => ({
      flex: 1, padding: '12px 4px', border: 'none', borderRadius: '8px',
      background: active ? '#238636' : '#30363d', color: 'white',
      fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
    });

    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}>
          <h1 style={styles.title}>{isComplete ? 'All Times Selected!' : `Select ${pkg.lessons} Times`}</h1>
          {!isComplete && <p style={{color: '#8b949e', fontSize: '14px'}}>1 lesson per week</p>}
        </div>
        <div style={styles.card}>
          {violation && (
            <div style={{background: '#da3633', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>
              <strong>âš ï¸ Multiple Lessons Per Week</strong>
              <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>+$50 surcharge applies</p>
            </div>
          )}
          
          {!isComplete ? (
            <>
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                <button style={tabStyle(timeFilter === 'all')} onClick={() => setTimeFilter('all')}>All</button>
                <button style={tabStyle(timeFilter === 'morning')} onClick={() => setTimeFilter('morning')}>Morning M-F</button>
                <button style={tabStyle(timeFilter === 'afternoon')} onClick={() => setTimeFilter('afternoon')}>Afternoon M-F</button>
                <button style={tabStyle(timeFilter === 'weekend')} onClick={() => setTimeFilter('weekend')}>Weekend</button>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
                {filteredTimes.map((t) => {
                  const isSelected = times.includes(t.index);
                  return (
                    <button 
                      key={t.index} 
                      style={{...styles.timeBtn, ...(isSelected && styles.timeSelected)}} 
                      onClick={() => {
                        if (isSelected) setTimes(times.filter(x => x !== t.index));
                        else if (times.length < pkg.lessons) setTimes([...times, t.index]);
                      }}
                    >
                      {t.date.slice(5)} {t.time}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{textAlign: 'center', padding: '20px 0'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>âœ…</div>
              <p style={{fontSize: '18px', marginBottom: '20px'}}>{times.length} lessons selected</p>
              <button style={styles.button} onClick={() => setStep(4)}>Continue â†’</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4: Pay
  if (step === 4 && pkg) {
    let violation = false;
    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        const t1 = mockTimes[times[i]];
        const t2 = mockTimes[times[j]];
        if (t1 && t2) {
          const diff = Math.abs((new Date(t1.date) - new Date(t2.date)) / (1000 * 60 * 60 * 24));
          if (diff < 7) violation = true;
        }
      }
    }
    const surcharge = violation ? 50 : 0;
    const total = pkg.price + surcharge;

    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}><h1 style={styles.title}>Complete Payment</h1></div>
        <div style={styles.card}>
          <p><strong>{location?.name}</strong> â€¢ {pkg.name}</p>
          <p style={styles.price}>${total}</p>
          {violation && <p style={{color: '#da3633'}}>+$50 surcharge applied</p>}
          <button style={styles.button} onClick={() => {alert(`Paid $${total}!`); setStep(5);}}>
            Pay ${total} â†’
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Info
  return (
    <div style={styles.container}>
      <Head><title>Book | DVDS</title></Head>
      <div style={styles.header}><h1 style={styles.title}>Student Info</h1><p style={{color: '#238636'}}>âœ… Payment Received</p></div>
      <div style={styles.card}>
        <input placeholder="First Name" style={styles.input} />
        <input placeholder="Last Name" style={styles.input} />
        <input placeholder="Email" type="email" style={styles.input} />
        <input placeholder="Phone" type="tel" style={styles.input} />
        <input placeholder="Address" style={styles.input} />
        <textarea placeholder="Notes (optional)" style={{...styles.input, minHeight: '80px'}} />
        <button style={styles.button} onClick={() => alert('Booking confirmed!')}>
          Complete Booking â†’
        </button>
      </div>
    </div>
  );
}