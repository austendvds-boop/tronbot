// Acuity Calendar Configuration
// Maps cities to their appointment type IDs for live availability

export const acuityConfig = {
  // AUSTEN'S ACCOUNT (User ID: 23214568)
  austen: {
    accountId: '23214568',
    apiKey: '49898594aad433ade289daad5fbd8e84',
    cities: {
      ahwatukee: {
        name: 'Ahwatukee',
        appointmentTypeId: '76003665', // Early Bird - EXCEPTION
        calendarIds: ['11494751', '5812644'], // Aaron, Ryan
        active: true,
        account: 'austen',
        isEarlyBird: true
      },
      anthem: {
        name: 'Anthem',
        appointmentTypeId: '50528555', // 2.5 Hour (REGULAR)
        calendarIds: ['9880609', '6137726'], // Alex, Austen
        active: false, // Currently off
        account: 'austen'
      },
      apacheJunction: {
        name: 'Apache Junction',
        appointmentTypeId: '70526040', // All Times (REGULAR)
        calendarIds: ['11494751', '5812644'], // Aaron, Ryan
        active: true,
        account: 'austen'
      },
      casaGrande: {
        name: 'Casa Grande',
        appointmentTypeId: '79425195', // Early Bird only - EXCEPTION
        calendarIds: ['11494751'], // Aaron only
        active: true,
        account: 'austen',
        isEarlyBird: true,
        specialPricing: { price: 699, description: '2 days x 5 hours' }
      },
      caveCreek: {
        name: 'Cave Creek',
        appointmentTypeId: '66596547', // All Times (REGULAR)
        calendarIds: ['9880609', '6137726'], // Alex, Austen
        active: true,
        account: 'austen'
      },
      chandler: {
        name: 'Chandler',
        appointmentTypeId: '76015901', // All Times (REGULAR)
        calendarIds: ['11494751', '5812644'], // Aaron, Ryan
        active: true,
        account: 'austen'
      },
      downtownPhoenix: {
        name: 'Downtown Phoenix',
        appointmentTypeId: '44842749', // 2.5 Hour (REGULAR)
        calendarIds: ['9880609', '5812644'], // Alex, Ryan
        active: true,
        account: 'austen'
      },
      gilbert: {
        name: 'Gilbert',
        appointmentTypeId: '44842781', // All Times (REGULAR)
        calendarIds: ['11494751', '5812644'], // Aaron, Ryan
        active: true,
        account: 'austen'
      },
      mesa: {
        name: 'Mesa',
        appointmentTypeId: '83323017', // All Times (REGULAR)
        calendarIds: ['11494751', '5812644'], // Aaron, Ryan
        active: true,
        account: 'austen'
      },
      northPhoenix: {
        name: 'North Phoenix',
        appointmentTypeId: '50528913', // All Times (REGULAR)
        calendarIds: ['9880609', '6137726'], // Alex, Austen
        active: false, // Dad covering now
        account: 'austen'
      },
      queenCreek: {
        name: 'Queen Creek',
        appointmentTypeId: '50528924', // 2.5 Hour (REGULAR)
        calendarIds: ['11494751'], // Aaron only
        active: true,
        account: 'austen'
      },
      sanTanValley: {
        name: 'San Tan Valley',
        appointmentTypeId: '53640646', // 2.5 Hour (REGULAR)
        calendarIds: ['11494751', '5812644'], // Aaron, Ryan
        active: true,
        account: 'austen'
      },
      scottsdale: {
        name: 'Scottsdale',
        appointmentTypeId: '50528939', // 2.5 Hour (REGULAR)
        calendarIds: ['9880609', '5812644'], // Alex, Ryan
        active: true,
        account: 'austen'
      },
      tempe: {
        name: 'Tempe',
        appointmentTypeId: '80855531', // 2.5 Hour (REGULAR)
        calendarIds: ['11494751', '5812644', '9880609'], // Aaron, Ryan, Alex
        active: true,
        account: 'austen'
      },
      westValley: {
        name: 'West Valley',
        appointmentTypeId: '80855448', // Early Bird only - EXCEPTION
        calendarIds: ['9880609', '5812644'], // Alex, Ryan
        active: true,
        account: 'austen',
        isEarlyBird: true,
        specialPricing: { price: 699, description: 'Early Bird only' }
      }
    }
  },

  // DAD'S ACCOUNT (User ID: 28722957)
  dad: {
    accountId: '28722957',
    apiKey: '2c8203e58babe46dd2a39ca9aade2229',
    cities: {
      anthem: {
        name: 'Anthem',
        appointmentTypeId: '50529545', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347', '5643860'], // Freddy, Tony, etc
        active: true,
        account: 'dad'
      },
      avondale: {
        name: 'Avondale',
        appointmentTypeId: '50529572', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      buckeye: {
        name: 'Buckeye',
        appointmentTypeId: '50529642', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      caveCreek: {
        name: 'Cave Creek',
        appointmentTypeId: '44843029', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      elMirage: {
        name: 'El Mirage',
        appointmentTypeId: '59985753', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      glendale: {
        name: 'Glendale',
        appointmentTypeId: '50529754', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347', '5643860'],
        active: true,
        account: 'dad'
      },
      goodyear: {
        name: 'Goodyear',
        appointmentTypeId: '80856108', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      northPhoenix: {
        name: 'North Phoenix',
        appointmentTypeId: '50529794', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347', '5643860'],
        active: true,
        account: 'dad'
      },
      peoria: {
        name: 'Peoria',
        appointmentTypeId: '80856319', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347', '5643860'],
        active: true,
        account: 'dad'
      },
      scottsdale: {
        name: 'Scottsdale',
        appointmentTypeId: '80856354', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      sunCity: {
        name: 'Sun City',
        appointmentTypeId: '80856381', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      surprise: {
        name: 'Surprise',
        appointmentTypeId: '80856400', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      },
      tolleson: {
        name: 'Tolleson',
        appointmentTypeId: '71529984', // All Times (REGULAR)
        calendarIds: ['8130520', '10751347'],
        active: true,
        account: 'dad'
      }
    }
  }
};

// Map zip codes to cities with priority (Dad's vs Austen's)
export const zipToCity = {
  // Gilbert/Chandler/Mesa/Ahwatukee
  '85234': { city: 'gilbert', account: 'austen' },
  '85233': { city: 'gilbert', account: 'austen' },
  '85295': { city: 'gilbert', account: 'austen' },
  '85296': { city: 'gilbert', account: 'austen' },
  '85297': { city: 'gilbert', account: 'austen' },
  '85298': { city: 'gilbert', account: 'austen' },
  '85224': { city: 'chandler', account: 'austen' },
  '85225': { city: 'chandler', account: 'austen' },
  '85226': { city: 'chandler', account: 'austen' },
  '85248': { city: 'ahwatukee', account: 'austen' },
  '85249': { city: 'ahwatukee', account: 'austen' },
  '85201': { city: 'mesa', account: 'austen' },
  '85202': { city: 'mesa', account: 'austen' },
  '85203': { city: 'mesa', account: 'austen' },
  '85204': { city: 'mesa', account: 'austen' },
  '85205': { city: 'mesa', account: 'austen' },
  '85206': { city: 'mesa', account: 'austen' },
  '85207': { city: 'mesa', account: 'austen' },
  '85208': { city: 'mesa', account: 'austen' },
  '85209': { city: 'mesa', account: 'austen' },
  '85210': { city: 'mesa', account: 'austen' },
  '85212': { city: 'mesa', account: 'austen' },
  '85213': { city: 'mesa', account: 'austen' },
  
  // Queen Creek/San Tan
  '85142': { city: 'queenCreek', account: 'austen' },
  '85143': { city: 'queenCreek', account: 'austen' },
  '85140': { city: 'sanTanValley', account: 'austen' },
  
  // Tempe
  '85281': { city: 'tempe', account: 'austen' },
  '85282': { city: 'tempe', account: 'austen' },
  '85283': { city: 'tempe', account: 'austen' },
  '85284': { city: 'tempe', account: 'austen' },
  
  // Scottsdale
  '85250': { city: 'scottsdale', account: 'austen' },
  '85251': { city: 'scottsdale', account: 'austen' },
  '85254': { city: 'scottsdale', account: 'austen' },
  '85255': { city: 'scottsdale', account: 'austen' },
  '85258': { city: 'scottsdale', account: 'austen' },
  '85259': { city: 'scottsdale', account: 'austen' },
  '85260': { city: 'scottsdale', account: 'austen' },
  '85262': { city: 'scottsdale', account: 'austen' },
  
  // Cave Creek
  '85331': { city: 'caveCreek', account: 'austen' },
  
  // Anthem/North Phoenix
  '85086': { city: 'anthem', account: 'dad' }, // Dad covering now
  '85087': { city: 'anthem', account: 'dad' },
  '85085': { city: 'northPhoenix', account: 'dad' },
  '85083': { city: 'northPhoenix', account: 'dad' },
  
  // Apache Junction
  '85119': { city: 'apacheJunction', account: 'austen' },
  '85120': { city: 'apacheJunction', account: 'austen' },
  
  // Casa Grande
  '85122': { city: 'casaGrande', account: 'austen' },
  '85128': { city: 'casaGrande', account: 'austen' },
  '85193': { city: 'casaGrande', account: 'austen' },
  
  // Downtown Phoenix
  '85003': { city: 'downtownPhoenix', account: 'austen' },
  '85004': { city: 'downtownPhoenix', account: 'austen' },
  '85006': { city: 'downtownPhoenix', account: 'austen' },
  '85007': { city: 'downtownPhoenix', account: 'austen' },
  '85012': { city: 'downtownPhoenix', account: 'austen' },
  '85013': { city: 'downtownPhoenix', account: 'austen' },
  '85014': { city: 'downtownPhoenix', account: 'austen' },
  '85015': { city: 'downtownPhoenix', account: 'austen' },
  '85016': { city: 'downtownPhoenix', account: 'austen' },
  '85018': { city: 'downtownPhoenix', account: 'austen' },
  
  // Glendale
  '85301': { city: 'glendale', account: 'dad' },
  '85302': { city: 'glendale', account: 'dad' },
  '85303': { city: 'glendale', account: 'dad' },
  '85304': { city: 'glendale', account: 'dad' },
  '85305': { city: 'glendale', account: 'dad' },
  '85306': { city: 'glendale', account: 'dad' },
  '85308': { city: 'glendale', account: 'dad' },
  '85310': { city: 'glendale', account: 'dad' },
  
  // Peoria
  '85345': { city: 'peoria', account: 'dad' },
  '85381': { city: 'peoria', account: 'dad' },
  '85382': { city: 'peoria', account: 'dad' },
  '85383': { city: 'peoria', account: 'dad' },
  
  // Sun City
  '85351': { city: 'sunCity', account: 'dad' },
  '85373': { city: 'sunCity', account: 'dad' },
  
  // Surprise/El Mirage
  '85374': { city: 'surprise', account: 'dad' },
  '85378': { city: 'surprise', account: 'dad' },
  '85379': { city: 'surprise', account: 'dad' },
  '85387': { city: 'surprise', account: 'dad' },
  '85388': { city: 'surprise', account: 'dad' },
  '85335': { city: 'elMirage', account: 'dad' },
  
  // Avondale/Goodyear/Tolleson/Buckeye
  '85323': { city: 'avondale', account: 'dad' },
  '85338': { city: 'goodyear', account: 'dad' },
  '85395': { city: 'goodyear', account: 'dad' },
  '85353': { city: 'tolleson', account: 'dad' },
  '85326': { city: 'buckeye', account: 'dad' },
  '85396': { city: 'buckeye', account: 'dad' }
};

// Detect city from address components
export function detectCityFromAddress(addressComponents) {
  let zipCode = '';
  let cityName = '';
  
  addressComponents?.forEach(comp => {
    if (comp.types.includes('postal_code')) zipCode = comp.long_name;
    if (comp.types.includes('locality')) cityName = comp.long_name.toLowerCase();
    if (comp.types.includes('sublocality')) cityName = comp.long_name.toLowerCase();
  });
  
  // Check exact zip match first
  if (zipCode && zipToCity[zipCode]) {
    return zipToCity[zipCode];
  }
  
  // Check city name
  const cityMap = {
    'gilbert': { city: 'gilbert', account: 'austen' },
    'chandler': { city: 'chandler', account: 'austen' },
    'mesa': { city: 'mesa', account: 'austen' },
    'tempe': { city: 'tempe', account: 'austen' },
    'scottsdale': { city: 'scottsdale', account: 'austen' },
    'ahwatukee': { city: 'ahwatukee', account: 'austen' },
    'queen creek': { city: 'queenCreek', account: 'austen' },
    'san tan valley': { city: 'sanTanValley', account: 'austen' },
    'cave creek': { city: 'caveCreek', account: 'austen' },
    'apache junction': { city: 'apacheJunction', account: 'austen' },
    'casa grande': { city: 'casaGrande', account: 'austen' },
    'downtown phoenix': { city: 'downtownPhoenix', account: 'austen' },
    'phoenix': { city: 'downtownPhoenix', account: 'austen' },
    'anthem': { city: 'anthem', account: 'dad' },
    'glendale': { city: 'glendale', account: 'dad' },
    'peoria': { city: 'peoria', account: 'dad' },
    'sun city': { city: 'sunCity', account: 'dad' },
    'surprise': { city: 'surprise', account: 'dad' },
    'el mirage': { city: 'elMirage', account: 'dad' },
    'north phoenix': { city: 'northPhoenix', account: 'dad' },
    'avondale': { city: 'avondale', account: 'dad' },
    'goodyear': { city: 'goodyear', account: 'dad' },
    'tolleson': { city: 'tolleson', account: 'dad' },
    'buckeye': { city: 'buckeye', account: 'dad' }
  };
  
  for (const [key, value] of Object.entries(cityMap)) {
    if (cityName.includes(key)) return value;
  }
  
  // Default
  return { city: 'gilbert', account: 'austen' };
}

// Get city config
export function getCityConfig(cityKey, account) {
  const accountConfig = acuityConfig[account];
  if (!accountConfig) return null;
  return accountConfig.cities[cityKey] || null;
}