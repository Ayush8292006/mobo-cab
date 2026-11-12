import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Art, Header, Icon, Star } from '../components/ui';
import { BASE, pickupPin } from '../map/mapBase';
import { DROPS } from '../map/mapBase';
import { PAYS, PLACES, VEH, withPoint } from '../data';
import { LangSheet, LogoutSheet } from '../sheets/Sheets';
import { initials } from '../utils';

/* ============ Services ============ */
export function Services() {
  const { up, go, toast } = useApp();
  const quick = (v) => { up({ mode: 'ride', veh: v }); go('search', { field: 'drop' }); };
  const Row = ({ art, title, sub, onClick, right }) => (
    <div className="svc" onClick={onClick}>
      {art}
      <div><b>{title}</b><span>{sub}</span></div>
      {right || <Icon n="right" s={18} />}
    </div>
  );
  return (
    <>
      <div className="hdr"><h1>All services</h1></div>
      <div className="scroll pad" style={{ paddingTop: 4 }}>
        <p className="small mut" style={{ fontWeight: 800, letterSpacing: '.6px', margin: '4px 0 10px' }}>RIDES</p>
        {['bike', 'auto', 'eco', 'prem'].map((v) => (
          <Row key={v} art={<Art type={v} className="v" />} title={VEH[v].n} sub={`${VEH[v].d} · from ₹${VEH[v].base + VEH[v].km}`} onClick={() => quick(v)} />
        ))}
        <p className="small mut" style={{ fontWeight: 800, letterSpacing: '.6px', margin: '18px 0 10px' }}>DELIVERY & MORE</p>
        <Row art={<Art type="parcel" className="v" />} title="Parcel" sub="Same-hour delivery up to 10 kg" onClick={() => go('parcel')} />
        <Row art={<Art type="rental" className="v" />} title="Rentals" sub="Book by the hour, multiple stops" onClick={() => go('rental')} />
        <Row art={<span className="lic" style={{ width: 64, height: 44, borderRadius: 12, background: '#fff' }}><Icon n="cal" s={22} /></span>}
          title="Schedule a ride" sub="Book up to 7 days in advance" onClick={() => toast('Scheduled rides are coming soon', 'cal')}
          right={<span className="fast" style={{ marginLeft: 'auto' }}>SOON</span>} />
      </div>
    </>
  );
}
Services.cls = 'tabpad';

/* ============ Activity ============ */
export function Activity() {
  const { st, go } = useApp();
  const [f, setF] = useState('All');
  const list = st.rides.map((r, i) => ({ ...r, i })).filter((r) => f === 'All' || r.status === f);
  return (
    <>
      <div className="hdr"><h1>Your rides</h1></div>
      <div className="hs" style={{ padding: '0 16px 12px' }}>
        {['All', 'Completed', 'Cancelled'].map((x) => <button key={x} className={'chip' + (f === x ? ' on' : '')} onClick={() => setF(x)}>{x}</button>)}
      </div>
      <div className="div" />
      <div className="scroll">
        {list.length ? list.map((r) => (
          <div className="ride" key={r.id + r.i} onClick={() => go('ridedetail', r.i)}>
            <Art type={r.veh} className="v" />
            <div className="t">
              <b>{r.to}</b>
              <span>{r.when} · {VEH[r.veh].n}</span>
              <span className={'st ' + (r.status === 'Completed' ? 'c' : 'x')}>{r.status.toUpperCase()}</span>
            </div>
            <div className="p">₹{r.total}<br /><Icon n="right" s={16} /></div>
          </div>
        )) : (
          <div style={{ padding: '60px 24px', textAlign: 'center' }} className="mut">
            <Icon n="list" s={36} w={1.5} /><p style={{ marginTop: 10, fontWeight: 700 }}>No {f.toLowerCase()} rides yet</p>
          </div>
        )}
      </div>
    </>
  );
}
Activity.cls = 'tabpad';

/* ============ Ride details ============ */
export function RideDetail({ params: i }) {
  const { st, up, go, replace, toast } = useApp();
  const r = st.rides[i];
  if (!r) return null;
  const tax = Math.round(r.fare * 0.05);
  const pi = PLACES.findIndex((p) => p.n === r.to);
  const d = DROPS[(pi < 0 ? 3 : pi) % DROPS.length];
  const rebook = () => {
    const p = PLACES.find((x) => x.n === r.to) || st.saved.home;
    up({ mode: r.veh === 'parcel' ? 'parcel' : 'ride', veh: r.veh, drop: withPoint(p, pi < 0 ? 'home' : undefined) });
    replace('route');
  };
  const mini = `${BASE}<path d="M200 260V${d.y}H${d.x}" fill="none" stroke="#16130F" stroke-width="4.5" stroke-linejoin="round"/>${pickupPin()}<g transform="translate(${d.x} ${d.y})"><circle r="6" fill="#E2463A" stroke="#fff" stroke-width="2.5"/></g>`;
  return (
    <>
      <Header title="Ride details" sub={`${r.when} · ID ${r.id}`} />
      <div className="scroll" style={{ paddingTop: 14 }}>
        <div className="mini"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" dangerouslySetInnerHTML={{ __html: mini }} /></div>
        <div className="pad">
          <div className="trip">
            <div className="r"><span className="dot g" /><div><b>{r.from}</b><span>Pickup</span></div></div>
            <div className="r"><span className="sq" /><div><b>{r.to}</b><span>Drop · {r.km} km</span></div></div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <Art type={r.veh} width={52} height={36} />
            <div style={{ flex: 1 }}><b>{VEH[r.veh].n}</b><p className="small mut">{r.status === 'Completed' ? 'Captain · ' + r.cap : 'Cancelled by you'}</p></div>
            {r.rate > 0 && <span className="row" style={{ gap: 2 }}>{[1, 2, 3, 4, 5].map((k) => <Star key={k} s={14} fill={k <= r.rate ? '#D4A537' : 'none'} />)}</span>}
          </div>
        </div>
        <div className="div" />
        <div className="pad">
          <p style={{ fontWeight: 800, fontSize: 15 }}>Payment</p>
          {r.status === 'Completed' ? (
            <div className="bd">
              <div><span className="mut">Ride fare</span><span>₹{r.fare - tax}</span></div>
              <div><span className="mut">Taxes & fees</span><span>₹{tax}</span></div>
              {r.disc > 0 && <div><span className="gr">Discount</span><span className="gr">− ₹{r.disc}</span></div>}
              <div className="t"><span>Paid via {PAYS[r.pay].n}</span><span>₹{r.total}</span></div>
            </div>
          ) : <p className="mut small" style={{ marginTop: 8 }}>No charges for this ride.</p>}
        </div>
        <div className="div" />
        <div className="li" onClick={() => toast('Invoice sent to your email', 'receipt')}><span className="lic"><Icon n="receipt" s={18} /></span><div className="t"><b>Get invoice</b></div><Icon n="right" s={18} /></div>
        <div className="li" onClick={() => go('help')}><span className="lic"><Icon n="help" s={18} /></span><div className="t"><b>Report an issue with this ride</b></div><Icon n="right" s={18} /></div>
        <div className="pad"><button className="btn" onClick={rebook}>Book again</button></div>
      </div>
    </>
  );
}

/* ============ Account ============ */
const MENU = [['wallet', 'Payments & Wallet', 'wallet'], ['pin', 'Saved places', 'saved'], ['shield', 'Safety', 'safety'], ['gift', 'Refer & earn', 'refer'],
  ['tag', 'Offers & coupons', 'offers'], ['bell', 'Notifications', 'notifications'], ['help', 'Help & support', 'help']];
export function Account() {
  const { st, go, tab, toast, openSheet } = useApp();
  const u = st.user || { name: 'Guest', phone: '' };
  return (
    <>
      <div className="hdr"><h1>Account</h1></div>
      <div className="scroll">
        <div className="prof" onClick={() => go('profile')} style={{ cursor: 'pointer' }}>
          <div className="av">{initials(u.name)}</div>
          <div style={{ flex: 1 }}>
            <b>{u.name}</b><span>+91 {u.phone.slice(0, 5)} {u.phone.slice(5)}</span>
            <p className="small" style={{ fontWeight: 700, marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}><Star s={12} fill="#FFC41F" />4.9 rider rating</p>
          </div>
          <Icon n="edit" s={18} />
        </div>
        <div className="stats">
          <div onClick={() => go('wallet')}><small><Icon n="wallet" s={13} />Wallet</small><b>₹{st.wallet}</b></div>
          <div onClick={() => toast('Use coins to get discounts on rides', 'coin')}><small><Icon n="coin" s={13} />Coins</small><b>{st.coins}</b></div>
          <div onClick={() => tab('activity')}><small><Icon n="list" s={13} />Rides</small><b>{st.rides.filter((r) => r.status === 'Completed').length}</b></div>
        </div>
        <div className="div" />
        {MENU.map(([i, t, s]) => (
          <div key={s} className="li" onClick={() => go(s)}><span className="lic"><Icon n={i} s={18} /></span><div className="t"><b>{t}</b></div><Icon n="right" s={18} /></div>
        ))}
        <div className="li" onClick={() => openSheet(<LangSheet />)}><span className="lic"><Icon n="globe" s={18} /></span><div className="t"><b>Language</b><span>English</span></div><Icon n="right" s={18} /></div>
        <div className="div" />
        <div className="li" onClick={() => openSheet(<LogoutSheet />)} style={{ color: 'var(--r)' }}>
          <span className="lic" style={{ background: '#FDEBE9' }}><Icon n="logout" s={18} /></span><div className="t"><b>Log out</b></div>
        </div>
        <p className="small" style={{ textAlign: 'center', color: 'var(--mut2)', padding: '20px 0 26px' }}>MOBO Cab · v1.0.0</p>
      </div>
    </>
  );
}
Account.cls = 'tabpad';
