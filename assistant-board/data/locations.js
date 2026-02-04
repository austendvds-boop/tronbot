// Location assignments - EDIT THIS to toggle coverage
// account: 'austen' | 'dad' | 'both' | 'off'
// active: true | false

export const locationConfig = {
  // AUSTEN'S LOCATIONS (Alex, Austen, Aaron, Ryan)
  caveCreek: { 
    name: 'Cave Creek', 
    instructors: 'Alex, Austen', 
    account: 'austen', 
    active: true 
  },
  ahwatukee: { 
    name: 'Ahwatukee', 
    instructors: 'Aaron, Ryan', 
    account: 'austen', 
    active: true 
  },
  chandler: { 
    name: 'Chandler', 
    instructors: 'Aaron, Ryan', 
    account: 'austen', 
    active: true 
  },
  downtownPhoenix: { 
    name: 'Downtown Phoenix', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
  gilbert: { 
    name: 'Gilbert', 
    instructors: 'Aaron, Ryan', 
    account: 'austen', 
    active: true 
  },
  mesa: { 
    name: 'Mesa', 
    instructors: 'Aaron, Ryan', 
    account: 'austen', 
    active: true 
  },
  queenCreek: { 
    name: 'Queen Creek', 
    instructors: 'Aaron', 
    account: 'austen', 
    active: true 
  },
  sanTanValley: { 
    name: 'San Tan Valley', 
    instructors: 'Aaron, Ryan', 
    account: 'austen', 
    active: true 
  },
  tempe: { 
    name: 'Tempe', 
    instructors: 'Aaron, Ryan, Alex', 
    account: 'austen', 
    active: true 
  },
  
  // DAD'S LOCATIONS (Allan, Bob, Brandon, Ernie, Freddy, Michelle)
  anthem: { 
    name: 'Anthem', 
    instructors: 'Allan, Bob, Brandon, Ernie, Freddy, Michelle', 
    account: 'dad', 
    active: true 
  },
  // Apache Junction - routes to Dad's calendar
  apacheJunction: { 
    name: 'Apache Junction', 
    instructors: 'Allan, Brandon, Freddy, Michelle, Ernie', 
    account: 'dad', 
    active: true 
  },
  casaGrande: { 
    name: 'Casa Grande', 
    instructors: 'Aaron', // Aaron only, but you said overflow?
    account: 'austen', 
    active: true 
  },
  glendale: { 
    name: 'Glendale', 
    instructors: 'Allan, Brandon, Ernie, Freddy, Michelle', 
    account: 'dad', 
    active: true 
  },
  northPhoenix: { 
    name: 'North Phoenix', 
    instructors: 'Allan, Brandon, Ernie, Freddy, Michelle', 
    account: 'dad', 
    active: true 
  },
  peoria: { 
    name: 'Peoria', 
    instructors: 'Allan, Brandon, Ernie, Freddy, Michelle', 
    account: 'dad', 
    active: true 
  },
  sunCity: { 
    name: 'Sun City', 
    instructors: 'Allan, Brandon', 
    account: 'dad', 
    active: true 
  },
  westValley: { 
    name: 'West Valley', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
  // Cities routing to West Valley
  avondale: { 
    name: 'Avondale', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
  buckeye: { 
    name: 'Buckeye', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
  goodyear: { 
    name: 'Goodyear', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
  tolleson: { 
    name: 'Tolleson', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
  // El Mirage routes to Surprise
  elMirage: { 
    name: 'El Mirage', 
    instructors: 'Allan, Brandon', 
    account: 'dad', 
    active: true 
  },
  
  // Scottsdale - Austen's for now (routing logic to be added later)
  scottsdale: { 
    name: 'Scottsdale', 
    instructors: 'Alex, Ryan', 
    account: 'austen', 
    active: true 
  },
};

// Zone mapping by zip code prefixes
export const zipToLocation = {
  // East Valley - Austen
  '852': 'ahwatukee', // Gilbert, Chandler, Mesa, Ahwatukee
  '85234': 'gilbert',
  '85233': 'gilbert', 
  '85224': 'chandler',
  '85225': 'chandler',
  '85226': 'chandler',
  '85248': 'ahwatukee',
  '85249': 'ahwatukee',
  '85295': 'gilbert',
  '85296': 'gilbert',
  '85297': 'gilbert',
  '85298': 'gilbert',
  
  // Queen Creek/San Tan
  '85142': 'queenCreek',
  '85143': 'queenCreek',
  '85140': 'sanTanValley',
  
  // Tempe
  '85281': 'tempe',
  '85282': 'tempe',
  '85283': 'tempe',
  '85284': 'tempe',
  
  // Scottsdale
  '85250': 'scottsdale',
  '85251': 'scottsdale',
  '85254': 'scottsdale',
  '85255': 'scottsdale',
  '85258': 'scottsdale',
  '85259': 'scottsdale',
  '85260': 'scottsdale',
  '85262': 'scottsdale',
  
  // Cave Creek
  '85331': 'caveCreek',
  
  // Anthem/North Phoenix
  '85086': 'anthem',
  '85087': 'anthem',
  '85085': 'anthem',
  '85083': 'northPhoenix',
  '85085': 'northPhoenix',
  
  // West Valley - Dad
  '85301': 'glendale',
  '85302': 'glendale',
  '85303': 'glendale',
  '85304': 'glendale',
  '85305': 'glendale',
  '85306': 'glendale',
  '85308': 'glendale',
  '85310': 'glendale',
  '85345': 'peoria',
  '85381': 'peoria',
  '85382': 'peoria',
  '85383': 'peoria',
  '85351': 'sunCity',
  '85373': 'sunCity',
  '85335': 'elMirage',
  
  // West Valley - Austen (Avondale, Goodyear, Tolleson, Buckeye)
  '85323': 'avondale',
  '85392': 'avondale',
  '85326': 'buckeye',
  '85396': 'buckeye',
  '85338': 'goodyear',
  '85395': 'goodyear',
  '85353': 'tolleson',
  
  // Apache Junction
  '85119': 'apacheJunction',
  '85120': 'apacheJunction',
  
  // Casa Grande
  '85122': 'casaGrande',
  '85128': 'casaGrande',
  '85193': 'casaGrande',
  
  // Downtown Phoenix (anything south of Glendale in Phoenix)
  '85003': 'downtownPhoenix',
  '85004': 'downtownPhoenix',
  '85006': 'downtownPhoenix',
  '85007': 'downtownPhoenix',
  '85008': 'downtownPhoenix',
  '85009': 'downtownPhoenix',
  '85012': 'downtownPhoenix',
  '85013': 'downtownPhoenix',
  '85014': 'downtownPhoenix',
  '85015': 'downtownPhoenix',
  '85016': 'downtownPhoenix',
  '85017': 'downtownPhoenix',
  '85018': 'downtownPhoenix',
  '85019': 'downtownPhoenix',
  '85020': 'downtownPhoenix',
  '85021': 'downtownPhoenix',
  '85022': 'downtownPhoenix',
  '85023': 'downtownPhoenix',
  '85024': 'downtownPhoenix',
  '85027': 'downtownPhoenix',
  '85028': 'downtownPhoenix',
  '85029': 'downtownPhoenix',
  '85032': 'downtownPhoenix',
  '85033': 'downtownPhoenix',
  '85034': 'downtownPhoenix',
  '85035': 'downtownPhoenix',
  '85037': 'downtownPhoenix',
  '85040': 'downtownPhoenix',
  '85041': 'downtownPhoenix',
  '85042': 'downtownPhoenix',
  '85043': 'downtownPhoenix',
  '85044': 'downtownPhoenix',
  '85045': 'downtownPhoenix',
  '85048': 'downtownPhoenix',
  '85050': 'downtownPhoenix',
  '85051': 'downtownPhoenix',
  '85053': 'downtownPhoenix',
  '85054': 'downtownPhoenix',
};

// Detect location from address components
export function detectLocationFromAddress(addressComponents) {
  let zipCode = '';
  let cityName = '';
  
  addressComponents?.forEach(comp => {
    if (comp.types.includes('postal_code')) zipCode = comp.long_name;
    if (comp.types.includes('locality')) cityName = comp.long_name.toLowerCase();
    if (comp.types.includes('sublocality')) cityName = comp.long_name.toLowerCase();
  });
  
  // Check zip code first
  if (zipCode && zipToLocation[zipCode]) {
    return locationConfig[zipToLocation[zipCode]];
  }
  
  // Check zip prefix
  const zipPrefix = zipCode?.substring(0, 3);
  if (zipPrefix && zipToLocation[zipPrefix]) {
    return locationConfig[zipToLocation[zipPrefix]];
  }
  
  // Check city name
  for (const [key, loc] of Object.entries(locationConfig)) {
    if (cityName.includes(loc.name.toLowerCase())) {
      return loc;
    }
  }
  
  // Default to Gilbert
  return locationConfig.gilbert;
}