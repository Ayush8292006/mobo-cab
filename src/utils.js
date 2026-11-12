export const tFmt = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
export const inMin = (m) => tFmt(new Date(Date.now() + m * 60000));
export const tripMin = (km) => Math.max(6, Math.round(km * 2.4 + 3));
export const short = (s, n = 26) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
export const initials = (n) => (n || 'G').split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
export const greet = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };
export const rideId = () => 'MB' + Math.random().toString(36).slice(2, 7).toUpperCase();
export const otp4 = () => String(1000 + Math.floor(Math.random() * 9000));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const firstName = (user) => (user ? user.name.split(' ')[0] : 'there');

/** Trip distance between current pickup and drop. */
export function tripKm(pickup, drop) {
  const d = Math.abs((drop ? drop.km : 5) - (pickup.cur ? 0 : pickup.km));
  return +Math.max(1.2, d || 3.4).toFixed(1);
}

export async function copyText(text, toast) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard', 'copy');
  } catch {
    toast(text, 'copy');
  }
}
