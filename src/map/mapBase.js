/* Stylised city map drawn in SVG (400x800 world units). */
export const VX = [50, 125, 200, 280, 355];
export const HY = [25, 100, 180, 260, 345, 430, 520, 610, 700, 790];
export const PU = { x: 200, y: 260 }; // rider's pickup point
export const DROPS = [
  { x: 50, y: 100 }, { x: 280, y: 100 }, { x: 125, y: 180 }, { x: 355, y: 180 },
  { x: 355, y: 100 }, { x: 50, y: 180 }, { x: 125, y: 100 }, { x: 280, y: 180 },
];

function rng(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/** Static base layer: blocks, buildings, parks, water, roads and labels. */
export const BASE = (() => {
 const r=rng(11),xs=[0,...VX,400],ys=[0,...HY,800];let s='<rect width="400" height="800" fill="#EFEBE2"/>';
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
  const x1=xs[i]+7,x2=xs[i+1]-7,y1=ys[j]+7,y2=ys[j+1]-7;if(x2-x1<10||y2-y1<10)continue;
  s+=`<rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" rx="3" fill="#F8F6F0"/>`;
  const n=2+Math.floor(r()*3);for(let k=0;k<n;k++){const w=8+r()*(x2-x1-14)*.5,h=8+r()*(y2-y1-14)*.4,x=x1+4+r()*(x2-x1-w-8),y=y1+4+r()*(y2-y1-h-8);s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="#E8E3D8"/>`}
 }
 s+=`<rect x="57" y="352" width="61" height="71" rx="4" fill="#C4E6B4"/><rect x="287" y="32" width="61" height="61" rx="4" fill="#C4E6B4"/><rect x="132" y="527" width="61" height="76" rx="4" fill="#C4E6B4"/>`;
 s+=`<path d="M0 640C110 612 190 690 400 648V705C230 745 120 680 0 712Z" fill="#A9D7F2"/>`;
 const road=(d,w,c1,c2)=>`<path d="${d}" fill="none" stroke="${c1}" stroke-width="${w+2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c2}" stroke-width="${w}" stroke-linecap="round"/>`;
 let cas='',fil='';VX.forEach(x=>{cas+=`M${x} 0V800`});HY.forEach(y=>{cas+=`M0 ${y}H400`});
 s+=road(cas,8,'#E2DCCF','#FFFFFF');
 s+=road('M0 492L400 392',12,'#F2BE45','#FFDB7A');
 s+=road('M200 0V800',10,'#E2DCCF','#FFFFFF');
 const L=(x,y,t,sz=9,c='#8F918A',w=600)=>`<text x="${x}" y="${y}" font-size="${sz}" fill="${c}" font-weight="${w}" font-family="Manrope,sans-serif" text-anchor="middle">${t}</text>`;
 s+=L(88,392,'Central Park',8.5,'#4E8A3F',700)+L(318,66,'City Forest',8.5,'#4E8A3F',700)+L(162,568,'Sector 59 Park',8,'#4E8A3F',700);
 s+=L(240,225,'SECTOR 62',9,'#B2AC9F',800)+L(88,140,'SECTOR 63',9,'#B2AC9F',800)+L(318,305,'SECTOR 61',9,'#B2AC9F',800)+L(88,305,'SECTOR 64',9,'#B2AC9F',800)+L(318,140,'SECTOR 71',9,'#B2AC9F',800);
 s+=`<text font-size="9" font-weight="800" fill="#B48A2C" font-family="Manrope"><textPath href="#hw" startOffset="58%">NH 24</textPath></text><path id="hw" d="M0 486L400 386" fill="none"/>`;
 s+=L(240,663,'Hindon Canal',8.5,'#5B8FB5',700)+L(240,486,'Fortis Hospital',8,'#C0554B',700)+L(160,340,'Electronic City',8,'#7B7D76',700);
  return s;
})();

/** Top-view vehicle marker (points along +x so it can be rotated to heading). */
export function topV(t) {
  if (t === 'bike' || t === 'parcel') return `<circle r="11" fill="#fff" stroke="#ddd"/><ellipse rx="7.5" ry="2.8" fill="#222"/><circle cx="1" r="2.8" fill="#111111"/>`;
  if (t === 'auto') return `<circle r="12" fill="#fff" stroke="#ddd"/><rect x="-7" y="-5" width="14" height="10" rx="3" fill="#FFC41F" stroke="#333" stroke-width=".7"/><rect x="2" y="-4" width="3" height="8" fill="#1E8E4E"/>`;
  const c = t === 'prem' ? '#222' : '#fff';
  return `<circle r="12.5" fill="#fff" stroke="#ddd"/><rect x="-8.5" y="-4.6" width="17" height="9.2" rx="3" fill="${c}" stroke="#333" stroke-width=".8"/><rect x="2" y="-3.6" width="3" height="7.2" rx="1" fill="#7FA6C2"/><rect x="-6.5" y="-3.6" width="2.2" height="7.2" rx="1" fill="#7FA6C2"/>`;
}

export const routeD = (pt) => `M${PU.x} ${PU.y}V${pt.y}H${pt.x}`;
export const APPROACH_D = 'M355 25V180H280V260H200'; // captain driving to pickup

function label(x, y, t, dark) {
  const w = t.length * 5.6 + 18;
  const lx = Math.min(Math.max(x - w / 2, 6), 394 - w);
  return `<g><rect x="${lx}" y="${y}" width="${w}" height="20" rx="6" fill="${dark ? '#111111' : '#fff'}" stroke="${dark ? '#111111' : '#DCDDEA'}"/><text x="${lx + w / 2}" y="${y + 13.5}" font-size="9.5" font-weight="800" fill="${dark ? '#fff' : '#0E1233'}" text-anchor="middle" font-family="Manrope,sans-serif">${t}</text></g>`;
}
export const pickupPin = () => `<g transform="translate(${PU.x} ${PU.y})"><circle r="9" fill="#111111" opacity=".18"/><circle r="5.5" fill="#111111" stroke="#fff" stroke-width="2.5"/></g>`;
const dropPin = (d) => `<g transform="translate(${d.x} ${d.y})"><path d="M0 0c-6-8-10-11-10-17a10 10 0 0 1 20 0c0 6-4 9-10 17z" fill="#E2463A" stroke="#fff" stroke-width="2"/><rect x="-3.5" y="-20.5" width="7" height="7" rx="1.5" fill="#fff"/></g>`;

/** Home: nearby captains moving on roads + "you are here" pulse + ETA bubble. */
export function homeOverlay() {
  const near = [[125, 215, 'M0 0h-40'], [280, 260, 'M0 0V60'], [200, 140, 'M0 0V-40'], [160, 345, 'M0 0h60'], [355, 300, 'M0 0V-50'], [60, 260, 'M0 0h40']];
  let o = near.map(([x, y, p], i) => `<g transform="translate(${x} ${y})"><g>${topV(i % 3 === 1 ? 'auto' : i % 3 === 2 ? 'eco' : 'bike')}<animateMotion path="${p}" dur="${7 + i}s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear"/></g></g>`).join('');
  o += `<g transform="translate(${PU.x} ${PU.y})"><circle r="14" fill="#2F6FEB" opacity=".15"><animate attributeName="r" values="10;30;10" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".3;0;.3" dur="2.6s" repeatCount="indefinite"/></circle><circle r="7" fill="#2F6FEB" stroke="#fff" stroke-width="3"/></g>`;
  o += `<g transform="translate(${PU.x} ${PU.y - 44})"><rect x="-52" y="-14" width="104" height="28" rx="14" fill="#111111"/><circle cx="-37" cy="0" r="8" fill="#111111"/><path d="M-39 -4l4 4-4 4" stroke="#fff" stroke-width="1.8" fill="none"/><text x="6" y="4" font-size="10.5" font-weight="800" fill="#fff" text-anchor="middle" font-family="Manrope,sans-serif">Bike in 2 min</text><path d="M-6 14l6 7 6-7z" fill="#111111"/></g>`;
  return o;
}

/** Route between pickup and drop, with labels; optional searching radar. */
export function routeOverlay(pt, pickTxt, dropTxt, searching) {
  let o = `<path d="${routeD(pt)}" fill="none" stroke="#111111" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" from="1" to="0" dur=".9s" fill="freeze"/></path>`;
  o += pickupPin() + dropPin(pt) + label(PU.x - 66, PU.y - 10, pickTxt) + label(pt.x, pt.y - 46, dropTxt, true);
  if (searching) o += `<g transform="translate(${PU.x} ${PU.y})">${[0, 1, 2].map((i) => `<circle r="10" fill="none" stroke="#111111" stroke-width="2.5"><animate attributeName="r" values="8;70" dur="2.4s" begin="${i * 0.8}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2.4s" begin="${i * 0.8}s" repeatCount="indefinite"/></circle>`).join('')}</g>`;
  return o;
}
