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

  // Generate 8 weeks of mock times for demo
  const mockTimes = [];
  const baseDate = new Date('2026-02-04');
  
  for (let week = 0; week < 8; week++) {
    const weekDate = new Date(baseDate);
    weekDate.setDate(weekDate.getDate() + (week * 7));
    
    const dateStr = weekDate.toISOString().split('T')[0];
    
    // Add times for this week (Mon-Sat, no Sunday)
    mockTimes.push({ date: dateStr, time: '8:00am' });
    mockTimes.push({ date: dateStr, time: '10:30am' });
    mockTimes.push({ date: dateStr, time: '1:00pm' });
    mockTimes.push({ date: dateStr, time: '3:30pm' });
    
    // Add next day (Tuesday)
    const tuesday = new Date(weekDate);
    tuesday.setDate(tuesday.getDate() + 1);
    const tueStr = tuesday.toISOString().split('T')[0];
    mockTimes.push({ date: tueStr, time: '9:00am' });
    mockTimes.push({ date: tueStr, time: '11:30am' });
    mockTimes.push({ date: tueStr, time: '2:00pm' });
  }

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

  // Step 3: Select Times with tabs
  if (step === 3) {
    // Check if multiple lessons per week selected
    const hasMultiplePerWeek = () => {
      for (let i = 0; i < times.length; i++) {
        for (let j = i + 1; j < times.length; j++) {
          const date1 = new Date(mockTimes[times[i]].date);
          const date2 = new Date(mockTimes[times[j]].date);
          const diffDays = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
          if (diffDays < 7) return true;
        }
      }
      return false;
    };

    const violation = hasMultiplePerWeek();

    // Get dates that already have a lesson selected
    const selectedDates = new Set(times.map(i => mockTimes[i].date));

    // Filter times based on tab AND hide other times on same day
    const filteredTimes = mockTimes.map((t, i) => ({...t, index: i})).filter(t => {
      // Hide if another time on same day is already selected (unless this is the selected one)
      if (selectedDates.has(t.date) && !times.includes(t.index)) return false;

      const date = new Date(t.date);
      const day = date.getDay(); // 0=Sun, 6=Sat
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
      flex: 1,
      padding: '12px 8px',
      border: 'none',
      borderRadius: '8px',
      background: active ? '#238636' : '#30363d',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '13px',
      cursor: 'pointer'
    });

    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}>
          <h1 style={styles.title}>Select {pkg.lessons} Times</h1>
          <p style={{color: '#8b949e', fontSize: '14px'}}>1 lesson per week recommended</p>
        </div>
        <div style={styles.card}>
          {violation && (
            <div style={{background: '#da3633', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>
              <strong>âš ï¸ Multiple Lessons Per Week</strong>
              <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>
                You've selected lessons less than 7 days apart. 
                An additional $50 surcharge will apply.
              </p>
            </div>
          )}
          
          {/* Filter Tabs */}
          <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
            <button style={tabStyle(timeFilter === 'all')} onClick={() => setTimeFilter('all')}>All Times</button>
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
                  style={{
                    ...styles.timeBtn, 
                    ...(isSelected && styles.timeSelected)
                  }} 
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
          {times.length === pkg.lessons && <button style={{...styles.button, marginTop: '16px'}} onClick={() => setStep(4)}>Continue â†’</button>}
        </div>
      </div>
    );
  }

  // Step 4: Student Info
  // Step 4: Pay First
  const [paid, setPaid] = useState(false);
  
  if (step === 4) {
    // Check for multiple per week violation
    const hasViolation = () => {
      for (let i = 0; i < times.length; i++) {
        for (let j = i + 1; j < times.length; j++) {
          const date1 = new Date(mockTimes[times[i]].date);
          const date2 = new Date(mockTimes[times[j]].date);
          const diffDays = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
          if (diffDays < 7) return true;
        }
      }
      return false;
    };

    const violation = hasViolation();
    const surcharge = violation ? 50 : 0;
    const totalPrice = pkg.price + surcharge;

    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}><h1 style={styles.title}>Complete Payment</h1></div>
        <div style={styles.card}>
          <p><strong>{location.name}</strong> â€¢ {pkg.name}</p>
          <p style={styles.price}>${totalPrice}</p>
          {violation && (
            <div style={{background: '#da3633', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'}}>
              <strong>âš ï¸ Multiple Lessons Per Week Surcharge: +$50</strong>
              <p style={{margin: '4px 0 0 0'}}>Base: ${pkg.price} + Surcharge: $50 = ${totalPrice}</p>
            </div>
          )}
          <p>{times.length} lessons selected</p>
          <button style={styles.button} onClick={() => {alert(`DEMO: Paid $${totalPrice}!`); setPaid(true); setStep(5);}}>
            Pay ${totalPrice} â†’
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Student Info After Payment
  return (
    <div style={styles.container}>
      <Head><title>Book | DVDS</title></Head>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Info</h1>
        <p style={{color: '#238636'}}>âœ… Payment Received</p>
      </div>
      <div style={styles.card}>
        <p style={{marginBottom: '16px', color: '#8b949e'}}>
          Complete your booking details below
        </p>
        <input placeholder="First Name" style={styles.input} />
        <input placeholder="Last Name" style={styles.input} />
        <input placeholder="Email" type="email" style={styles.input} />
        <input placeholder="Phone" type="tel" style={styles.input} />
        <input placeholder="Address" style={styles.input} />
        <textarea placeholder="Notes (optional)" style={{...styles.input, minHeight: '80px', resize: 'vertical'}} />
        <button style={styles.button} onClick={() => alert(`Booking confirmed! Confirmation: DVDS-${Math.random().toString(36).substr(2,8).toUpperCase()}`)}>
          Complete Booking â†’
        </button>
      </div>
    </div>
  );
}