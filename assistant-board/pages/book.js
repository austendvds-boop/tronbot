import { useState } from 'react';
import Head from 'next/head';

// Zone mapping - which Acuity account serves which cities
const zones = {
  austen: [
    'Ahwatukee', 'Anthem', 'Apache Junction', 'Casa Grande', 'Cave Creek', 
    'Chandler', 'Downtown Phoenix', 'Flagstaff', 'Sedona', 'Cottonwood',
    'Gilbert', 'Mesa', 'North Phoenix', 'Queen Creek', 'San Tan Valley',
    'Scottsdale', 'Tempe', 'West Valley'
  ],
  dad: [
    'Anthem', 'Avondale', 'Buckeye', 'Cave Creek', 'El Mirage',
    'Glendale', 'Goodyear', 'North Phoenix', 'Peoria', 'Scottsdale',
    'Sun City', 'Surprise', 'Tolleson'
  ]
};

// Package options by location
const packages = {
  regular: {
    name: '4 Lesson Package (2.5 hrs each)',
    price: '$XXX',
    description: 'Four 2.5-hour lessons. Most popular option.'
  },
  earlyBird: {
    name: 'Early Bird Special - 5 Hour Lessons',
    price: '$XXX', 
    description: 'Two 5-hour lessons. Mornings only (Mon-Fri). Best value.'
  },
  single: {
    name: 'Single Lesson (2.5 hrs)',
    price: '$XXX',
    description: 'One 2.5-hour lesson. Great for refresher.'
  }
};

export default function BookingApp() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [detectedZone, setDetectedZone] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const detectZone = () => {
    const input = address.toLowerCase();
    
    // Check which zone the address is in
    const inAustenZone = zones.austen.some(city => input.includes(city.toLowerCase()));
    const inDadZone = zones.dad.some(city => input.includes(city.toLowerCase()));
    
    if (inAustenZone && inDadZone) {
      // Overlap - both serve this area, default to Austen
      setDetectedZone({ account: 'austen', cities: zones.austen, overlap: true });
    } else if (inAustenZone) {
      setDetectedZone({ account: 'austen', cities: zones.austen, overlap: false });
    } else if (inDadZone) {
      setDetectedZone({ account: 'dad', cities: zones.dad, overlap: false });
    } else {
      // Not found - show both options
      setDetectedZone({ account: null, cities: [], notFound: true });
    }
    setStep(2);
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #30363d', paddingBottom: '20px' },
    title: { fontSize: '28px', marginBottom: '10px' },
    subtitle: { color: '#8b949e', fontSize: '14px' },
    stepIndicator: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' },
    step: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
    stepActive: { background: '#238636', color: 'white' },
    stepInactive: { background: '#30363d', color: '#8b949e' },
    card: { background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', border: '1px solid #30363d', borderRadius: '6px', background: '#0d1117', color: '#c9d1d9', fontSize: '16px', marginBottom: '15px', boxSizing: 'border-box' },
    button: { padding: '12px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%' },
    primaryBtn: { background: '#238636', color: 'white' },
    secondaryBtn: { background: '#1f6feb', color: 'white' },
    zoneBadge: { display: 'inline-block', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' },
    austenBadge: { background: '#1f6feb', color: 'white' },
    dadBadge: { background: '#d29922', color: 'black' },
    packageCard: { background: '#0d1117', padding: '15px', borderRadius: '6px', border: '1px solid #30363d', marginBottom: '10px', cursor: 'pointer' },
    packageSelected: { borderColor: '#238636', background: '#1f2937' },
    packageTitle: { fontWeight: 'bold', marginBottom: '5px' },
    packagePrice: { color: '#58a6ff', fontSize: '18px', fontWeight: 'bold' },
    packageDesc: { color: '#8b949e', fontSize: '14px', marginTop: '5px' },
    backLink: { color: '#58a6ff', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }
  };

  const renderStep1 = () => (
    <div style={styles.card}>
      <h2>Enter Your Address</h2>
      <p style={{color: '#8b949e', marginBottom: '20px'}}>We'll match you with the right instructor based on your location.</p>
      <input
        type="text"
        placeholder="e.g., 123 Main St, Gilbert, AZ"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={styles.input}
      />
      <button onClick={detectZone} style={{...styles.button, ...styles.primaryBtn}}>
        Find My Zone
      </button>
      
      <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #30363d'}}>
        <p style={{color: '#8b949e', fontSize: '12px'}}>
          <strong>We serve:</strong><br/>
          Austen's Zone: Gilbert, Chandler, Tempe, Scottsdale, Mesa, Ahwatukee, Queen Creek, San Tan Valley, Anthem, Cave Creek, North Phoenix, Apache Junction, Casa Grande, Downtown Phoenix, West Valley, Flagstaff/Sedona/Cottonwood<br/><br/>
          Dad's Zone: Glendale, Peoria, Surprise, Sun City, Avondale, Goodyear, Buckeye, El Mirage, Tolleson, Anthem, Cave Creek, North Phoenix, Scottsdale
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.card}>
      <button onClick={() => setStep(1)} style={styles.backLink}>â† Back</button>
      
      {detectedZone.notFound ? (
        <>
          <h2>Location Not Found</h2>
          <p style={{color: '#8b949e', marginBottom: '20px'}}>We couldn't automatically detect your zone. Please select:</p>
          <button onClick={() => {setDetectedZone({...detectedZone, account: 'austen'}); setStep(3);}} style={{...styles.button, ...styles.secondaryBtn, marginBottom: '10px'}}>
            I'm in East Valley / Austen's Zone
          </button>
          <button onClick={() => {setDetectedZone({...detectedZone, account: 'dad'}); setStep(3);}} style={{...styles.button, ...styles.primaryBtn}}>
            I'm in West Valley / Dad's Zone
          </button>
        </>
      ) : (
        <>
          <div style={{...styles.zoneBadge, ...(detectedZone.account === 'austen' ? styles.austenBadge : styles.dadBadge)}}>
            {detectedZone.account === 'austen' ? "Austen's Zone" : "Dad's Zone"}
            {detectedZone.overlap && " (Both Serve)"}
          </div>
          
          <h2>Your Zone</h2>
          <p style={{marginBottom: '20px'}}>
            Based on your address, you'll be matched with <strong>{detectedZone.account === 'austen' ? "Austen's team" : "Dad's team"}</strong>.
          </p>
          
          {detectedZone.overlap && (
            <p style={{color: '#d29922', marginBottom: '20px'}}>
              Note: Both teams serve your area. We've defaulted to Austen's team, but you can choose Dad's team if preferred.
            </p>
          )}
          
          <button onClick={() => setStep(3)} style={{...styles.button, ...styles.primaryBtn}}>
            Continue to Packages
          </button>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.card}>
      <button onClick={() => setStep(2)} style={styles.backLink}>â† Back</button>
      
      <h2>Select Your Package</h2>
      
      <div 
        style={{...styles.packageCard, ...(selectedPackage === 'regular' && styles.packageSelected)}}
        onClick={() => setSelectedPackage('regular')}
      >
        <div style={styles.packageTitle}>{packages.regular.name}</div>
        <div style={styles.packagePrice}>{packages.regular.price}</div>
        <div style={styles.packageDesc}>{packages.regular.description}</div>
      </div>
      
      <div 
        style={{...styles.packageCard, ...(selectedPackage === 'earlyBird' && styles.packageSelected)}}
        onClick={() => setSelectedPackage('earlyBird')}
      >
        <div style={styles.packageTitle}>{packages.earlyBird.name}</div>
        <div style={styles.packagePrice}>{packages.earlyBird.price}</div>
        <div style={styles.packageDesc}>{packages.earlyBird.description}</div>
      </div>
      
      <div 
        style={{...styles.packageCard, ...(selectedPackage === 'single' && styles.packageSelected)}}
        onClick={() => setSelectedPackage('single')}
      >
        <div style={styles.packageTitle}>{packages.single.name}</div>
        <div style={styles.packagePrice}>{packages.single.price}</div>
        <div style={styles.packageDesc}>{packages.single.description}</div>
      </div>
      
      {selectedPackage && (
        <button onClick={() => setStep(4)} style={{...styles.button, ...styles.primaryBtn, marginTop: '20px'}}>
          Continue to Booking
        </button>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div style={styles.card}>
      <button onClick={() => setStep(3)} style={styles.backLink}>â† Back</button>
      
      <h2>Complete Your Booking</h2>
      <p style={{color: '#8b949e', marginBottom: '20px'}}>
        You'll be redirected to our scheduling system to pick your dates and times.
      </p>
      
      <input 
        type="text" 
        placeholder="First Name" 
        style={styles.input}
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
      />
      <input 
        type="text" 
        placeholder="Last Name" 
        style={styles.input}
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
      />
      <input 
        type="email" 
        placeholder="Email" 
        style={styles.input}
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <input 
        type="tel" 
        placeholder="Phone" 
        style={styles.input}
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      <textarea 
        placeholder="Notes (optional)" 
        style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
        value={formData.notes}
        onChange={(e) => setFormData({...formData, notes: e.target.value})}
      />
      
      <div style={{background: '#21262d', padding: '15px', borderRadius: '6px', marginBottom: '20px'}}>
        <strong>Booking Summary:</strong><br/>
        Zone: {detectedZone.account === 'austen' ? "Austen's Team" : "Dad's Team"}<br/>
        Package: {packages[selectedPackage]?.name}<br/>
        Location: {address}
      </div>
      
      <button 
        onClick={() => {
          // Redirect to appropriate Acuity scheduling link
          const acuityUrl = detectedZone.account === 'austen' 
            ? 'https://app.acuityscheduling.com/schedule.php?owner=23214568'
            : 'https://app.acuityscheduling.com/schedule.php?owner=28722957';
          window.open(acuityUrl, '_blank');
        }}
        style={{...styles.button, ...styles.primaryBtn}}
      >
        Continue to Scheduler â†’
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <Head>
        <title>Book Driving Lessons | Deer Valley Driving School</title>
        <style>{`body { margin: 0; background-color: #0d1117; color: #c9d1d9; }`}</style>
      </Head>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Book Your Lessons</h1>
        <p style={styles.subtitle}>Deer Valley Driving School</p>
      </header>
      
      <div style={styles.stepIndicator}>
        <div style={{...styles.step, ...(step >= 1 ? styles.stepActive : styles.stepInactive)}}>1</div>
        <div style={{...styles.step, ...(step >= 2 ? styles.stepActive : styles.stepInactive)}}>2</div>
        <div style={{...styles.step, ...(step >= 3 ? styles.stepActive : styles.stepInactive)}}>3</div>
        <div style={{...styles.step, ...(step >= 4 ? styles.stepActive : styles.stepInactive)}}>4</div>
      </div>
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}