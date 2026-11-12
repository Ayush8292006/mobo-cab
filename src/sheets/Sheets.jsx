import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon, Option, Avatar } from '../components/ui';
import { PAYS, VEH, fare } from '../data';
import { copyText, initials, tFmt, tripKm } from '../utils';

export function FareInfoSheet() {
  const { st, closeSheet } = useApp();
  const km = tripKm(st.pickup, st.drop), v = VEH[st.veh], f = fare(st.veh, km);
  return (
    <>
      <h3>Fare breakdown · {v.n}</h3>
      <p className="mut small">Estimated for {km} km</p>
      <div className="bd" style={{ marginTop: 8 }}>
        <div><span>Base fare</span><span>₹{v.base}</span></div>
        <div><span>Distance fare (₹{v.km}/km)</span><span>₹{f - v.base}</span></div>
        <div><span>Waiting charges</span><span className="mut">₹1/min after 3 min</span></div>
        <div className="t"><span>Estimated total</span><span>₹{f}</span></div>
      </div>
      <p className="mut small" style={{ lineHeight: 1.5, margin: '8px 0 14px' }}>Final fare may vary slightly with route, tolls and waiting time. Taxes included.</p>
      <button className="btn dark" onClick={closeSheet}>Got it</button>
    </>
  );
}

export function PaySheet() {
  const { st, up, closeSheet } = useApp();
  return (
    <>
      <h3>Payment method</h3>
      <p className="mut small" style={{ marginBottom: 6 }}>Choose how you'd like to pay</p>
      {Object.entries(PAYS).map(([k, p]) => (
        <Option key={k} on={st.pay === k} icon={p.i} title={p.n} sub={k === 'wallet' ? `Balance ₹${st.wallet}` : p.d}
          onClick={() => { up({ pay: k }); closeSheet(); }} />
      ))}
    </>
  );
}

const REASONS = ['Captain is taking too long', 'Captain asked me to cancel', 'Booked by mistake', 'Changed my plans', 'Found another ride', 'Other'];
export function CancelSheet({ captainOnWay }) {
  const { up, tab, toast, closeSheet } = useApp();
  const [sel, setSel] = useState(-1);
  const doCancel = () => {
    up((s) => ({
      rides: s.ride ? [{ ...s.ride, cap: s.ride.cap.name, when: 'Today, ' + tFmt(new Date()), status: 'Cancelled', total: 0, rate: 0 }, ...s.rides] : s.rides,
      ride: null, drop: null,
    }));
    tab('home');
    setTimeout(() => toast('Your ride has been cancelled', 'x'), 300);
  };
  return (
    <>
      <h3>Why do you want to cancel?</h3>
      <p className="mut small" style={{ marginBottom: 6 }}>{captainOnWay ? 'Your captain is already on the way. ' : ''}Your feedback helps us improve.</p>
      {REASONS.map((r, i) => <Option key={r} on={sel === i} title={r} bold={false} onClick={() => setSel(i)} />)}
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn ghost" onClick={closeSheet}>Keep ride</button>
        <button className="btn dark" disabled={sel < 0} onClick={doCancel}>Cancel ride</button>
      </div>
    </>
  );
}

export function CallSheet() {
  const { st, closeSheet, toast } = useApp();
  if (!st.ride) return null;
  const c = st.ride.cap;
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
      <Avatar text={initials(c.name)} style={{ margin: '0 auto', width: 64, height: 64, fontSize: 22 }} />
      <h3 style={{ marginTop: 12 }}>Call {c.name}</h3>
      <p className="mut small" style={{ lineHeight: 1.5, margin: '6px 10px 16px' }}>
        <Icon n="lock" s={13} /> Your number is masked. The captain sees a temporary MOBO number, not your real one.
      </p>
      <button className="btn" onClick={() => { closeSheet(); toast('Connecting your call…', 'phone'); }}><Icon n="phone" s={18} />Call now</button>
    </div>
  );
}

export function ShareSheet() {
  const { st, closeSheet, toast } = useApp();
  const link = 'mobocab.in/track/' + (st.ride ? st.ride.id : '');
  return (
    <>
      <h3>Share your ride</h3>
      <p className="mut small" style={{ lineHeight: 1.5 }}>Friends & family can track your live location till you reach.</p>
      <div className="code" style={{ background: 'var(--bg)', fontSize: 14, letterSpacing: '.3px' }}>
        {link}
        <button className="btn sm dark" onClick={() => copyText('https://' + link, toast)}><Icon n="copy" s={15} />Copy</button>
      </div>
      <div className="opt" style={{ marginTop: 8 }} onClick={() => { closeSheet(); toast('Trip shared with emergency contacts', 'share'); }}>
        <span className="lic"><Icon n="users" s={18} /></span>
        <div className="t"><b>Share with emergency contacts</b><span>Mom, Rahul</span></div>
        <Icon n="right" s={18} />
      </div>
    </>
  );
}

export function SosSheet() {
  const { closeSheet, toast } = useApp();
  const row = (icon, title, sub, msg) => (
    <div className="opt" onClick={() => { closeSheet(); toast(msg, icon); }}>
      <span className="lic"><Icon n={icon} s={18} /></span>
      <div className="t"><b>{title}</b><span>{sub}</span></div>
      <Icon n="right" s={18} />
    </div>
  );
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <span className="lic" style={{ width: 60, height: 60, margin: '6px auto 0', background: '#FDEBE9', color: 'var(--r)' }}><Icon n="shield" s={28} /></span>
        <h3 style={{ marginTop: 12 }}>Emergency help</h3>
        <p className="mut small" style={{ lineHeight: 1.5, margin: '4px 8px 14px' }}>
          Our safety team is available 24x7. In an emergency, call the police helpline <b style={{ color: 'var(--ink)' }}>112</b>.
        </p>
      </div>
      <a className="btn" style={{ background: 'var(--r)', color: '#fff', textDecoration: 'none' }} href="tel:112"><Icon n="phone" s={18} />Call 112 (Police)</a>
      <div style={{ marginTop: 8 }}>
        {row('pin', 'Send live location', 'Alert your emergency contacts instantly', 'Live location sent to emergency contacts')}
        {row('help', 'Talk to MOBO Safety team', 'Get a call back within 60 seconds', 'MOBO safety team will call you shortly')}
      </div>
    </>
  );
}

export function LogoutSheet() {
  const { up, replace, closeSheet } = useApp();
  return (
    <>
      <h3>Log out of MOBO Cab?</h3>
      <p className="mut small" style={{ margin: '4px 0 16px' }}>You'll need to verify your number again to log in.</p>
      <div className="row">
        <button className="btn ghost" onClick={closeSheet}>Stay</button>
        <button className="btn dark" onClick={() => { up({ user: null }); replace('login'); }}>Log out</button>
      </div>
    </>
  );
}

const LANGS = ['English', 'हिन्दी', 'বাংলা', 'తెలుగు', 'தமிழ்', 'ಕನ್ನಡ'];
export function LangSheet() {
  const { closeSheet, toast } = useApp();
  return (
    <>
      <h3>Choose language</h3>
      {LANGS.map((l, i) => <Option key={l} on={i === 0} title={l} onClick={() => { closeSheet(); toast('Language preference saved', 'globe'); }} />)}
    </>
  );
}

export function AddPlaceSheet() {
  const { closeSheet, toast } = useApp();
  return (
    <>
      <h3>Add a place</h3>
      <input className="field" placeholder="Name (e.g. Gym)" />
      <input className="field" placeholder="Full address" />
      <div style={{ height: 16 }} />
      <button className="btn" onClick={() => { closeSheet(); toast('Place saved', 'pin'); }}>Save place</button>
    </>
  );
}
