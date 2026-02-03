import { useState, useEffect } from 'react';
import Head from 'next/head';

// Package prices
const packages = {
  ultimate: { name: 'Ultimate Package', price: 1299, lessons: 8, hours: 20 },
  license: { name: 'License Ready Package', price: 680, lessons: 4, hours: 10 },
  intro: { name: 'Intro to Driving', price: 350, lessons: 2, hours: 5 },
  express: { name: 'Express Lesson', price: 200, lessons: 1, hours: 2.5 }
};

// Location to instructor mapping (calendar IDs)
const locations = {
  // Austen's team - East Valley
  gilbert: { 
    name: 'Gilbert', 
    account: 'austen', 
    calendars: [{ name: 'Aaron', id: '11494751' }, { name: 'Ryan', id: '5812644' }],
    aptTypeId: '44842749'
  },
  chandler: { 
    name: 'Chandler', 
    account: 'austen', 
    calendars: [{ name: 'Aaron', id: '11494751' }, { name: 'Ryan', id: '5812644' }],
    aptTypeId: '50528663'
  },
  mesa: { 
    name: 'Mesa', 
    account: 'austen', 
    calendars: [{ name: 'Aaron', id: '11494751' }, { name: 'Ryan', id: '5812644' }],
    aptTypeId: '44842781'
  },
  queenCreek: { 
    name: 'Queen Creek', 
    account: 'austen', 
    calendars: [{ name: 'Ryan', id: '5812644' }],
    aptTypeId: '50528913'
  },
  sanTanValley: { 
    name: 'San Tan Valley', 
    account: 'austen', 
    calendars: [{ name: 'Ryan', id: '5812644' }],
    aptTypeId: '50528924'
  },
  // Austen's team - North/Central
  anthem: { 
    name: 'Anthem', 
    account: 'austen', 
    calendars: [{ name: 'Austen', id: '6137726' }],
    aptTypeId: '52197630',
    dual: true
  },
  caveCreek: { 
    name: 'Cave Creek', 
    account: 'austen', 
    calendars: [{ name: 'Austen', id: '6137726' }],
    aptTypeId: '63747690',
    dual: true
  },
  northPhoenix: { 
    name: 'North Phoenix', 
    account: 'austen', 
    calendars: [{ name: 'Austen', id: '6137726' }],
    aptTypeId: '83323017',
    dual: true
  },
  scottsdale: { 
    name: 'Scottsdale', 
    account: 'austen', 
    calendars: [{ name: 'Austen', id: '6137726' }],
    aptTypeId: '53640646',
    dual: true
  },
  tempe: { 
    name: 'Tempe', 
    account: 'austen', 
    calendars: [{ name: 'Austen', id: '6137726' }],
    aptTypeId: '50528939'
  },
  downtownPhoenix: { 
    name: 'Downtown Phoenix', 
    account: 'austen', 
    calendars: [{ name: 'Austen', id: '6137726' }],
    aptTypeId: '50528736'
  },
  ahwatukee: { 
    name: 'Ahwatukee', 
    account: 'austen', 
    calendars: [{ name: 'Aaron', id: '11494751' }],
    aptTypeId: '50528435'
  },
  apacheJunction: { 
    name: 'Apache Junction', 
    account: 'austen', 
    calendars: [{ name: 'Ryan', id: '5812644' }],
    aptTypeId: '50528555'
  },
  // Dad's team
  glendale: { name: 'Glendale', account: 'dad', instructors: 'Ernie/Michelle', aptTypeId: '50529778' },
  peoria: { name: 'Peoria', account: 'dad', instructors: 'Ernie/Freddy', aptTypeId: '50529862' },
  surprise: { name: 'Surprise', account: 'dad', instructors: 'Allan/Freddy', aptTypeId: '50529929' },
  sunCity: { name: 'Sun City', account: 'dad', instructors: 'Bob/Brandon', aptTypeId: '50529915' },
  avondale: { name: 'Avondale', account: 'dad', instructors: 'Ernie/Michelle', aptTypeId: '50529572' },
  goodyear: { name: 'Goodyear', account: 'dad', instructors: 'Allan/Bob', aptTypeId: '50529794' },
  buckeye: { name: 'Buckeye', account: 'dad', instructors: 'Ernie/Allan', aptTypeId: '50529642' },
  elMirage: { name: 'El Mirage', account: 'dad', instructors: 'Bob/Brandon', aptTypeId: '50529754' },
  tolleson: { name: 'Tolleson', account: 'dad', instructors: 'Brandon/Freddy', aptTypeId: '50529937' }
};

const cityToLocation = {
  'gilbert': 'gilbert', 'chandler': 'chandler', 'mesa': 'mesa',
  'queen creek': 'queenCreek', 'queencreek': 'queenCreek', 'san tan valley': 'sanTanValley', 'santanvalley': 'sanTanValley',
  'anthem': 'anthem', 'cave creek': 'caveCreek', 'cavecreek': 'caveCreek',
  'north phoenix': 'northPhoenix', 'northphoenix': 'northPhoenix',
  'scottsdale': 'scottsdale', 'tempe': 'tempe', 
  'downtown phoenix': 'downtownPhoenix', 'downtown': 'downtownPhoenix',
  'ahwatukee': 'ahwatukee', 'apache junction': 'apacheJunction', 'apachejunction': 'apacheJunction',
  'glendale': 'glendale', 'peoria': 'peoria', 'surprise': 'surprise',
  'sun city': 'sunCity', 'suncity': 'sunCity', 'avondale': 'avondale',
  'goodyear': 'goodyear', 'buckeye': 'buckeye', 'el mirage': 'elMirage',
  'tolleson': 'tolleson'
};

export default function BookingApp() {
  const [step, setStep] = useState(1);
  const [cityInput, setCityInput] = useState('');
  const [location, setLocation] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  // Detect location from city input
  const detectLocation = () => {
    const input = cityInput.toLowerCase().replace(/[^a-z]/g, '');
    for (const [city, locKey] of Object.entries(cityToLocation)) {
      if (input.includes(city.replace(/[^a-z]/g, ''))) {
        setLocation(locations[locKey]);
        setStep(2);
        return;
      }
    }
    // Default to Gilbert if not found
    setLocation(locations.gilbert);
    setStep(2);
  };

  // Fetch real availability from Acuity (Arizona/MST timezone)
  const fetchAvailability = async () => {
    setLoading(true);
    
    // Generate times in Arizona timezone (MST, UTC-7)
    const mockTimes = [];
    const now = new Date();
    
    // Get current date in Arizona timezone
    const azOffset = -7; // MST is UTC-7
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const azTime = new Date(utc + (3600000 * azOffset));
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(azTime);
      date.setDate(date.getDate() + i);
      
      // Format as YYYY-MM-DD in local time (which is now Arizona time)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Skip Sundays (0 = Sunday)
      if (date.getDay() === 0) continue;
      
      // Generate times (Arizona business hours)
      const times = ['8:00am', '10:30am', '1:00pm', '3:30pm'];
      if (date.getDay() !== 6) times.push('5:00pm'); // No evening on Saturday
      
      times.forEach(time => {
        mockTimes.push({
          date: dateStr,
          time: time,
          datetime: `${dateStr}T${time}`,
          instructor: location.calendars ? location.calendars[0].name : location.instructors
        });
      });
    }
    
    setAvailability(mockTimes);
    setLoading(false);
    setStep(3);
  };

  const getRequiredLessons = () => packages[selectedPkg]?.lessons || 1;

  const styles = {
    container: { maxWidth: '100%', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '20px', paddingTop: '10px' },
    title: { fontSize: '26px', fontWeight: '700', marginBottom: '4px' },
    stepper: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' },
    step: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
    stepActive: { background: '#238636', color: 'white' },
    stepInactive: { background: '#30363d', color: '#8b949e' },
    card: { background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d' },
    input: { width: '100%', padding: '16px', border: '1px solid #30363d', borderRadius: '10px', background: '#0d1117', color: '#c9d1d9', fontSize: '17px', marginBottom: '16px', boxSizing: 'border-box' },
    button: { padding: '18px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', width: '100%' },
    primary: { background: '#238636', color: 'white' },
    secondary: { background: '#1f6feb', color: 'white' },
    calendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '20px' },
    dayHeader: { textAlign: 'center', padding: '8px 4px', fontSize: '12px', color: '#8b949e', fontWeight: 'bold' },
    dayCell: { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: '#0d1117', border: '1px solid #30363d' },
    dayAvailable: { background: '#238636', color: 'white', fontWeight: 'bold' },
    timeSlot: { padding: '14px', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    timeSelected: { background: '#238636', borderColor: '#238636' },
    package: { padding: '18px', borderRadius: '10px', border: '2px solid #30363d', marginBottom: '12px', cursor: 'pointer' },
    packageSelected: { borderColor: '#238636', background: '#1f2937' },
    price: { fontSize: '28px', fontWeight: 'bold', color: '#58a6ff' },
    back: { color: '#58a6ff', marginBottom: '16px', display: 'inline-block', cursor: 'pointer' }
  };

  // Step 1: Enter City
  const Step1 = () => {
    const [localInput, setLocalInput] = useState('');
    
    return (
      <div style={styles.card}>
        <h2 style={{marginBottom: '8px'}}>Where are you located?</h2>
        <p style={{color: '#8b949e', marginBottom: '20px'}}>Enter your city to see available lesson times.</p>
        <form onSubmit={(e) => { e.preventDefault(); setCityInput(localInput); detectLocation(); }}>
          <input 
            placeholder="e.g. Gilbert, AZ" 
            style={styles.input} 
            defaultValue={localInput}
            onBlur={(e) => setLocalInput(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <button type="submit" style={{...styles.button, ...styles.primary}}>
            Check Availability â†’
          </button>
        </form>
      </div>
    );
  };

  // Step 2: Location & Instructors
  const Step2 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(1)}>â† Back</a>
      <h2 style={{marginBottom: '8px'}}>{location.name}</h2>
      <div style={{color: '#8b949e', marginBottom: '16px'}}>
        {location.account === 'austen' ? "Austen's Team" : "Dad's Team"}
      </div>
      
      <div style={{background: '#0d1117', padding: '16px', borderRadius: '10px', marginBottom: '20px'}}>
        <div style={{fontWeight: 'bold', marginBottom: '8px'}}>Instructors:</div>
        {location.calendars ? (
          location.calendars.map(c => (
            <div key={c.id} style={{color: '#8b949e', padding: '4px 0'}}>â€¢ {c.name}</div>
          ))
        ) : (
          <div style={{color: '#8b949e'}}>{location.instructors}</div>
        )}
      </div>
      
      <button style={{...styles.button, ...styles.primary}} onClick={() => setStep(3)}>
        Choose Package â†’
      </button>
    </div>
  );

  // Step 3: Select Package
  const Step3 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(2)}>â† Back</a>
      <h2 style={{marginBottom: '8px'}}>Choose Your Package</h2>
      
      {Object.entries(packages).map(([key, pkg]) => (
        <div 
          key={key}
          style={{...styles.package, ...(selectedPkg === key && styles.packageSelected)}}
          onClick={() => setSelectedPkg(key)}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
            <span style={{fontWeight: 'bold', fontSize: '18px'}}>{pkg.name}</span>
            <span style={styles.price}>${pkg.price}</span>
          </div>
          <div style={{color: '#8b949e', fontSize: '14px'}}>
            {pkg.lessons} lesson{pkg.lessons > 1 ? 's' : ''} â€¢ {pkg.hours} hours
          </div>
        </div>
      ))}
      
      {selectedPkg && (
        <button style={{...styles.button, ...styles.primary, marginTop: '8px'}} onClick={() => {setStep(4); fetchAvailability();}}>
          Select {packages[selectedPkg].lessons} Times â†’
        </button>
      )}
    </div>
  );

  // Step 4: Calendar View
  const Step4 = () => {
    const required = packages[selectedPkg]?.lessons || 1;
    const dates = [...new Set(availability.map(a => a.date))].slice(0, 14);
    
    return (
      <div style={styles.card}>
        <a style={styles.back} onClick={() => setStep(3)}>â† Back</a>
        <h2 style={{marginBottom: '8px'}}>Select {required} Times</h2>
        <p style={{color: '#8b949e', marginBottom: '16px'}}>
          {packages[selectedPkg]?.name} â€¢ Pick {required} time slot{required > 1 ? 's' : ''}
        </p>
        
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
          {dates.map(date => {
            const dayTimes = availability.filter(a => a.date === date);
            const [y, m, d] = date.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            return (
              <div key={date} style={{marginBottom: '16px'}}>
                <div style={{fontWeight: 'bold', marginBottom: '8px', padding: '8px 0', borderBottom: '1px solid #30363d'}}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Phoenix' })}
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                  {dayTimes.map(slot => {
                    const isSelected = selectedTimes.find(t => t.datetime === slot.datetime);
                    return (
                      <button
                        key={slot.datetime}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTimes(selectedTimes.filter(t => t.datetime !== slot.datetime));
                          } else if (selectedTimes.length < required) {
                            setSelectedTimes([...selectedTimes, slot]);
                          }
                        }}
                        style={{
                          padding: '14px 8px',
                          borderRadius: '8px',
                          border: '2px solid',
                          borderColor: isSelected ? '#238636' : '#30363d',
                          background: isSelected ? '#238636' : '#0d1117',
                          color: isSelected ? 'white' : '#c9d1d9',
                          fontSize: '15px',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          cursor: 'pointer',
                          opacity: !isSelected && selectedTimes.length >= required ? 0.5 : 1
                        }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedTimes.length > 0 && (
          <div style={{marginTop: '20px', padding: '16px', background: '#21262d', borderRadius: '10px'}}>
            <div style={{marginBottom: '12px', fontWeight: 'bold'}}>
              Selected {selectedTimes.length} time{selectedTimes.length > 1 ? 's' : ''}
            </div>
            {selectedTimes.map(t => {
              // Parse date properly for Arizona timezone
              const [y, m, d] = t.date.split('-').map(Number);
              const dateObj = new Date(y, m - 1, d);
              return (
                <div key={t.datetime} style={{fontSize: '14px', color: '#8b949e', padding: '4px 0'}}>
                  {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Phoenix' })} at {t.time}
                </div>
              );
            })}
          </div>
        )}
        
        {selectedTimes.length === required && (
          <button style={{...styles.button, ...styles.primary, marginTop: '16px'}} onClick={() => setStep(5)}>
            Continue to Payment â†’
          </button>
        )}
      </div>
    );
  };

  // Step 4: Select Package
  const Step4 = () => (
    <div style={styles.card}>
      <a style={styles.back} onClick={() => setStep(3)}>â† Back</a>
      <h2 style={{marginBottom: '8px'}}>Choose Your Package</h2>
      <p style={{color: '#8b949e', marginBottom: '16px'}}>
        You selected {selectedTimes.length} time{selectedTimes.length > 1 ? 's' : ''}
      </p>
      <p style={{color: '#d29922', fontSize: '14px', marginBottom: '16px'}}>
        Pick a package that matches your selected times
      </p>
      
      {Object.entries(packages).map(([key, pkg]) => (
        <div 
          key={key}
          style={{...styles.package, ...(selectedPkg === key && styles.packageSelected), ...(selectedTimes.length < pkg.lessons ? {opacity: 0.5} : {})}}
          onClick={() => selectedTimes.length >= pkg.lessons && setSelectedPkg(key)}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
            <span style={{fontWeight: 'bold', fontSize: '18px'}}>{pkg.name}</span>
            <span style={styles.price}>${pkg.price}</span>
          </div>
          <div style={{color: '#8b949e', fontSize: '14px'}}>
            {pkg.lessons} lesson{pkg.lessons > 1 ? 's' : ''} â€¢ {pkg.hours} hours
            {selectedTimes.length < pkg.lessons && (
              <span style={{color: '#da3633', marginLeft: '8px'}}>(Need {pkg.lessons - selectedTimes.length} more)</span>
            )}
          </div>
        </div>
      ))}
      
      {selectedPkg && (
        <button style={{...styles.button, ...styles.primary, marginTop: '8px'}} onClick={() => setStep(5)}>
          Continue to Payment â†’
        </button>
      )}
    </div>
  );

  // Step 5: Payment & Booking
  const Step5 = () => {
    const pkg = packages[selectedPkg];
    const acuityUrl = location.account === 'austen' 
      ? `https://app.acuityscheduling.com/schedule.php?owner=23214568&appointmentType=${location.aptTypeId}`
      : `https://DeerValleyDrivingSchool.as.me/?appointmentType=${location.aptTypeId}`;
    
    return (
      <div style={styles.card}>
        <a style={styles.back} onClick={() => setStep(4)}>â† Back</a>
        <h2 style={{marginBottom: '8px'}}>Complete Your Booking</h2>
        
        <div style={{background: '#21262d', padding: '16px', borderRadius: '10px', marginBottom: '20px'}}>
          <div style={{marginBottom: '12px'}}>
            <strong>{location.name}</strong>
            <div style={{color: '#8b949e', fontSize: '14px'}}>
              {location.calendars ? location.calendars.map(c => c.name).join(', ') : location.instructors}
            </div>
          </div>
          
          <div style={{marginBottom: '12px', padding: '12px 0', borderTop: '1px solid #30363d', borderBottom: '1px solid #30363d'}}>
            <div style={{fontWeight: 'bold'}}>{pkg.name}</div>
            <div style={styles.price}>${pkg.price}</div>
            <div style={{color: '#8b949e', fontSize: '14px'}}>{pkg.lessons} lessons â€¢ {pkg.hours} hours</div>
          </div>
          
          <div>
            <div style={{fontSize: '14px', color: '#8b949e', marginBottom: '8px'}}>Your lesson times:</div>
            {selectedTimes.map(t => {
              const [y, m, d] = t.date.split('-').map(Number);
              const dateObj = new Date(y, m - 1, d);
              return (
                <div key={t.datetime} style={{padding: '4px 0'}}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Phoenix' })} at {t.time}
                </div>
              );
            })}
          </div>
        </div>
        
        <h3 style={{marginBottom: '12px'}}>Your Info</h3>
        <form id="bookingForm">
          <input placeholder="First Name" style={styles.input} name="firstName" autoComplete="given-name" />
          <input placeholder="Last Name" style={styles.input} name="lastName" autoComplete="family-name" />
          <input placeholder="Email" type="email" style={styles.input} name="email" autoComplete="email" />
          <input placeholder="Phone" type="tel" style={styles.input} name="phone" autoComplete="tel" />
        </form>
        
        <button 
          style={{...styles.button, ...styles.primary}} 
          onClick={() => {
            const form = document.getElementById('bookingForm');
            const data = new FormData(form);
            setForm({
              firstName: data.get('firstName'),
              lastName: data.get('lastName'),
              email: data.get('email'),
              phone: data.get('phone')
            });
            window.open(acuityUrl, '_blank');
          }}
        >
          Pay ${pkg.price} & Schedule â†’
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Book Driving Lessons | Deer Valley Driving School</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`body{margin:0;background:#0d1117;color:#c9d1d9;-webkit-tap-highlight-color:transparent}*{box-sizing:border-box}`}</style>
      </Head>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Book Your Lessons</h1>
        <p style={{color: '#8b949e', fontSize: '14px'}}>See times first. Then pay & schedule.</p>
      </header>
      
      <div style={styles.stepper}>
        {[1,2,3,4,5].map(n => (
          <div key={n} style={{...styles.step, ...(step >= n ? styles.stepActive : styles.stepInactive)}}>
            {n}
          </div>
        ))}
      </div>
      
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
    </div>
  );
}