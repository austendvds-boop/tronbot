import { useState } from 'react';
import Head from 'next/head';

// Real package prices
const packagePrices = {
  ultimate: 1299,    // 8 lessons
  license: 680,      // 4 lessons
  intro: 350,        // 2 lessons
  express: 200       // 1 lesson
};

// Location mappings
const locationPackages = {
  ahwatukee: { account: 'austen', name: 'Ahwatukee', instructor: 'Aaron', aptTypeId: '50528435', calendarId: '11494751' },
  anthem: { account: 'austen', name: 'Anthem', instructor: 'Austen', dual: true, aptTypeId: '52197630', calendarId: '6137726' },
  apacheJunction: { account: 'austen', name: 'Apache Junction', instructor: 'Ryan', aptTypeId: '50528555', calendarId: '5812644' },
  caveCreek: { account: 'austen', name: 'Cave Creek', instructor: 'Austen', dual: true, aptTypeId: '63747690', calendarId: '6137726' },
  chandler: { account: 'austen', name: 'Chandler', instructor: 'Aaron/Ryan', aptTypeId: '50528663', calendarId: '11494751' },
  downtownPhoenix: { account: 'austen', name: 'Downtown Phoenix', instructor: 'Austen', aptTypeId: '50528736', calendarId: '6137726' },
  flagstaff: { account: 'austen', name: 'Flagstaff/Sedona/Cottonwood', instructor: 'Austen', note: 'Contact for pricing' },
  gilbert: { account: 'austen', name: 'Gilbert', instructor: 'Aaron/Ryan', aptTypeId: '44842749', calendarId: '11494751' },
  mesa: { account: 'austen', name: 'Mesa', instructor: 'Aaron/Ryan', aptTypeId: '44842781', calendarId: '5812644' },
  northPhoenix: { account: 'austen', name: 'North Phoenix', instructor: 'Austen', dual: true, aptTypeId: '83323017', calendarId: '6137726' },
  queenCreek: { account: 'austen', name: 'Queen Creek', instructor: 'Ryan', aptTypeId: '50528913', calendarId: '5812644' },
  sanTanValley: { account: 'austen', name: 'San Tan Valley', instructor: 'Ryan', aptTypeId: '50528924', calendarId: '5812644' },
  scottsdale: { account: 'austen', name: 'Scottsdale', instructor: 'Austen', dual: true, aptTypeId: '53640646', calendarId: '6137726' },
  tempe: { account: 'austen', name: 'Tempe', instructor: 'Austen', aptTypeId: '50528939', calendarId: '6137726' },
  westValley: { account: 'austen', name: 'West Valley', instructor: 'Austen', is5Hour: true, aptTypeId: '85088423', calendarId: '6137726' },
  avondale: { account: 'dad', name: 'Avondale', instructor: 'Ernie/Michelle', aptTypeId: '50529572', calendarId: '' },
  buckeye: { account: 'dad', name: 'Buckeye', instructor: 'Ernie/Allan', aptTypeId: '50529642', calendarId: '' },
  elMirage: { account: 'dad', name: 'El Mirage', instructor: 'Bob/Brandon', aptTypeId: '50529754', calendarId: '' },
  glendale: { account: 'dad', name: 'Glendale', instructor: 'Ernie/Michelle', aptTypeId: '50529778', calendarId: '' },
  goodyear: { account: 'dad', name: 'Goodyear', instructor: 'Allan/Bob', aptTypeId: '50529794', calendarId: '' },
  peoria: { account: 'dad', name: 'Peoria', instructor: 'Ernie/Freddy', aptTypeId: '50529862', calendarId: '' },
  sunCity: { account: 'dad', name: 'Sun City', instructor: 'Bob/Brandon', aptTypeId: '50529915', calendarId: '' },
  surprise: { account: 'dad', name: 'Surprise', instructor: 'Allan/Freddy', aptTypeId: '50529929', calendarId: '' },
  tolleson: { account: 'dad', name: 'Tolleson', instructor: 'Brandon/Freddy', aptTypeId: '50529937', calendarId: '' }
};

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
  const [availability, setAvailability] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);

  const detectLocation = () => {
    const input = form.address.toLowerCase();
    let matched = null;
    for (const [city, key] of Object.entries(cityMapping)) {
      if (input.includes(city)) { matched = { key, ...locationPackages[key] }; break; }
    }
    setDetectedLoc(matched || { notFound: true });
    setStep(2);
  };

  const getLessonCount = () => {
    switch(selectedPkg) {
      case 'ultimate': return 8; case 'license': return 4;
      case 'intro': return 2; case 'express': return 1;
      case 'westvalley': return 1; default: return 1;
    }
  };

  const fetchAvailability = () => {
    // Mock availability - in production fetch from API
    setAvailability({
      '2026-02-04': ['8:00am', '10:30am', '1:00pm', '3:30pm'],
      '2026-02-05': ['9:00am', '11:30am', '2:00pm'],
      '2026-02-06': ['8:30am', '1:30pm', '4:00pm'],
      '2026-02-07': ['10:00am', '2:30pm'],
      '2026-02-08': ['9:30am', '12:00pm', '3:00pm'],
      '2026-02-09': ['8:00am', '11:00am', '2:00pm'],
      '2026-02-10': ['9:00am', '1:00pm', '4:00pm']
    });
  };

  const styles = {
    container: { maxWidth: '100%', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '24px', paddingTop: '10px' },
    title: { fontSize: '24px', marginBottom: '4px', fontWeight: '700' },
    stepper: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' },
    step: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' },
    stepActive: { background: '#238636', color: 'white' },
    stepInactive: { background: '#30363d', color: '#8b949e' },
    card: { background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d', marginBottom: '16px' },
    input: { width: '100%', padding: '16px', border: '1px solid #30363d', borderRadius: '10px', background: '#0d1117', color: '#c9d1d9', fontSize: '17px', marginBottom: '16px', boxSizing: 'border-box', minHeight: '52px' },
    button: { padding: '18px 24px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', width: '100%', minHeight: '56px' },
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
      <p style={{color: '#8b949e', marginBottom: '15px'}}>Enter your city to see pricing and available times.</p>
      <input placeholder="e.g. Gilbert, AZ" style={styles.input} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
      <button style={{...styles.button, ...styles.primary}} onClick={detectLocation}>See Pricing & Times â†’</button>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(1)}>â† Back</a>
      {detectedLoc.notFound ? (
        <>
          <h2>Location Not Found</h2>
          <p style={{color: '#8b949e', marginBottom: '20px'}}>Choose your region:</p>
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
            {detectedLoc.note && (
              <div style={{color: '#d29922'}}>{detectedLoc.note}</div>
            )}
            <div style={styles.instructor}>Instructor: {detectedLoc.instructor}</div>
            {detectedLoc.dual && <div style={{color: '#d29922', fontSize: '12px', marginTop: '5px'}}>Both teams serve this area</div>}
          </div>
          <button style={{...styles.button, ...styles.primary}} onClick={() => setStep(3)}>Select Package â†’</button>
        </>
      )}
    </div>
  );

  const renderStep3Packages = () => {
    return (
      <div style={styles.card}>
        <a style={styles.back} onClick={() => setStep(2)}>â† Back</a>
        <h2>Select Package</h2>
        
        {detectedLoc.note ? (
          <div style={{...styles.package, ...(selectedPkg === 'contact' && styles.pkgSelected)}} onClick={() => setSelectedPkg('contact')}>
            <div style={{fontWeight: 'bold', fontSize: '18px'}}>Contact for Pricing</div>
            <div style={{color: '#8b949e'}}>We'll reach out with pricing.</div>
          </div>
        ) : detectedLoc.is5Hour ? (
          <div style={{...styles.package, ...(selectedPkg === 'westvalley' && styles.pkgSelected)}} onClick={() => setSelectedPkg('westvalley')}>
            <div style={{fontWeight: 'bold', fontSize: '18px'}}>West Valley 5-Hour</div>
            <div style={styles.price}>$340</div>
            <div style={{color: '#8b949e'}}>One 5-hour lesson</div>
          </div>
        ) : (
          <>
            <div style={{...styles.package, ...(selectedPkg === 'ultimate' && styles.pkgSelected)}} onClick={() => setSelectedPkg('ultimate')}>
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>Ultimate Package</div>
              <div style={styles.price}>${packagePrices.ultimate}</div>
              <div style={{color: '#8b949e'}}>8 lessons (20 hrs) - Best value</div>
            </div>
            <div style={{...styles.package, ...(selectedPkg === 'license' && styles.pkgSelected)}} onClick={() => setSelectedPkg('license')}>
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>License Ready â­</div>
              <div style={styles.price}>${packagePrices.license}</div>
              <div style={{color: '#8b949e'}}>4 lessons (10 hrs) - Most popular</div>
            </div>
            <div style={{...styles.package, ...(selectedPkg === 'intro' && styles.pkgSelected)}} onClick={() => setSelectedPkg('intro')}>
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>Intro to Driving</div>
              <div style={styles.price}>${packagePrices.intro}</div>
              <div style={{color: '#8b949e'}}>2 lessons (5 hrs)</div>
            </div>
            <div style={{...styles.package, ...(selectedPkg === 'express' && styles.pkgSelected)}} onClick={() => setSelectedPkg('express')}>
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>Express Lesson</div>
              <div style={styles.price}>${packagePrices.express}</div>
              <div style={{color: '#8b949e'}}>1 lesson (2.5 hrs)</div>
            </div>
          </>
        )}
        
        {selectedPkg && (
          <button style={{...styles.button, ...styles.primary, marginTop: '10px'}} onClick={() => {setStep(4); fetchAvailability();}}>
            View Available Times â†’
          </button>
        )}
      </div>
    );
  };

  const renderStep4Calendar = () => {
    const lessonCount = getLessonCount();
    const dates = Object.keys(availability);
    
    return (
      <div style={styles.card}>
        <a style={styles.back} onClick={() => setStep(3)}>â† Back</a>
        <h2>Pick Your Times</h2>
        <p style={{color: '#8b949e', marginBottom: '15px'}}>
          Select {lessonCount} time slot{lessonCount > 1 ? 's' : ''}
        </p>
        
        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
          {dates.map(date => (
            <div key={date} style={{marginBottom: '20px'}}>
              <div style={{fontWeight: 'bold', marginBottom: '10px', fontSize: '16px'}}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
                {availability[date].map(time => {
                  const slotKey = `${date}-${time}`;
                  const isSelected = selectedSlots.includes(slotKey);
                  const canSelect = isSelected || selectedSlots.length < lessonCount;
                  return (
                    <button
                      key={slotKey}
                      onClick={() => {
                        if (isSelected) setSelectedSlots(selectedSlots.filter(s => s !== slotKey));
                        else if (canSelect) setSelectedSlots([...selectedSlots, slotKey]);
                      }}
                      style={{
                        padding: '16px', border: '2px solid', borderColor: isSelected ? '#238636' : '#30363d',
                        borderRadius: '10px', background: isSelected ? '#238636' : '#0d1117',
                        color: isSelected ? 'white' : '#c9d1d9', fontSize: '16px', fontWeight: isSelected ? 'bold' : 'normal',
                        opacity: canSelect ? 1 : 0.5
                      }}
                    >
                      {time} {isSelected && 'âœ“'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {selectedSlots.length > 0 && (
          <div style={{marginTop: '20px', padding: '15px', background: '#21262d', borderRadius: '8px'}}>
            <div style={{marginBottom: '10px'}}><strong>Selected ({selectedSlots.length}/{lessonCount}):</strong></div>
            {selectedSlots.map(slot => {
              const [date, time] = slot.split('-');
              return (
                <div key={slot} style={{fontSize: '14px', color: '#8b949e'}}>
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {time}
                </div>
              );
            })}
          </div>
        )}
        
        {selectedSlots.length === lessonCount && (
          <button style={{...styles.button, ...styles.primary, marginTop: '15px'}} onClick={() => setStep(5)}>
            Continue to Payment â†’
          </button>
        )}
      </div>
    );
  };

  const renderStep5Payment = () => {
    let pkgName = '', pkgPrice = 0;
    switch(selectedPkg) {
      case 'ultimate': pkgName = 'Ultimate (8 lessons)'; pkgPrice = packagePrices.ultimate; break;
      case 'license': pkgName = 'License Ready (4 lessons)'; pkgPrice = packagePrices.license; break;
      case 'intro': pkgName = 'Intro (2 lessons)'; pkgPrice = packagePrices.intro; break;
      case 'express': pkgName = 'Express (1 lesson)'; pkgPrice = packagePrices.express; break;
      case 'westvalley': pkgName = 'West Valley 5-Hour'; pkgPrice = 340; break;
      case 'contact': pkgName = 'Contact for Pricing'; pkgPrice = 0; break;
    }
    
    return (
      <div style={styles.card}>
        <a style={styles.back} onClick={() => setStep(4)}>â† Back</a>
        <h2>Complete Booking</h2>
        
        <div style={{background: '#21262d', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
          <div><strong>{detectedLoc.name}</strong></div>
          <div style={{color: '#8b949e'}}>{detectedLoc.instructor}</div>
          <div style={{marginTop: '10px'}}>{pkgName}</div>
          {selectedPkg !== 'contact' && <div style={styles.price}>${pkgPrice.toFixed(2)}</div>}
          <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #30363d'}}>
            <div style={{fontSize: '14px', color: '#8b949e', marginBottom: '5px'}}>Selected times:</div>
            {selectedSlots.map(slot => {
              const [date, time] = slot.split('-');
              return <div key={slot} style={{fontSize: '14px'}}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {time}</div>;
            })}
          </div>
        </div>
        
        <h3 style={{marginBottom: '15px'}}>Your Info</h3>
        <input placeholder="First Name" style={styles.input} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
        <input placeholder="Last Name" style={styles.input} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
        <input placeholder="Email" type="email" style={styles.input} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Phone" type="tel" style={styles.input} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        
        {selectedPkg === 'contact' ? (
          <button style={{...styles.button, ...styles.primary}} onClick={() => alert('Request submitted!')}>Submit</button>
        ) : (
          <button style={{...styles.button, ...styles.primary}} onClick={() => window.open(detectedLoc.account === 'austen' ? 'https://app.acuityscheduling.com/schedule.php?owner=23214568' : 'https://DeerValleyDrivingSchool.as.me', '_blank')}>
            Pay ${pkgPrice.toFixed(2)} â†’
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Book Driving Lessons | DVDS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`body{margin:0;background:#0d1117;color:#c9d1d9;-webkit-tap-highlight-color:transparent} *{box-sizing:border-box}`}</style>
      </Head>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Book Your Lessons</h1>
        <p style={{color: '#8b949e'}}>See times first - then pay</p>
      </header>
      
      <div style={styles.stepper}>
        {[1,2,3,4,5].map(n => (
          <div key={n} style={{...styles.step, ...(step >= n ? styles.stepActive : styles.stepInactive)}}>{n}</div>
        ))}
      </div>
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3Packages()}
      {step === 4 && renderStep4Calendar()}
      {step === 5 && renderStep5Payment()}
    </div>
  );
}