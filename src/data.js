import { DROPS } from './map/mapBase';

/* ---------- Places (demo data, Noida / Delhi NCR) ---------- */
export const PLACES = [
  { n: 'Noida City Centre Metro Station', a: 'Sector 32, Noida, Uttar Pradesh', km: 6.4 },
  { n: 'DLF Mall of India', a: 'Sector 18, Noida, Uttar Pradesh', km: 9.2 },
  { n: 'Fortis Hospital', a: 'B-22, Sector 62, Noida', km: 1.8 },
  { n: 'The Great India Place', a: 'Sector 38A, Noida, Uttar Pradesh', km: 10.1 },
  { n: 'Botanical Garden Metro Station', a: 'Sector 38, Noida, Uttar Pradesh', km: 11.3 },
  { n: 'Gaur City Mall', a: 'Greater Noida West, Uttar Pradesh', km: 8.7 },
  { n: 'Pari Chowk', a: 'Knowledge Park II, Greater Noida', km: 24.5 },
  { n: 'Akshardham Temple', a: 'Noida Mor, Pandav Nagar, New Delhi', km: 16.8 },
  { n: 'Connaught Place', a: 'Rajiv Chowk, New Delhi, Delhi', km: 22.6 },
  { n: 'India Gate', a: 'Rajpath, India Gate, New Delhi', km: 23.9 },
  { n: 'Indira Gandhi International Airport T3', a: 'New Delhi, Delhi 110037', km: 38.2 },
  { n: 'Logix City Centre Mall', a: 'Sector 32, Noida, Uttar Pradesh', km: 6.1 },
  { n: 'Sector 18 Market', a: 'Sector 18, Noida, Uttar Pradesh', km: 9.0 },
  { n: 'Electronic City Metro Station', a: 'Sector 62, Noida, Uttar Pradesh', km: 1.2 },
  { n: 'Okhla Bird Sanctuary', a: 'Sector 95, Noida, Uttar Pradesh', km: 17.4 },
  { n: 'Anand Vihar ISBT', a: 'Anand Vihar, Delhi 110092', km: 12.9 },
];

export const CURRENT_LOCATION = { n: 'Sector 62', a: 'Sector 62, Noida, Uttar Pradesh', km: 0, cur: true };

export const SAVED = {
  home: { n: 'Home', a: 'Tower B, Supertech Capetown, Sector 74, Noida', km: 5.6 },
  work: { n: 'Work', a: 'Techora Tech, Sector 63, Noida', km: 2.3 },
};

/** Attach a map point to a place so the route can be drawn. */
export function withPoint(p, savedKey) {
  if (savedKey === 'home') return { ...p, pt: DROPS[3] };
  if (savedKey === 'work') return { ...p, pt: DROPS[6] };
  const i = PLACES.findIndex((x) => x.n === p.n);
  return { ...p, pt: DROPS[(i < 0 ? 5 : i) % DROPS.length] };
}

/* ---------- Vehicles & pricing ---------- */
export const VEH = {
  bike: { n: 'Bike', d: 'Beat the traffic', seats: 1, base: 15, km: 6, eta: 2, model: 'Honda Shine · Black', cta: 'Book Bike' },
  auto: { n: 'Auto', d: 'No bargaining, doorstep pickup', seats: 3, base: 25, km: 11, eta: 3, model: 'Bajaj RE · Green-Yellow', cta: 'Book Auto' },
  eco: { n: 'Cab Economy', d: 'Affordable AC cab rides', seats: 4, base: 45, km: 14, eta: 4, model: 'Maruti Dzire · White', cta: 'Book Cab Economy' },
  prem: { n: 'Cab Premium', d: 'Comfy sedans, top-rated captains', seats: 4, base: 65, km: 18, eta: 6, model: 'Honda City · Grey', cta: 'Book Cab Premium' },
  parcel: { n: 'Parcel', d: 'Up to 10 kg · Bike delivery', seats: 0, base: 25, km: 7, eta: 3, model: 'TVS Jupiter · Blue', cta: 'Book Parcel' },
};
export const fare = (v, km) => Math.round(VEH[v].base + km * VEH[v].km);

export const COUPONS = [
  { c: 'MOBO50', t: '50% off up to ₹50', d: 'On your next 3 rides. Valid on all services.', f: (v, x) => Math.min(50, Math.round(x * 0.5)) },
  { c: 'BIKE20', t: 'Flat ₹20 off on Bike rides', d: 'Valid on Bike rides above ₹40.', only: ['bike'], min: 40, f: () => 20 },
  { c: 'CAB75', t: '₹75 off on Cab rides', d: 'Valid on Cab Economy & Premium above ₹299.', only: ['eco', 'prem'], min: 299, f: () => 75 },
  { c: 'PARCEL15', t: 'Flat ₹15 off on Parcel', d: 'Send anything across the city for less.', only: ['parcel'], f: () => 15 },
];
export function discFor(code, v, f) {
  const c = COUPONS.find((x) => x.c === code);
  if (!c) return 0;
  if (c.only && !c.only.includes(v)) return 0;
  if (c.min && f < c.min) return 0;
  return c.f(v, f);
}

export const CAPS = [
  ['Rakesh Kumar', 4.8, '2,140'], ['Sandeep Yadav', 4.9, '3,812'], ['Imran Khan', 4.7, '1,206'],
  ['Vikas Sharma', 4.9, '5,430'], ['Manoj Singh', 4.8, '2,987'],
];

export const PAYS = {
  cash: { n: 'Cash', i: 'cash', d: 'Pay the captain at the end of ride' },
  wallet: { n: 'MOBO Wallet', i: 'wallet', d: '' },
  upi: { n: 'UPI', i: 'upi', d: 'Pay with any UPI app' },
  card: { n: 'Credit / Debit Card', i: 'card', d: 'Visa, Mastercard, RuPay' },
};

export const PKG = [['1 hr', '10 km'], ['2 hrs', '20 km'], ['4 hrs', '40 km'], ['8 hrs', '80 km']];
const PKG_PRICE = { auto: [199, 349, 649, 1199], eco: [299, 549, 999, 1849], prem: [399, 699, 1299, 2399] };
export const pkgPrice = (v, i) => PKG_PRICE[v][i];

export const SEED_RIDES = [
  { id: 'MB72K9Q', veh: 'bike', from: 'Sector 62, Noida', to: 'Noida City Centre Metro Station', km: 6.4, fare: 53, disc: 0, total: 53, pay: 'upi', when: 'Yesterday, 9:14 am', status: 'Completed', cap: 'Sandeep Yadav', rate: 5 },
  { id: 'MB61H2C', veh: 'auto', from: 'Electronic City Metro Station', to: 'DLF Mall of India', km: 9.2, fare: 126, disc: 20, total: 106, pay: 'cash', when: 'Mon, 7:40 pm', status: 'Completed', cap: 'Imran Khan', rate: 4 },
  { id: 'MB55T0A', veh: 'eco', from: 'Sector 62, Noida', to: 'Indira Gandhi International Airport T3', km: 38.2, fare: 580, disc: 0, total: 0, pay: 'card', when: 'Sat, 5:05 am', status: 'Cancelled', cap: '—', rate: 0 },
  { id: 'MB49P7D', veh: 'parcel', from: 'Sector 62, Noida', to: 'Gaur City Mall', km: 8.7, fare: 86, disc: 15, total: 71, pay: 'wallet', when: '2 Nov, 1:22 pm', status: 'Completed', cap: 'Manoj Singh', rate: 5 },
];

/* Ride timings for the demo (ms) */
export const T_SEARCH = 4800;
export const T_APPROACH = 9000;
export const T_WAIT = 4500;
export const T_TRIP = 15000;
