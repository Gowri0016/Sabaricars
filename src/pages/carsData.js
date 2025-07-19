// Example car data for the refurbished cars seller website
const cars = [
   {
    id: 1,
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80'
    ],
    make: 'Honda',
    model: 'City',
    variant: 'VMT',
    year: 2017,
    fuelType: 'Diesel',
    transmission: 'Manual',
    odometer: '58,000 km',
    owners: '2nd Owner',
    registration: 'Bangalore, KA',
    manufacturingDate: 'Mar 2017',
    registrationDate: 'Apr 2017',
    insuranceValidity: 'Apr 2025',
    fitnessValidity: 'Apr 2032',
    price: '₹7,20,000',
    description: 'Top variant, new tires, recently serviced.',
    inspection: {
      engine: 'Good pick-up, no abnormal noises',
      transmission: 'Smooth shifts',
      suspension: 'Good ride comfort',
      brakes: 'No squealing',
      steering: 'Responsive',
      electricals: 'All working',
      exterior: 'Minor dents, good paint',
      interior: 'Clean, all controls functional',
      tires: 'MRF, 2023, new',
      battery: 'Good condition',
      underbody: 'No rust'
    },
    refurbishment: {
      process: '120-point inspection, paint touch-up, interior cleaning',
      partsReplaced: ['Tires', 'Battery'],
      serviceHistory: 'Independent garage records',
      accidentHistory: 'Minor accident, bumper replaced',
      floodDamage: 'No',
      warranty: '3 months engine',
      certification: 'Certified Pre-Owned'
    },
    visuals: {
      video: '',
      odometerPhoto: '',
      engineBay: '',
      underbody: ''
    },
    financial: {
      emi: 'Available',
      loanAssistance: true,
      exchangeOffer: false,
      downPayment: '₹60,000',
      paymentOptions: ['Online', 'Bank Transfer'],
      delivery: 'Pickup Only'
    }
  },
  {
    id: 2,
    images: [
      'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=600&q=80'
    ],
    make: 'Toyota',
    model: 'Corolla',
    variant: 'Altis GL',
    year: 2018,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    odometer: '42,000 km',
    owners: '1st Owner',
    registration: 'Chennai, TN',
    manufacturingDate: 'Jan 2018',
    registrationDate: 'Feb 2018',
    insuranceValidity: 'Feb 2026',
    fitnessValidity: 'Feb 2033',
    price: '₹6,50,000',
    description: 'Well maintained, single owner, low mileage.',
    inspection: {
      engine: 'Smooth, no abnormal noises, good pick-up',
      transmission: 'Smooth shifts, no jerks',
      suspension: 'No creaking, good ride comfort',
      brakes: 'Good stopping power, no squealing',
      steering: 'No play, responsive',
      electricals: 'All working',
      exterior: 'Minor scratches, excellent paint',
      interior: 'Clean seats, dashboard, all controls functional',
      tires: 'Michelin, 2022, good tread',
      battery: 'Replaced 2023, good condition',
      underbody: 'No rust, no damage'
    },
    refurbishment: {
      process: '150-point inspection, engine reconditioning, paint correction, interior detailing',
      partsReplaced: ['Brake pads', 'Suspension bushes', 'AC gas refilled'],
      serviceHistory: 'Dealership records available',
      accidentHistory: 'Accident-free',
      floodDamage: 'No',
      warranty: '6 months engine & transmission',
      certification: 'Certified Pre-Owned'
    },
    visuals: {
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      odometerPhoto: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80',
      engineBay: 'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=600&q=80',
      underbody: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80'
    },
    financial: {
      emi: 'Available',
      loanAssistance: true,
      exchangeOffer: true,
      downPayment: '₹50,000',
      paymentOptions: ['Online', 'Bank Transfer'],
      delivery: 'Home Delivery Available'
    }
  },
 
  {
    id: 3,
    images: [
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80'
    ],
    make: 'Hyundai',
    model: 'i20',
    variant: 'Asta',
    year: 2019,
    fuelType: 'Petrol',
    transmission: 'AMT',
    odometer: '32,000 km',
    owners: '1st Owner',
    registration: 'Hyderabad, TS',
    manufacturingDate: 'Aug 2019',
    registrationDate: 'Sep 2019',
    insuranceValidity: 'Sep 2025',
    fitnessValidity: 'Sep 2034',
    price: '₹5,80,000',
    description: 'Excellent condition, full service history.',
    inspection: {
      engine: 'Excellent',
      transmission: 'Smooth',
      suspension: 'Good',
      brakes: 'Good',
      steering: 'Responsive',
      electricals: 'All working',
      exterior: 'No scratches',
      interior: 'Clean',
      tires: 'Good',
      battery: 'Good',
      underbody: 'No rust'
    },
    refurbishment: {
      process: '100-point inspection, interior detailing',
      partsReplaced: ['None'],
      serviceHistory: 'Dealership records',
      accidentHistory: 'Accident-free',
      floodDamage: 'No',
      warranty: '3 months',
      certification: 'Certified Pre-Owned'
    },
    visuals: {
      video: '',
      odometerPhoto: '',
      engineBay: '',
      underbody: ''
    },
    financial: {
      emi: 'Available',
      loanAssistance: false,
      exchangeOffer: false,
      downPayment: '₹40,000',
      paymentOptions: ['Online', 'Bank Transfer'],
      delivery: 'Pickup Only'
    }
  }
];

export default cars;
