import { useState, useEffect } from 'react';
import Head from 'next/head';

// Cached availability - updated daily via cron
const cachedAvailability = {
  lastUpdated: '2026-02-03',
  austen: {
    '2026-02-04': ['8:00am', '10:30am', '1:00pm', '3:30pm'],
    '2026-02-05': ['9:00am', '11:30am', '2:00pm'],
    '2026-02-06': ['8:30am', '1:30pm', '4:00pm'],
    '2026-02-07': ['10:00am', '2:30pm'],
    '2026-02-08': ['9:30am', '12:00pm', '3:00pm']
  },
  dad: {
    '2026-02-04': ['9:00am', '11:00am', '2:00pm', '4:00pm'],
    '2026-02-05': ['8:30am', '10:30am', '1:30pm', '3:30pm'],
    '2026-02-06': ['9:00am', '12:00pm', '2:30pm'],
    '2026-02-07': ['10:00am', '1:00pm', '4:00pm'],
    '2026-02-08': ['8:00am', '11:00am', '2:00pm']
  }
};

const zones = {
  austen: ['Gilbert', 'Chandler', 'Tempe', 'Scottsdale', 'Mesa', 'Ahwatukee', 'Queen Creek', 'San Tan Valley', 'Anthem', 'Cave Creek', 'North Phoenix', 'Apache Junction', 'Casa Grande', 'Downtown Phoenix', 'West Valley', 'Flagstaff', 'Sedona', 'Cottonwood'],
  dad: ['Glendale', 'Peoria', 'Surprise', 'Sun City', 'Avondale', 'Goodyear', 'Buckeye', 'El Mirage', 'Tolleson', 'Anthem', 'Cave Creek', 'North Phoenix', 'Scottsdale']
};

const packages = {
  regular: { name: '4 Lessons (2.5 hrs each)', price: 450, description: 'Most popular. Four 2.5-hour lessons.' },
  earlyBird: { name: 'Early Bird - 2 Lessons (5 hrs each)', price: 400, description: 'Best value. Two 5-hour lessons. Mornings only.' },
  single: { name: 'Single Lesson (2.5 hrs)', price: 125, description: 'One lesson. Great for refreshers.' }
};

export default function BookingV2() {
  const [step, setStep] = useState(1);
  const [zone, setZone] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });

  const dates = Object.keys(cachedAvailability[zone || 'austen'] || {});

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', marginBottom: '5px' },
    stepper: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' },
    step: { width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    stepActive: { background: '#238636', color: 'white' },
    stepInactive: { background: '#30363d', color: '#8b949e' },
    card: { background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', border: '1px solid #30363d', borderRadius: '6px', background: '#0d1117', color: '#c9d1d9', fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box' },
    button: { padding: '14px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%' },
    primary: { background: '#238636', color: 'white' },
    secondary: { background: '#1f6feb', color: 'white' },
    package: { background: '#0d1117', padding: '15px', borderRadius: '6px', border: '2px solid #30363d', marginBottom: '12px', cursor: 'pointer' },
    pkgSelected: { borderColor: '#238636' },
    dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' },
    dateBtn: { padding: '12px', border: '1px solid #30363d', borderRadius: '6px', background: '#0d1117', color: '#c9d1d9', cursor: 'pointer', textAlign: 'center' },
    dateSelected: { background: '#1f6feb', borderColor: '#1f6feb' },
    timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
    timeBtn: { padding: '10px', border: '1px solid #30363d', borderRadius: '6px', background: '#0d1117', color: '#c9d1d9', cursor: 'pointer' },
    timeSelected: { background: '#238636', borderColor: '#238636' },
    price: { fontSize: '24px', fontWeight: 'bold', color: '#58a6ff' },
    back: { color: '#58a6ff', textDecoration: 'none', display: 'inline-block', marginBottom: '15px' }
  };

  const detectZone = () => {
    const input = form.address.toLowerCase();
    if (zones.austen.some(c => input.includes(c.toLowerCase()))) setZone('austen');
    else if (zones.dad.some(c => input.includes(c.toLowerCase()))) setZone('dad');
    else setZone('austen'); // default
    setStep(2);
  };

  const renderStep1 = () => (
    <div style={styles.card}>
      <h2>Where are you located?</h2>
      <p style={{color: '#8b949e', marginBottom: '15px'}}>Enter your address to see available time slots in your area.</p>
      <input placeholder="123 Main St, Gilbert, AZ" style={styles.input} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
      <input placeholder="First Name" style={styles.input} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
      <input placeholder="Last Name" style={styles.input} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
      <input placeholder="Email" type="email" style={styles.input} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      <input placeholder="Phone" type="tel" style={styles.input} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
      <button style={{...styles.button, ...styles.primary}} onClick={detectZone}>See Availability â†’</button>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(1)}>â† Back</a>
      <h2>Choose Your Package</h2>
      
      <div style={{...styles.package, ...(selectedPkg === 'regular' && styles.pkgSelected)}} onClick={() => setSelectedPkg('regular')}>
        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{packages.regular.name}</div>
        <div style={styles.price}>${packages.regular.price}</div>
        <div style={{color: '#8b949e', fontSize: '14px'}}>{packages.regular.description}</div>
      </div>
      
      <div style={{...styles.package, ...(selectedPkg === 'earlyBird' && styles.pkgSelected)}} onClick={() => setSelectedPkg('earlyBird')}>
        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{packages.earlyBird.name}</div>
        <div style={styles.price}>${packages.earlyBird.price}</div>
        <div style={{color: '#8b949e', fontSize: '14px'}}>{packages.earlyBird.description}</div>
      </div>
      
      <div style={{...styles.package, ...(selectedPkg === 'single' && styles.pkgSelected)}} onClick={() => setSelectedPkg('single')}>
        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{packages.single.name}</div>
        <div style={styles.price}>${packages.single.price}</div>
        <div style={{color: '#8b949e', fontSize: '14px'}}>{packages.single.description}</div>
      </div>
      
      {selectedPkg && <button style={{...styles.button, ...styles.primary, marginTop: '10px'}} onClick={() => setStep(3)}>Continue â†’</button>}
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(2)}>â† Back</a>
      <h2>Pick Your First Lesson</h2>
      <p style={{color: '#8b949e', marginBottom: '15px'}}>Showing availability for {zone === 'austen' ? "Austen's team" : "Dad's team"}</p>
      
      <h3 style={{marginBottom: '10px'}}>Select Date</h3>
      <div style={styles.dateGrid}>
        {dates.map(date => (
          <button key={date} style={{...styles.dateBtn, ...(selectedDate === date && styles.dateSelected)}} onClick={() => {setSelectedDate(date); setSelectedTime(null);}}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>
      
      {selectedDate && (
        <>
          <h3 style={{marginBottom: '10px'}}>Select Time</h3>
          <div style={styles.timeGrid}>
            {cachedAvailability[zone][selectedDate].map(time => (
              <button key={time} style={{...styles.timeBtn, ...(selectedTime === time && styles.timeSelected)}} onClick={() => setSelectedTime(time)}>
                {time}
              </button>
            ))}
          </div>
        </>
      )}
      
      {selectedDate && selectedTime && (
        <button style={{...styles.button, ...styles.primary, marginTop: '20px'}} onClick={() => setStep(4)}>
          Continue to Payment â†’
        </button>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(3)}>â† Back</a>
      <h2>Complete Payment</h2>
      
      <div style={{background: '#21262d', padding: '15px', borderRadius: '6px', marginBottom: '20px'}}>
        <div><strong>Package:</strong> {packages[selectedPkg].name}</div>
        <div><strong>First Lesson:</strong> {new Date(selectedDate).toLocaleDateString()} at {selectedTime}</div>
        <div><strong>Location:</strong> {form.address}</div>
        <div style={{...styles.price, marginTop: '10px'}}>Total: ${packages[selectedPkg].price}</div>
      </div>
      
      <p style={{color: '#8b949e', marginBottom: '15px'}}>
        After payment, you'll receive a confirmation email with your lesson details and we'll schedule your remaining lessons.
      </p>
      
      {/* Stripe Payment Link - replace with real link */}
      <a href={`https://buy.stripe.com/YOUR_LINK?prefilled_email=${encodeURIComponent(form.email)}&amount=${packages[selectedPkg].price}00`} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
        <button style={{...styles.button, ...styles.primary}}>
          Pay ${packages[selectedPkg].price} â†’
        </button>
      </a>
      
      <p style={{color: '#8b949e', fontSize: '12px', marginTop: '15px', textAlign: 'center'}}>
        Secure payment via Stripe. You'll receive confirmation within 24 hours.
      </p>
    </div>
  );

  return (
    <div style={styles.container}>
      <Head>
        <title>Book Driving Lessons | Deer Valley Driving School</title>
        <style>{`body{margin:0;background:#0d1117;color:#c9d1d9}`}</style>
      </Head>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Book Your Lessons</h1>
        <p style={{color: '#8b949e'}}>See availability â†’ Pay â†’ Schedule</p>
      </header>
      
      <div style={styles.stepper}>
        {[1,2,3,4].map(n => (
          <div key={n} style={{...styles.step, ...(step >= n ? styles.stepActive : styles.stepInactive)}}>{n}</div>
        ))}
      </div>
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}