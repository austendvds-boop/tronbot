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

  const mockTimes = [
    { date: '2026-02-04', time: '8:00am' },
    { date: '2026-02-04', time: '10:30am' },
    { date: '2026-02-04', time: '1:00pm' },
    { date: '2026-02-05', time: '9:00am' },
    { date: '2026-02-05', time: '11:30am' },
    { date: '2026-02-05', time: '2:00pm' },
    { date: '2026-02-06', time: '8:30am' },
    { date: '2026-02-06', time: '1:30pm' }
  ];

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

  if (step === 3) {
    // Check if time can be selected (1 lesson per week rule)
    const canSelectTime = (index) => {
      if (times.includes(index)) return true; // Can always deselect
      if (times.length >= pkg.lessons) return false; // Max lessons reached
      
      // Check 7-day restriction
      const selectedDate = new Date(mockTimes[index].date);
      for (const selectedIndex of times) {
        const existingDate = new Date(mockTimes[selectedIndex].date);
        const diffDays = Math.abs((selectedDate - existingDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return false; // Too close to existing lesson
      }
      return true;
    };

    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}>
          <h1 style={styles.title}>Select {pkg.lessons} Times</h1>
          <p style={{color: '#8b949e', fontSize: '14px'}}>1 lesson per week minimum</p>
        </div>
        <div style={styles.card}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
            {mockTimes.map((t, i) => {
              const isSelected = times.includes(i);
              const canSelect = canSelectTime(i);
              return (
                <button 
                  key={i} 
                  style={{
                    ...styles.timeBtn, 
                    ...(isSelected && styles.timeSelected),
                    ...(!canSelect && !isSelected && {opacity: 0.3, cursor: 'not-allowed'})
                  }} 
                  onClick={() => {
                    if (isSelected) setTimes(times.filter(x => x !== i));
                    else if (canSelect) setTimes([...times, i]);
                  }}
                  disabled={!canSelect && !isSelected}
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
  if (step === 4) {
    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}><h1 style={styles.title}>Student Info</h1></div>
        <div style={styles.card}>
          <input placeholder="First Name" style={styles.input} />
          <input placeholder="Last Name" style={styles.input} />
          <input placeholder="Email" type="email" style={styles.input} />
          <input placeholder="Phone" type="tel" style={styles.input} />
          <input placeholder="Address" style={styles.input} />
          <textarea placeholder="Notes (optional)" style={{...styles.input, minHeight: '80px', resize: 'vertical'}} />
          <button style={styles.button} onClick={() => setStep(5)}>
            Review & Pay â†’
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Review & Pay
  return (
    <div style={styles.container}>
      <Head><title>Book | DVDS</title></Head>
      <div style={styles.header}><h1 style={styles.title}>Complete Booking</h1></div>
      <div style={styles.card}>
        <p><strong>{location.name}</strong> â€¢ {pkg.name}</p>
        <p style={styles.price}>${pkg.price}</p>
        <p>{times.length} lessons selected</p>
        <button style={styles.button} onClick={() => alert(`DEMO: Paid $${pkg.price}! Confirmation: DVDS-${Math.random().toString(36).substr(2,8).toUpperCase()}`)}>
          Pay ${pkg.price} â†’
        </button>
      </div>
    </div>
  );
}