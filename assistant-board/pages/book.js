import { useState } from 'react';
import Head from 'next/head';
import { locationConfig, detectLocationFromAddress } from '../data/locations.js';

// Austen's Stripe links
const austenPackages = {
  ultimate: { name: 'Ultimate Package', price: 1299, lessons: 8, hours: 20, stripeBase: 'https://buy.stripe.com/5kQ6oI8EP6BW4dBaT02ZO1f', stripeUpcharge: 'https://buy.stripe.com/dRm7sM8EP5xS39x5yG2ZO1d' },
  license: { name: 'License Ready Package', price: 680, lessons: 4, hours: 10, stripeBase: 'https://buy.stripe.com/aFaeVe8EP4tO5hF9OW2ZO1b', stripeUpcharge: 'https://buy.stripe.com/bJedRa6wH2lGh0n2mu2ZO1c', stripeSpecialBase: 'https://buy.stripe.com/fZu5kE2gr7G0bG38KS2ZO1j', stripeSpecialUpcharge: 'https://buy.stripe.com/3cI7sM3kvd0k8tR5yG2ZO1k', specialPrice: 700 },
  intro: { name: 'Intro to Driving', price: 350, lessons: 2, hours: 5, stripeBase: 'https://buy.stripe.com/00w9AUaMX2lG5hF4uC2ZO1g', stripeUpcharge: 'https://buy.stripe.com/cNi3cwdZ99O86lJaT02ZO1h' },
  express: { name: 'Express Lesson', price: 200, lessons: 1, hours: 2.5, stripeBase: 'https://buy.stripe.com/00wbJ2dZ9gcweSf1iq2ZO1i', stripeUpcharge: null }
};

// Dad's Stripe links
const dadPackages = {
  ultimate: { name: 'Ultimate Package', price: 1299, lessons: 8, hours: 20, stripeBase: 'https://buy.stripe.com/bJe14mdxCf2Eaga6vSg7e0d', stripeUpcharge: 'https://buy.stripe.com/bJeaEW516aMo3RM9I4g7e0e' },
  license: { name: 'License Ready Package', price: 680, lessons: 4, hours: 10, stripeBase: 'https://buy.stripe.com/6oU00ictyg6I4VQbQcg7e0f', stripeUpcharge: 'https://buy.stripe.com/3cI14mbpug6I5ZUg6sg7e0g' },
  intro: { name: 'Intro to Driving', price: 350, lessons: 2, hours: 5, stripeBase: 'https://buy.stripe.com/4gMcN43X2bQs3RMg6sg7e0j', stripeUpcharge: null },
  express: { name: 'Express Lesson', price: 200, lessons: 1, hours: 2.5, stripeBase: 'https://buy.stripe.com/6oUfZg65a4o0aga6vSg7e0h', stripeUpcharge: null }
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

// Google Geocoding API key
const GOOGLE_KEY = 'AIzaSyA5_sfMn_rDEw1eM3uGFBE3XxblPiXgZRQ';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [times, setTimes] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

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

  const detectZone = (addressComponents) => {
    return detectLocationFromAddress(addressComponents);
  };

  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query + ', Arizona')}&key=${GOOGLE_KEY}`);
      const data = await res.json();
      if (data.results) {
        setSuggestions(data.results.slice(0, 5));
      }
    } catch (e) {
      console.error('Geocode error:', e);
    }
  };

  const selectAddress = (result) => {
    setAddress(result.formatted_address);
    setSuggestions([]);
    
    const detected = detectZone(result.address_components);
    
    const cityKey = detected?.city;
    const account = detected?.account;
    const locationData = account === 'dad' 
      ? locationConfig[cityKey]
      : locationConfig[cityKey];
    
    setLocation({
      ...detected,
      name: locationData?.name || cityKey,
      instructors: locationData?.instructors || 'TBD'
    });
  };

  const continueToPackages = () => {
    if (location) setStep(2);
  };

  // Calculate violation for times
  let violation = false;
  for (let i = 0; i < times.length; i++) {
    for (let j = i + 1; j < times.length; j++) {
      const t1 = times[i];
      const t2 = times[j];
      if (t1 && t2) {
        const diff = Math.abs((new Date(t1.date) - new Date(t2.date)) / (1000 * 60 * 60 * 24));
        if (diff < 7) violation = true;
      }
    }
  }

  // Get packages based on location
  const packages = location?.account === 'dad' ? dadPackages : austenPackages;

  // Payment handler
  const fetchAvailability = async () => {
    if (!location?.city || !location?.account) return;
    
    setAvailLoading(true);
    try {
      const res = await fetch(`/api/availability?city=${location.city}&account=${location.account}`);
      const data = await res.json();
      if (data.availability) {
        // Flatten availability into time slots
        const slots = [];
        data.availability.forEach(day => {
          day.times.forEach(time => {
            slots.push({
              date: day.date,
              time: time.time,
              endTime: time.endTime
            });
          });
        });
        setAvailability(slots);
      }
    } catch (e) {
      console.error('Failed to fetch availability:', e);
    }
    setAvailLoading(false);
  };

  const handlePayment = () => {
    if (!pkg || !location) return;
    
    setPaymentLoading(true);
    
    const isSpecialLocation = location?.name === 'Casa Grande' || location?.name === 'West Valley';
    const isLicensePackage = pkg.name === 'License Ready Package';
    const useSpecialPricing = isSpecialLocation && isLicensePackage && pkg.stripeSpecialBase;
    
    // Use Payment Links (reliable)
    let stripeUrl;
    if (useSpecialPricing) {
      stripeUrl = violation && pkg.stripeSpecialUpcharge ? pkg.stripeSpecialUpcharge : pkg.stripeSpecialBase;
    } else {
      stripeUrl = violation && pkg.stripeUpcharge ? pkg.stripeUpcharge : pkg.stripeBase;
    }
    
    window.location.href = stripeUrl;
  };

  // Calculate pricing
  const isSpecialLocation = location?.name === 'Casa Grande' || location?.name === 'West Valley';
  const isLicensePackage = pkg?.name === 'License Ready Package';
  const useSpecialPricing = isSpecialLocation && isLicensePackage && pkg?.stripeSpecialBase;
  const basePrice = useSpecialPricing ? pkg?.specialPrice : pkg?.price;
  const surcharge = violation ? 50 : 0;
  const total = (basePrice || 0) + surcharge;

  // Step 1: Address
  if (step === 1) {
    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <div style={styles.header}><h1 style={styles.title}>Book Your Lessons</h1></div>
        <div style={styles.card}>
          <h2>Enter your address</h2>
          <input 
            placeholder="Start typing your address..." 
            style={styles.input} 
            value={address} 
            onChange={e => {
              setAddress(e.target.value);
              searchAddress(e.target.value);
            }}
          />
          
          {suggestions.length > 0 && (
            <div style={{marginBottom: '16px', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden'}}>
              {suggestions.map((s, i) => (
                <div 
                  key={i}
                  style={{padding: '12px', borderBottom: '1px solid #30363d', cursor: 'pointer', background: '#0d1117'}}
                  onClick={() => selectAddress(s)}
                >
                  {s.formatted_address}
                </div>
              ))}
            </div>
          )}
          
          {location && (
            <div style={{background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
              <p><strong>Zone Detected:</strong> {location.name}</p>
              <p style={{color: '#8b949e', fontSize: '14px'}}>Instructor: {location.instructors}</p>
            </div>
          )}
          
          <button 
            style={{...styles.button, opacity: location ? 1 : 0.5}} 
            onClick={continueToPackages}
            disabled={!location}
          >
            Continue &gt;
          </button>
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
              <div style={{color: '#8b949e'}}>{p.lessons} lessons, {p.hours} hrs</div>
            </div>
          ))}
          {pkg && <button style={styles.button} onClick={() => { fetchAvailability(); setStep(3); }}>Select {pkg.lessons} Times &gt;</button>}
        </div>
      </div>
    );
  }

  // Step 3: Times
  if (step === 3 && pkg) {
    const isComplete = times.length === pkg.lessons;
    
    // Fetch availability when step loads - use useEffect pattern with useState hack for Next.js
    if (typeof window !== 'undefined' && availability.length === 0 && !availLoading) {
      fetchAvailability();
    }
    
    const selectedDates = new Set();
    times.forEach(t => {
      if (t) selectedDates.add(t.date);
    });

    // Filter availability
    const filteredTimes = availability.filter(t => {
      if (selectedDates.has(t.date)) return false;
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
              <strong>! Multiple Lessons Per Week</strong>
              <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>+$50 surcharge applies</p>
            </div>
          )}
          
          {availLoading && <p style={{textAlign: 'center'}}>Loading available times...</p>}
          
          {!isComplete && !availLoading ? (
            <>
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                <button style={tabStyle(timeFilter === 'all')} onClick={() => setTimeFilter('all')}>All</button>
                <button style={tabStyle(timeFilter === 'morning')} onClick={() => setTimeFilter('morning')}>Morning M-F</button>
                <button style={tabStyle(timeFilter === 'afternoon')} onClick={() => setTimeFilter('afternoon')}>Afternoon M-F</button>
                <button style={tabStyle(timeFilter === 'weekend')} onClick={() => setTimeFilter('weekend')}>Weekend</button>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
                {filteredTimes.length === 0 ? (
                  <p>No times available. Try a different filter.</p>
                ) : (
                  filteredTimes.map((t, idx) => {
                    const isSelected = times.some(selected => selected.date === t.date && selected.time === t.time);
                    return (
                      <button 
                        key={idx} 
                        style={{...styles.timeBtn, ...(isSelected && styles.timeSelected)}} 
                        onClick={() => {
                          if (isSelected) {
                            setTimes(times.filter(x => !(x.date === t.date && x.time === t.time)));
                          } else if (times.length < pkg.lessons) {
                            setTimes([...times, t]);
                          }
                        }}
                      >
                        {new Date(t.date).toLocaleDateString('en-US', {weekday: 'short', month: 'numeric', day: 'numeric'})} {t.time}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          ) : isComplete ? (
            <div style={{textAlign: 'center', padding: '20px 0'}}>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: '#238636', marginBottom: '8px'}}>DONE</div>
              <p style={{fontSize: '18px', marginBottom: '20px'}}>{times.length} lessons selected</p>
              <button style={styles.button} onClick={() => setStep(4)}>Continue &gt;</button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Step 4: Pay
  if (step === 4 && pkg) {
    return (
      <div style={styles.container}>
        <Head><title>Book | DVDS</title></Head>
        <div style={styles.header}><h1 style={styles.title}>Complete Payment</h1></div>
        <div style={styles.card}>
          <p><strong>{location?.name}</strong> â€¢ {pkg.name}</p>
          {useSpecialPricing && <p style={{color: '#58a6ff', fontSize: '14px'}}>Special pricing for {location.name}</p>}
          <p style={styles.price}>${total}</p>
          {violation && <p style={{color: '#da3633'}}>+$50 surcharge applied</p>}
          <button style={{...styles.button, opacity: paymentLoading ? 0.7 : 1}} onClick={handlePayment} disabled={paymentLoading}>
            {paymentLoading ? 'Loading...' : `Pay $${total} >`}
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Info
  return (
    <div style={styles.container}>
      <Head><title>Book | DVDS</title></Head>
      <div style={styles.header}><h1 style={styles.title}>Student Info</h1><p style={{color: '#238636', fontWeight: 'bold'}}>[PAID]</p></div>
      <div style={styles.card}>
        <input placeholder="First Name" style={styles.input} />
        <input placeholder="Last Name" style={styles.input} />
        <input placeholder="Email" type="email" style={styles.input} />
        <input placeholder="Phone" type="tel" style={styles.input} />
        <input placeholder="Address" style={styles.input} />
        <textarea placeholder="Notes (optional)" style={{...styles.input, minHeight: '80px'}} />
        <button style={styles.button} onClick={() => alert('Booking confirmed!')}>
          Complete Booking &gt;
        </button>
      </div>
    </div>
  );
}