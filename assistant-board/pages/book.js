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
  const [realAvailability, setRealAvailability] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [unsupportedLocation, setUnsupportedLocation] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  // Test Stripe link for webhook testing
  const TEST_STRIPE_LINK = 'https://buy.stripe.com/dRm7sM9IT8K47pN5yG2ZO1l';

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
    setUnsupportedLocation(false);

    // Get coordinates for special routing (Scottsdale north/south of Shea)
    const lat = result.geometry?.location?.lat;
    const lng = result.geometry?.location?.lng;
    
    const detected = detectZone(result.address_components, lat, lng);
    
    // Check if this is a supported location (not the default Gilbert fallback)
    let isSupported = false;
    let cityKey = null;
    
    for (const [key, loc] of Object.entries(locationConfig)) {
      if (loc.name === detected?.name) {
        cityKey = key;
        isSupported = true;
        break;
      }
    }
    
    // If no match found or it defaulted to Gilbert without being Gilbert, mark as unsupported
    if (!isSupported || (detected?.name === 'Gilbert' && !result.formatted_address.toLowerCase().includes('gilbert'))) {
      setUnsupportedLocation(true);
      setLocation({
        name: detected?.name || 'Unknown Area',
        instructors: 'Please call for availability',
        account: null,
        city: null,
        unsupported: true
      });
      return;
    }
    
    // Special case for Scottsdale - use different keys based on routing
    if (detected?.routingNote?.includes('North of Shea')) {
      cityKey = 'scottsdaleDad';
    }
    
    setLocation({
      ...detected,
      city: cityKey,  // Add city key for API calls
      name: detected?.name || cityKey,
      instructors: detected?.instructors || 'TBD',
      unsupported: false
    });
  };

  const continueToPackages = () => {
    if (location) setStep(2);
  };

  // Calculate violation for times (times are now objects with date/time)
  let violation = false;
  for (let i = 0; i < times.length; i++) {
    for (let j = i + 1; j < times.length; j++) {
      const t1 = times[i];
      const t2 = times[j];
      if (t1 && t2 && t1.date && t2.date) {
        const d1 = new Date(t1.date);
        const d2 = new Date(t2.date);
        const diff = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
        if (diff < 7) violation = true;
      }
    }
  }

  // Get packages based on location
  const packages = location?.account === 'dad' ? dadPackages : austenPackages;

  // Fetch real availability from Acuity
  const fetchRealAvailability = async () => {
    if (!location?.city || !location?.account) return;

    setAvailLoading(true);
    try {
      const res = await fetch(`/api/availability?city=${location.city}&account=${location.account}&days=14`);
      const data = await res.json();
      if (data.slots && data.slots.length > 0) {
        // Format the slots properly
        const formattedSlots = data.slots.map(slot => {
          const dateObj = new Date(slot.time);
          const timeStr = dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).toLowerCase().replace(' ', '');
          return {
            date: slot.date,
            time: timeStr,
            fullTime: slot.time
          };
        });
        setRealAvailability(formattedSlots);
      } else {
        setRealAvailability([]); // Will fallback to mock
      }
    } catch (e) {
      console.error('Failed to fetch availability:', e);
      setRealAvailability([]); // Fallback to mock on error
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
    if (testMode) {
      // Use $1 test link for webhook testing
      stripeUrl = TEST_STRIPE_LINK;
    } else if (useSpecialPricing) {
      stripeUrl = violation && pkg.stripeSpecialUpcharge ? pkg.stripeSpecialUpcharge : pkg.stripeSpecialBase;
    } else {
      stripeUrl = violation && pkg.stripeUpcharge ? pkg.stripeUpcharge : pkg.stripeBase;
    }

    // Store selected times in localStorage for webhook to pick up
    if (typeof window !== 'undefined') {
      localStorage.setItem('dvds_pending_booking', JSON.stringify({
        times: times,
        location: location,
        package: pkg
      }));
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
              setUnsupportedLocation(false);
              setLocation(null);
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

          {location && !location.unsupported && (
            <div style={{background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
              <p><strong>Zone Detected:</strong> {location.name}</p>
              <p style={{color: '#8b949e', fontSize: '14px'}}>Instructor: {location.instructors}</p>
            </div>
          )}

          {unsupportedLocation && (
            <div style={{background: '#da3633', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center'}}>
              <p style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '12px'}}>Area Not Currently Available</p>
              <p style={{marginBottom: '16px'}}>This location is outside our current service area.</p>
              <p style={{fontSize: '20px', fontWeight: 'bold'}}>Call (602) 663-3502</p>
              <p style={{fontSize: '14px', marginTop: '8px'}}>for all business inquiries</p>
            </div>
          )}

          <button
            style={{...styles.button, opacity: location && !location.unsupported ? 1 : 0.5}}
            onClick={continueToPackages}
            disabled={!location || location.unsupported}
          >
            {unsupportedLocation ? 'Area Not Available' : 'Continue >'}
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
          {pkg && <button style={styles.button} onClick={() => setStep(3)}>Select {pkg.lessons} Times &gt;</button>}
        </div>
      </div>
    );
  }

  // Step 3: Times
  if (step === 3 && pkg) {
    const isComplete = times.length === pkg.lessons;

    // Fetch real availability on first load
    if (realAvailability === null && !availLoading) {
      fetchRealAvailability();
    }

    const selectedDates = new Set();
    times.forEach(t => {
      if (t) selectedDates.add(t.date);
    });

    // Use real availability if available, otherwise fallback to mock
    const timeSlots = realAvailability && realAvailability.length > 0
      ? realAvailability
      : mockTimes.map((t, i) => ({...t, index: i}));

    // Filter and add index if needed
    const filteredTimes = timeSlots.map((t, i) => ({...t, index: t.index ?? i})).filter(t => {
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

          {availLoading && <p style={{textAlign: 'center', padding: '20px'}}>Loading available times from Acuity...</p>}

          {!isComplete && !availLoading ? (
            <>
              {realAvailability && realAvailability.length > 0 && (
                <p style={{color: '#58a6ff', fontSize: '14px', marginBottom: '12px'}}>Showing real availability from Acuity</p>
              )}
              {realAvailability && realAvailability.length === 0 && (
                <p style={{color: '#8b949e', fontSize: '14px', marginBottom: '12px'}}>Showing sample times (Acuity data unavailable)</p>
              )}
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                <button style={tabStyle(timeFilter === 'all')} onClick={() => setTimeFilter('all')}>All</button>
                <button style={tabStyle(timeFilter === 'morning')} onClick={() => setTimeFilter('morning')}>Morning M-F</button>
                <button style={tabStyle(timeFilter === 'afternoon')} onClick={() => setTimeFilter('afternoon')}>Afternoon M-F</button>
                <button style={tabStyle(timeFilter === 'weekend')} onClick={() => setTimeFilter('weekend')}>Weekend</button>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
                {filteredTimes.map((t) => {
                  const isSelected = times.some(selected => selected.date === t.date && selected.time === t.time);
                  return (
                    <button
                      key={t.index}
                      style={{...styles.timeBtn, ...(isSelected && styles.timeSelected)}}
                      onClick={() => {
                        if (isSelected) {
                          setTimes(times.filter(x => !(x.date === t.date && x.time === t.time)));
                        } else if (times.length < pkg.lessons) {
                          setTimes([...times, {date: t.date, time: t.time}]);
                        }
                      }}
                    >
                      {new Date(t.date).toLocaleDateString('en-US', {weekday: 'short', month: 'numeric', day: 'numeric'})} {t.time}
                    </button>
                  );
                })}
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
          <p style={styles.price}>${testMode ? '$1 TEST' : '$' + total}</p>
          {violation && !testMode && <p style={{color: '#da3633'}}>+$50 surcharge applied</p>}
          
          {/* Test Mode Toggle */}
          <div style={{marginBottom: '16px', padding: '12px', background: '#1f2937', borderRadius: '8px'}}>
            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
              <input 
                type="checkbox" 
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                style={{marginRight: '8px', width: '18px', height: '18px'}}
              />
              <span style={{color: '#f0883e', fontWeight: 'bold'}}>ðŸ§ª TEST MODE ($1)</span>
            </label>
            <p style={{fontSize: '12px', color: '#8b949e', margin: '4px 0 0 24px'}}>For webhook testing only</p>
          </div>
          
          <button style={{...styles.button, opacity: paymentLoading ? 0.7 : 1, background: testMode ? '#f0883e' : '#238636'}} onClick={handlePayment} disabled={paymentLoading}>
            {paymentLoading ? 'Loading...' : testMode ? 'Pay $1 (TEST) >' : `Pay $${total} >`}
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Student Info
  const [studentInfo, setStudentInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    lessonCount: pkg?.lessons || '',
    pickupAddress: address || '',
    birthdate: '',
    permitDuration: '',
    howDidYouFindUs: '',
    gateCode: '',
    altPhone: '',
    altPickupAddress: '',
    notes: '',
    agreeReschedule: false,
    agreeInfoCorrect: false,
    agreeValidPermit: false
  });

  const updateStudentInfo = (field, value) => {
    setStudentInfo(prev => ({ ...prev, [field]: value }));
  };

  const canSubmit = studentInfo.firstName && studentInfo.lastName && studentInfo.phone && 
    studentInfo.email && studentInfo.pickupAddress && studentInfo.birthdate && 
    studentInfo.permitDuration && studentInfo.agreeReschedule && 
    studentInfo.agreeInfoCorrect && studentInfo.agreeValidPermit;

  const submitBooking = () => {
    // Store student info for webhook
    if (typeof window !== 'undefined') {
      const bookingData = JSON.parse(localStorage.getItem('dvds_pending_booking') || '{}');
      localStorage.setItem('dvds_pending_booking', JSON.stringify({
        ...bookingData,
        studentInfo: studentInfo,
        status: 'pending_acuity_booking'
      }));
    }
    alert('Booking confirmed! We will send you a confirmation email shortly.');
  };

  return (
    <div style={styles.container}>
      <Head><title>Book | DVDS</title></Head>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Information</h1>
        <p style={{color: '#238636', fontWeight: 'bold'}}>[PAID]</p>
      </div>
      <div style={styles.card}>
        <p style={{color: '#8b949e', marginBottom: '16px', fontSize: '14px'}}>
          Please use the student's information below
        </p>

        <h3 style={{marginBottom: '12px', color: '#58a6ff'}}>Student Details *</h3>
        <input 
          placeholder="First Name *" 
          style={styles.input} 
          value={studentInfo.firstName}
          onChange={(e) => updateStudentInfo('firstName', e.target.value)}
        />
        <input 
          placeholder="Last Name *" 
          style={styles.input}
          value={studentInfo.lastName}
          onChange={(e) => updateStudentInfo('lastName', e.target.value)}
        />
        <input 
          placeholder="Phone *" 
          type="tel" 
          style={styles.input}
          value={studentInfo.phone}
          onChange={(e) => updateStudentInfo('phone', e.target.value)}
        />
        <input 
          placeholder="Email *" 
          type="email" 
          style={styles.input}
          value={studentInfo.email}
          onChange={(e) => updateStudentInfo('email', e.target.value)}
        />
        <input 
          placeholder="Student Birthdate (MM/DD/YYYY) *" 
          style={styles.input}
          value={studentInfo.birthdate}
          onChange={(e) => updateStudentInfo('birthdate', e.target.value)}
        />

        <h3 style={{margin: '20px 0 12px', color: '#58a6ff'}}>Lesson Details *</h3>
        <input 
          placeholder="How many lessons did you purchase? *" 
          style={styles.input}
          value={studentInfo.lessonCount}
          onChange={(e) => updateStudentInfo('lessonCount', e.target.value)}
        />
        <input 
          placeholder="How long has student had their permit? *" 
          style={styles.input}
          value={studentInfo.permitDuration}
          onChange={(e) => updateStudentInfo('permitDuration', e.target.value)}
        />
        <input 
          placeholder="Pickup Address * (double check spelling)" 
          style={styles.input}
          value={studentInfo.pickupAddress}
          onChange={(e) => updateStudentInfo('pickupAddress', e.target.value)}
        />
        <input 
          placeholder="How did you find us?" 
          style={styles.input}
          value={studentInfo.howDidYouFindUs}
          onChange={(e) => updateStudentInfo('howDidYouFindUs', e.target.value)}
        />

        <h3 style={{margin: '20px 0 12px', color: '#58a6ff'}}>Additional Information</h3>
        <input 
          placeholder="Gate code (if applicable)" 
          style={styles.input}
          value={studentInfo.gateCode}
          onChange={(e) => updateStudentInfo('gateCode', e.target.value)}
        />
        <input 
          placeholder="Additional phone number" 
          type="tel"
          style={styles.input}
          value={studentInfo.altPhone}
          onChange={(e) => updateStudentInfo('altPhone', e.target.value)}
        />
        <input 
          placeholder="Alternate pickup address for specific dates" 
          style={styles.input}
          value={studentInfo.altPickupAddress}
          onChange={(e) => updateStudentInfo('altPickupAddress', e.target.value)}
        />
        <textarea 
          placeholder="Additional notes for instructor" 
          style={{...styles.input, minHeight: '80px'}}
          value={studentInfo.notes}
          onChange={(e) => updateStudentInfo('notes', e.target.value)}
        />

        <h3 style={{margin: '20px 0 12px', color: '#58a6ff'}}>Agreements *</h3>
        
        <label style={{display: 'flex', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer'}}>
          <input 
            type="checkbox" 
            checked={studentInfo.agreeReschedule}
            onChange={(e) => updateStudentInfo('agreeReschedule', e.target.checked)}
            style={{marginRight: '8px', marginTop: '4px', width: '18px', height: '18px'}}
          />
          <span style={{fontSize: '14px', lineHeight: '1.4'}}>
            I understand that we need 2 days notice to reschedule a lesson for free. 
            Less than 2 days notice is a $75 rescheduling fee. *
          </span>
        </label>

        <label style={{display: 'flex', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer'}}>
          <input 
            type="checkbox" 
            checked={studentInfo.agreeInfoCorrect}
            onChange={(e) => updateStudentInfo('agreeInfoCorrect', e.target.checked)}
            style={{marginRight: '8px', marginTop: '4px', width: '18px', height: '18px'}}
          />
          <span style={{fontSize: '14px', lineHeight: '1.4'}}>
            I agree that if any information above is incorrect and the instructor is late, 
            we won't be able to make up the time. *
          </span>
        </label>

        <label style={{display: 'flex', alignItems: 'flex-start', marginBottom: '20px', cursor: 'pointer'}}>
          <input 
            type="checkbox" 
            checked={studentInfo.agreeValidPermit}
            onChange={(e) => updateStudentInfo('agreeValidPermit', e.target.checked)}
            style={{marginRight: '8px', marginTop: '4px', width: '18px', height: '18px'}}
          />
          <span style={{fontSize: '14px', lineHeight: '1.4'}}>
            I agree the student has a valid Arizona permit. If student does not have a valid 
            Arizona permit at the time of lesson, the class will be cancelled with no refund. *
          </span>
        </label>

        <button 
          style={{...styles.button, opacity: canSubmit ? 1 : 0.5, background: canSubmit ? '#238636' : '#30363d'}} 
          onClick={submitBooking}
          disabled={!canSubmit}
        >
          {canSubmit ? 'Complete Booking >' : 'Please fill all required fields'}
        </button>
      </div>
    </div>
  );
}