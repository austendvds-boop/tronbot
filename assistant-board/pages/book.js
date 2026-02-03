import { useState } from 'react';
import Head from 'next/head';

// Real packages from Acuity - location specific
const locationPackages = {
  // Austen's locations
  ahwatukee: { account: 'austen', name: 'Ahwatukee', price: 170, instructor: 'Aaron', zone: 'East Valley' },
  anthem: { account: 'austen', name: 'Anthem', price: 170, instructor: 'Austen', zone: 'North', dual: true }, // Both serve
  apacheJunction: { account: 'austen', name: 'Apache Junction', price: 170, instructor: 'Ryan', zone: 'East Valley' },
  caveCreek: { account: 'austen', name: 'Cave Creek', price: 170, instructor: 'Austen', zone: 'North', dual: true },
  chandler: { account: 'austen', name: 'Chandler', price: 170, instructor: 'Aaron/Ryan', zone: 'East Valley' },
  downtownPhoenix: { account: 'austen', name: 'Downtown Phoenix', price: 170, instructor: 'Austen', zone: 'Central' },
  flagstaff: { account: 'austen', name: 'Flagstaff/Sedona/Cottonwood', price: 0, instructor: 'Austen', zone: 'North', note: 'Contact for pricing' },
  gilbert: { account: 'austen', name: 'Gilbert', price: 170, instructor: 'Aaron/Ryan', zone: 'East Valley' },
  mesa: { account: 'austen', name: 'Mesa', price: 170, instructor: 'Aaron/Ryan', zone: 'East Valley' },
  northPhoenix: { account: 'austen', name: 'North Phoenix', price: 170, instructor: 'Austen', zone: 'North', dual: true },
  queenCreek: { account: 'austen', name: 'Queen Creek', price: 170, instructor: 'Ryan', zone: 'East Valley' },
  sanTanValley: { account: 'austen', name: 'San Tan Valley', price: 170, instructor: 'Ryan', zone: 'East Valley' },
  scottsdale: { account: 'austen', name: 'Scottsdale', price: 170, instructor: 'Austen', zone: 'East Valley', dual: true },
  tempe: { account: 'austen', name: 'Tempe', price: 170, instructor: 'Austen', zone: 'East Valley' },
  westValley: { account: 'austen', name: 'West Valley', price: 340, instructor: 'Austen', zone: 'West', note: '5-hour lessons' },
  
  // Dad's locations
  avondale: { account: 'dad', name: 'Avondale', price: 187.25, instructor: 'Ernie/Michelle', zone: 'West Valley' },
  buckeye: { account: 'dad', name: 'Buckeye', price: 187.25, instructor: 'Ernie/Allan', zone: 'West Valley' },
  elMirage: { account: 'dad', name: 'El Mirage', price: 170, instructor: 'Bob/Brandon', zone: 'West Valley' },
  glendale: { account: 'dad', name: 'Glendale', price: 170, instructor: 'Ernie/Michelle', zone: 'West Valley' },
  goodyear: { account: 'dad', name: 'Goodyear', price: 187.25, instructor: 'Allan/Bob', zone: 'West Valley' },
  peoria: { account: 'dad', name: 'Peoria', price: 170, instructor: 'Ernie/Freddy', zone: 'West Valley' },
  sunCity: { account: 'dad', name: 'Sun City', price: 170, instructor: 'Bob/Brandon', zone: 'West Valley' },
  surprise: { account: 'dad', name: 'Surprise', price: 170, instructor: 'Allan/Freddy', zone: 'West Valley' },
  tolleson: { account: 'dad', name: 'Tolleson', price: 187.25, instructor: 'Brandon/Freddy', zone: 'West Valley' }
};

// City to location key mapping
const cityMapping = {
  'ahwatukee': 'ahwatukee', 'anthem': 'anthem', 'apache junction': 'apacheJunction',
  'cave creek': 'caveCreek', 'chandler': 'chandler', 'downtown phoenix': 'downtownPhoenix',
  'flagstaff': 'flagstaff', 'sedona': 'flagstaff', 'cottonwood': 'flagstaff',
  'gilbert': 'gilbert', 'mesa': 'mesa', 'north phoenix': 'northPhoenix',
  'queen creek': 'queenCreek', 'san tan valley': 'sanTanValley', 'scottsdale': 'scottsdale',
  'tempe': 'tempe', 'west valley': 'westValley',
  'avondale': 'avondale', 'buckeye': 'buckeye', 'el mirage': 'elMirage',
  'glendale': 'glendale', 'goodyear': 'goodyear', 'peoria': 'peoria',
  'sun city': 'sunCity', 'surprise': 'surprise', 'tolleson': 'tolleson'
};

export default function BookingV2() {
  const [step, setStep] = useState(1);
  const [detectedLoc, setDetectedLoc] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const [selectedPkg, setSelectedPkg] = useState(null);

  const detectLocation = () => {
    const input = form.address.toLowerCase();
    let matched = null;
    
    for (const [city, key] of Object.entries(cityMapping)) {
      if (input.includes(city)) {
        matched = { key, ...locationPackages[key] };
        break;
      }
    }
    
    setDetectedLoc(matched || { notFound: true });
    setStep(2);
  };

  const styles = {
    container: { maxWidth: '100%', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh', boxSizing: 'border-box' },
    header: { textAlign: 'center', marginBottom: '24px', paddingTop: '10px' },
    title: { fontSize: '24px', marginBottom: '4px', fontWeight: '700' },
    stepper: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' },
    step: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' },
    stepActive: { background: '#238636', color: 'white' },
    stepInactive: { background: '#30363d', color: '#8b949e' },
    card: { background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d', marginBottom: '16px' },
    input: { width: '100%', padding: '16px', border: '1px solid #30363d', borderRadius: '10px', background: '#0d1117', color: '#c9d1d9', fontSize: '17px', marginBottom: '16px', boxSizing: 'border-box', minHeight: '52px' },
    button: { padding: '18px 24px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', width: '100%', minHeight: '56px', touchAction: 'manipulation' },
    primary: { background: '#238636', color: 'white' },
    secondary: { background: '#1f6feb', color: 'white' },
    locationCard: { background: '#0d1117', padding: '24px', borderRadius: '12px', border: '2px solid #30363d', marginBottom: '20px', textAlign: 'center' },
    locationName: { fontSize: '26px', fontWeight: 'bold', marginBottom: '12px' },
    price: { fontSize: '36px', fontWeight: 'bold', color: '#58a6ff', margin: '16px 0' },
    instructor: { color: '#8b949e', marginTop: '8px', fontSize: '16px' },
    zoneBadge: { display: 'inline-block', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' },
    austenBadge: { background: '#1f6feb', color: 'white' },
    dadBadge: { background: '#d29922', color: 'black' },
    package: { background: '#0d1117', padding: '20px', borderRadius: '12px', border: '2px solid #30363d', marginBottom: '16px', cursor: 'pointer', minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    pkgSelected: { borderColor: '#238636', background: '#1f2937' },
    back: { color: '#58a6ff', textDecoration: 'none', display: 'inline-block', marginBottom: '20px', cursor: 'pointer', fontSize: '16px', padding: '8px 0' }
  };

  const renderStep1 = () => (
    <div style={styles.card}>
      <h2>Where are you located?</h2>
      <p style={{color: '#8b949e', marginBottom: '15px'}}>Enter your address to see exact pricing for your area.</p>
      <input placeholder="123 Main St, Gilbert, AZ" style={styles.input} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
      <input placeholder="First Name" style={styles.input} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
      <input placeholder="Last Name" style={styles.input} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
      <input placeholder="Email" type="email" style={styles.input} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      <input placeholder="Phone" type="tel" style={styles.input} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
      <button style={{...styles.button, ...styles.primary}} onClick={detectLocation}>See My Pricing â†’</button>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(1)}>â† Back</a>
      
      {detectedLoc.notFound ? (
        <>
          <h2>Location Not Found</h2>
          <p style={{color: '#8b949e', marginBottom: '20px'}}>We couldn't detect your area. Choose your region:</p>
          <button style={{...styles.button, ...styles.secondary, marginBottom: '10px'}} onClick={() => setDetectedLoc({ key: 'gilbert', ...locationPackages.gilbert })}>
            East Valley (Gilbert, Chandler, Mesa, etc.)
          </button>
          <button style={{...styles.button, ...styles.primary}} onClick={() => setDetectedLoc({ key: 'glendale', ...locationPackages.glendale })}>
            West Valley (Glendale, Peoria, Surprise, etc.)
          </button>
        </>
      ) : (
        <>
          <div style={{...styles.zoneBadge, ...(detectedLoc.account === 'austen' ? styles.austenBadge : styles.dadBadge)}}>
            {detectedLoc.account === 'austen' ? "Austen's Team" : "Dad's Team"}
          </div>
          
          <div style={styles.locationCard}>
            <div style={styles.locationName}>{detectedLoc.name}</div>
            {detectedLoc.note ? (
              <div style={{color: '#d29922'}}>{detectedLoc.note}</div>
            ) : (
              <div style={styles.price}>${detectedLoc.price}<span style={{fontSize: '16px', color: '#8b949e'}}>/lesson</span></div>
            )}
            <div style={styles.instructor}>Instructor: {detectedLoc.instructor}</div>
            {detectedLoc.dual && (
              <div style={{color: '#d29922', fontSize: '12px', marginTop: '5px'}}>Both teams serve this area</div>
            )}
          </div>
          
          <button style={{...styles.button, ...styles.primary}} onClick={() => setStep(3)}>
            Continue â†’
          </button>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(2)}>â† Back</a>
      <h2>Select Package</h2>
      
      {!detectedLoc.note && (
        <>
          <div style={{...styles.package, ...(selectedPkg === 'four' && styles.pkgSelected)}} onClick={() => setSelectedPkg('four')}>
            <div style={{fontWeight: 'bold', fontSize: '18px'}}>4 Lesson Package</div>
            <div style={styles.price}>${detectedLoc.price * 4}</div>
            <div style={{color: '#8b949e'}}>Four 2.5-hour lessons. Most popular.</div>
          </div>
          
          <div style={{...styles.package, ...(selectedPkg === 'single' && styles.pkgSelected)}} onClick={() => setSelectedPkg('single')}>
            <div style={{fontWeight: 'bold', fontSize: '18px'}}>Single Lesson</div>
            <div style={styles.price}>${detectedLoc.price}</div>
            <div style={{color: '#8b949e'}}>One 2.5-hour lesson. Great for refreshers.</div>
          </div>
        </>
      )}
      
      <div style={{...styles.package, ...(selectedPkg === 'contact' && styles.pkgSelected)}} onClick={() => setSelectedPkg('contact')}>
        <div style={{fontWeight: 'bold', fontSize: '18px'}}>Contact for Pricing</div>
        <div style={{color: '#8b949e'}}>Special pricing for this location. We'll reach out.</div>
      </div>
      
      {selectedPkg && (
        <button style={{...styles.button, ...styles.primary, marginTop: '10px'}} onClick={() => setStep(4)}>
          Continue to Availability â†’
        </button>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(3)}>â† Back</a>
      <h2>Complete Booking</h2>
      
      <div style={{background: '#21262d', padding: '15px', borderRadius: '6px', marginBottom: '20px'}}>
        <div><strong>Location:</strong> {detectedLoc.name}</div>
        <div><strong>Instructor:</strong> {detectedLoc.instructor}</div>
        <div><strong>Package:</strong> {selectedPkg === 'four' ? '4 Lesson Package' : selectedPkg === 'single' ? 'Single Lesson' : 'Contact for Pricing'}</div>
        {selectedPkg !== 'contact' && (
          <div style={{...styles.price, marginTop: '10px'}}>
            ${selectedPkg === 'four' ? detectedLoc.price * 4 : detectedLoc.price}
          </div>
        )}
      </div>
      
      {selectedPkg === 'contact' ? (
        <button style={{...styles.button, ...styles.primary}} onClick={() => alert('Form submitted! We will contact you shortly.')}>
          Submit Request
        </button>
      ) : (
        <>
          <p style={{color: '#8b949e', marginBottom: '15px'}}>
            You'll be redirected to our scheduler to pick your lesson times after payment.
          </p>
          <button style={{...styles.button, ...styles.primary}} onClick={() => {
            const acuityUrl = detectedLoc.account === 'austen' 
              ? 'https://app.acuityscheduling.com/schedule.php?owner=23214568'
              : 'https://DeerValleyDrivingSchool.as.me';
            window.open(acuityUrl, '_blank');
          }}>
            Pay & Schedule â†’
          </button>
        </>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <Head>
        <title>Book Driving Lessons | Deer Valley Driving School</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style>{`
          body{margin:0;background:#0d1117;color:#c9d1d9;-webkit-tap-highlight-color:transparent}
          *{box-sizing:border-box}
        `}</style>
      </Head>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Book Your Lessons</h1>
        <p style={{color: '#8b949e'}}>Location-based pricing</p>
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