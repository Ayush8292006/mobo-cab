import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Art, Header, Icon } from '../components/ui';
import { CAPS, COUPONS, PAYS, PKG, pkgPrice } from '../data';
import { DROPS } from '../map/mapBase';
import { AddPlaceSheet } from '../sheets/Sheets';
import { copyText, firstName, initials, otp4, rideId } from '../utils';
import mark from '../assets/mobo-mark.png';

/* ============ Wallet & payments ============ */
const TXNS = [['Parcel to Gaur City Mall', '2 Nov', '− ₹71'], ['Added to wallet', '1 Nov', '+ ₹300'], ['Cashback · MOBO50', '28 Oct', '+ ₹11']];
export function Wallet() {
  const { st, up, toast } = useApp();
  const [amt, setAmt] = useState('');
  const add = () => {
    const a = +amt;
    if (!a) return toast('Enter an amount to add', 'info');
    up((s) => ({ wallet: s.wallet + a }));
    setAmt('');
    return toast(`₹${a} added to your wallet`, 'wallet');
  };
  return (
    <>
      <Header title="Payments" />
      <div className="scroll" style={{ paddingTop: 14 }}>
        <div className="wal"><img src={mark} alt="" /><small>MOBO Wallet balance</small><h2>₹{st.wallet}</h2><p>Use for faster checkout on every ride</p></div>
        <div className="pad">
          <p style={{ fontWeight: 800, marginBottom: 10 }}>Add money</p>
          <label className="amtin">₹<input inputMode="numeric" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, '').slice(0, 5))} /></label>
          <div className="hs" style={{ margin: '10px 0 14px' }}>{[100, 200, 500, 1000].map((a) => <button key={a} className="chip" onClick={() => setAmt(String(a))}>+ ₹{a}</button>)}</div>
          <button className="btn" onClick={add}>Add money</button>
        </div>
        <div className="div" />
        <p style={{ fontWeight: 800, padding: '16px 16px 4px' }}>Payment methods</p>
        {Object.entries(PAYS).map(([k, p]) => (
          <div key={k} className="li" onClick={() => { up({ pay: k }); toast(`${p.n} set as default`); }}>
            <span className="lic"><Icon n={p.i} s={18} /></span>
            <div className="t"><b>{p.n}</b><span>{k === 'wallet' ? `₹${st.wallet} available` : p.d}</span></div>
            {st.pay === k ? <span className="fast">DEFAULT</span> : <Icon n="right" s={18} />}
          </div>
        ))}
        <div className="div" />
        <p style={{ fontWeight: 800, padding: '16px 16px 4px' }}>Recent transactions</p>
        {TXNS.map((t) => (
          <div key={t[0]} className="li">
            <span className="lic"><Icon n={t[2][0] === '+' ? 'plus' : 'receipt'} s={18} /></span>
            <div className="t"><b>{t[0]}</b><span>{t[1]}</span></div>
            <b style={{ color: t[2][0] === '+' ? 'var(--g)' : 'var(--ink)' }}>{t[2]}</b>
          </div>
        ))}
        <div style={{ height: 20 }} />
      </div>
    </>
  );
}

/* ============ Parcel ============ */
const PTYPES = [['doc', 'Documents'], ['food', 'Food'], ['shirt', 'Clothes'], ['laptop', 'Electronics'], ['key', 'Keys'], ['box', 'Others']];
export function Parcel() {
  const { st, up, go } = useApp();
  const [seg, setSeg] = useState('Send');
  const search = (field) => { up(field === 'drop' ? { mode: 'parcel', drop: null } : { mode: 'parcel' }); go('search', { field }); };
  return (
    <>
      <Header title="Parcel" sub="Send or receive within the city" />
      <div className="scroll" style={{ paddingTop: 12 }}>
        <div className="seg">{['Send', 'Receive'].map((x) => <button key={x} className={seg === x ? 'on' : ''} onClick={() => setSeg(x)}>{x}</button>)}</div>
        <div className="pad">
          <div className="sbox" style={{ margin: 0 }}>
            <div className="vline" />
            <div className="srow" onClick={() => search('pickup')}>
              <span className="dot g" />
              <div style={{ flex: 1 }}><p className="small mut" style={{ fontWeight: 700 }}>{seg === 'Send' ? 'Pickup from' : 'Pickup from (sender)'}</p><b>{st.pickup.cur ? 'Current location · Sector 62' : st.pickup.n}</b></div>
            </div>
            <div className="srow" onClick={() => search('drop')}>
              <span className="sq" />
              <div style={{ flex: 1 }}><p className="small mut" style={{ fontWeight: 700 }}>Deliver to</p><b style={{ color: '#A6A6A1' }}>Add delivery location</b></div>
              <Icon n="right" s={16} />
            </div>
          </div>
          <p style={{ fontWeight: 800, margin: '20px 0 10px' }}>What are you sending?</p>
          <div className="ptype">
            {PTYPES.map(([i, t]) => <button key={t} className={st.ptype === t ? 'on' : ''} onClick={() => up({ ptype: t })}><Icon n={i} s={22} w={1.8} />{t}</button>)}
          </div>
          <div className="card" style={{ padding: 14, marginTop: 18, background: 'var(--bg)', border: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 13.5, display: 'flex', gap: 6, alignItems: 'center' }}><Icon n="info" s={16} />Before you send</p>
            <p className="small mut" style={{ lineHeight: 1.6, marginTop: 6 }}>Max weight 10 kg · Fits on a bike · No alcohol, illegal or hazardous items · Pack fragile items properly</p>
          </div>
        </div>
      </div>
      <div className="pad" style={{ borderTop: '1px solid var(--line)' }}><button className="btn" onClick={() => search('drop')}>Add delivery location</button></div>
    </>
  );
}

/* ============ Rentals ============ */
export function Rental() {
  const { st, up, go, replace } = useApp();
  const { v, p } = st.rental;
  const setR = (patch) => up((s) => ({ rental: { ...s.rental, ...patch } }));
  const book = () => {
    const pk = PKG[p], pr = pkgPrice(v, p), c = CAPS[1], km = +pk[1].split(' ')[0];
    const drop = { n: `Rental · ${pk[0]} / ${pk[1]}`, a: '', km, pt: DROPS[3] };
    up({
      veh: v, drop, chat: [],
      ride: {
        id: rideId(), veh: v, from: st.pickup.cur ? 'Sector 62, Noida' : st.pickup.n, to: drop.n, km, fare: pr, disc: 0, total: pr, pay: st.pay,
        cap: { name: c[0], rating: c[1], trips: c[2], plate: 'UP16 DX 7731' }, otp: otp4(), tS: Date.now(),
      },
    });
    replace('searching');
  };
  return (
    <>
      <Header title="Rentals" sub="Keep the vehicle with you for hours" />
      <div className="scroll" style={{ paddingTop: 12 }}>
        <div className="seg">{[['auto', 'Auto'], ['eco', 'Cab Economy'], ['prem', 'Cab Premium']].map(([k, t]) => <button key={k} className={v === k ? 'on' : ''} onClick={() => setR({ v: k })}>{t}</button>)}</div>
        <div style={{ textAlign: 'center', padding: '14px 0 0' }}><Art type={v} width={130} height={86} /></div>
        <div className="pad">
          <p style={{ fontWeight: 800, marginBottom: 10 }}>Choose a package</p>
          {PKG.map((pk, i) => (
            <div key={pk[0]} className={'pkg' + (p === i ? ' on' : '')} onClick={() => setR({ p: i })}>
              <span className="radio" />
              <div className="t"><b>{pk[0]} · {pk[1]}</b><span>Extra ₹{v === 'auto' ? 2 : 3}/min after package</span></div>
              <span className="pr">₹{pkgPrice(v, i).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="li" style={{ padding: '12px 0', borderTop: '1px solid var(--line)', marginTop: 6 }} onClick={() => go('search', { field: 'pickup' })}>
            <span className="dot g" />
            <div className="t"><b>{st.pickup.cur ? 'Current location · Sector 62' : st.pickup.n}</b><span>Pickup point</span></div>
            <Icon n="edit" s={16} />
          </div>
        </div>
      </div>
      <div className="pad" style={{ borderTop: '1px solid var(--line)' }}>
        <button className="btn" onClick={book}>Book {PKG[p][0]} rental · ₹{pkgPrice(v, p).toLocaleString('en-IN')}</button>
      </div>
    </>
  );
}

/* ============ Offers ============ */
export function Offers() {
  const { st, up, back, prevId, toast } = useApp();
  const [code, setCode] = useState('');
  const apply = (c) => {
    if (!COUPONS.find((x) => x.c === c)) return toast('This coupon code is not valid', 'alert');
    up({ coupon: c });
    toast(c + ' applied', 'tag');
    if (prevId === 'route') back();
    return undefined;
  };
  return (
    <>
      <Header title="Offers & coupons" />
      <div className="scroll pad">
        <div className="row" style={{ marginBottom: 16 }}>
          <label className="amtin" style={{ flex: 1, fontSize: 15, height: 48 }}>
            <input placeholder="Enter coupon code" style={{ fontSize: 15, textTransform: 'uppercase' }} value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button className="btn dark sm" style={{ height: 48 }} onClick={() => apply(code.toUpperCase().trim())}>Apply</button>
        </div>
        {COUPONS.map((c) => (
          <div key={c.c} className="coupon">
            <div><span className="cc">{c.c}</span><b>{c.t}</b><span>{c.d}</span></div>
            {st.coupon === c.c
              ? <button className="btn sm ghost" onClick={() => up({ coupon: null })}>Remove</button>
              : <button className="btn sm" onClick={() => apply(c.c)}>Apply</button>}
          </div>
        ))}
      </div>
    </>
  );
}

/* ============ Refer & earn ============ */
export function Refer() {
  const { st, toast } = useApp();
  const code = (firstName(st.user).toUpperCase().replace(/[^A-Z]/g, '') || 'MOBO') + '100';
  return (
    <>
      <Header title="Refer & earn" />
      <div className="scroll" style={{ paddingTop: 12 }}>
        <div className="ref">
          <h2>Invite friends, get ₹100 each</h2>
          <p>Your friend gets 50% off on their first ride. You get ₹100 in your wallet once they ride.</p>
          <div className="code">{code}<button className="btn sm dark" onClick={() => copyText(code, toast)}><Icon n="copy" s={15} />Copy</button></div>
        </div>
        <p style={{ fontWeight: 800, padding: '20px 16px 4px' }}>How it works</p>
        <div className="steps">
          {['Share your code with friends & family', 'They sign up on MOBO Cab and take their first ride', '₹100 lands in your MOBO Wallet instantly'].map((t, i) => <div key={t}><i>{i + 1}</i><p>{t}</p></div>)}
        </div>
        <div className="pad">
          <button className="btn" onClick={() => copyText(`Ride with MOBO Cab! Use my code ${code} to get 50% off your first ride.`, toast)}><Icon n="share" s={18} />Invite friends</button>
        </div>
      </div>
    </>
  );
}

/* ============ Safety ============ */
const FEATS = [
  ['shield', 'Verified captains', 'Every captain is background-verified with KYC, licence and vehicle checks.'],
  ['pin', 'Live ride tracking', 'Share your live location with family. We track every ride from start to end.'],
  ['phone', '24x7 SOS support', 'Reach police (112) or our safety team in one tap during any ride.'],
  ['lock', 'Number masking', 'Your phone number stays private. Calls go through a masked line.'],
  ['users', 'Emergency contacts', 'Add up to 5 trusted contacts to get alerts during your rides.'],
];
export function Safety() {
  const { toast } = useApp();
  return (
    <>
      <Header title="Safety" />
      <div className="scroll">
        {FEATS.map((f) => <div key={f[1]} className="feat"><span className="lic"><Icon n={f[0]} s={20} /></span><div><b>{f[1]}</b><p>{f[2]}</p></div></div>)}
        <div className="pad"><button className="btn dark" onClick={() => toast('Emergency contacts updated', 'users')}><Icon n="plus" s={18} />Add emergency contacts</button></div>
      </div>
    </>
  );
}

/* ============ Help ============ */
const FAQ = [
  ['I was charged more than the estimated fare', 'Final fare can change due to route changes, waiting time or tolls. Open the ride from Activity and tap "Report an issue" — we will review and refund any extra amount within 24 hours.'],
  ['I left an item in the vehicle', 'Go to Activity, open the ride and tap "Report an issue". We will connect you with the captain to get your item back.'],
  ['How do I cancel a ride?', 'Tap "Cancel ride" on the ride screen. Cancellation is free within 2 minutes of booking or if the captain is late.'],
  ['How do I add money to MOBO Wallet?', 'Go to Account → Payments & Wallet, enter the amount and pay using UPI or card.'],
  ['Is my parcel insured?', 'Parcels up to ₹2,000 in value are covered against damage or loss during delivery.'],
];
export function Help() {
  const { toast } = useApp();
  const [open, setOpen] = useState(-1);
  const [q, setQ] = useState('');
  const list = FAQ.filter((f) => !q || f[0].toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <Header title="Help & support" />
      <div className="scroll">
        <div className="pad"><div className="where" style={{ cursor: 'text' }}><Icon n="search" s={20} /><input placeholder="Search for help" style={{ flex: 1, fontWeight: 600 }} value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
        {list.map((f, i) => (
          <div key={f[0]} className={'faq' + (open === i ? ' on' : '')}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>{f[0]}<Icon n="right" s={16} /></button>
            <p>{f[1]}</p>
          </div>
        ))}
        <div className="pad"><button className="btn" onClick={() => toast('Connecting you to a support executive…', 'msg')}><Icon n="msg" s={18} />Chat with support</button></div>
      </div>
    </>
  );
}

/* ============ Saved places ============ */
export function Saved() {
  const { st, openSheet } = useApp();
  return (
    <>
      <Header title="Saved places" />
      <div className="scroll">
        {[['home', st.saved.home], ['work', st.saved.work]].map(([k, p]) => (
          <div key={k} className="li"><span className="lic"><Icon n={k} s={18} /></span><div className="t"><b>{p.n}</b><span>{p.a}</span></div><Icon n="edit" s={16} /></div>
        ))}
        <div className="li" onClick={() => openSheet(<AddPlaceSheet />)}>
          <span className="lic" style={{ background: 'var(--ps)', color: 'var(--p)' }}><Icon n="plus" s={18} /></span>
          <div className="t"><b>Add new place</b><span>Gym, college, friend's house…</span></div>
        </div>
      </div>
    </>
  );
}

/* ============ Edit profile ============ */
export function Profile() {
  const { st, up, back, toast } = useApp();
  const u = st.user || { name: '', phone: '', email: '' };
  const [name, setName] = useState(u.name);
  const [email, setEmail] = useState(u.email || '');
  const [g, setG] = useState(u.g || '');
  const save = () => {
    up((s) => ({ user: { ...s.user, name: name.trim() || s.user.name, email: email.trim(), g } }));
    back();
    toast('Profile updated');
  };
  const L = ({ children }) => <label className="small mut" style={{ fontWeight: 700, display: 'block', marginTop: 14 }}>{children}</label>;
  return (
    <>
      <Header title="Edit profile" />
      <div className="scroll pad">
        <div className="av" style={{ width: 80, height: 80, fontSize: 28, margin: '6px auto 10px', background: 'var(--p)', color: '#fff' }}>{initials(name || 'G')}</div>
        <L>Full name</L><input className="field" style={{ marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} />
        <L>Mobile number</L><input className="field" style={{ marginTop: 6, color: 'var(--mut)' }} value={`+91 ${u.phone}`} disabled />
        <L>Email</L><input className="field" style={{ marginTop: 6 }} value={email} placeholder="Add email for invoices" onChange={(e) => setEmail(e.target.value)} />
        <L>Gender</L>
        <div className="hs" style={{ marginTop: 8 }}>{['Male', 'Female', 'Other'].map((x) => <button key={x} className={'chip' + (g === x ? ' on' : '')} onClick={() => setG(x)}>{x}</button>)}</div>
      </div>
      <div className="pad" style={{ borderTop: '1px solid var(--line)' }}><button className="btn" onClick={save}>Save changes</button></div>
    </>
  );
}

/* ============ Notifications ============ */
const NOTIFS = [
  ['tag', '50% off on your next 3 rides', 'Use code MOBO50 and save up to ₹50 on every ride this week.', '2 hours ago', true],
  ['shield', 'Safety tip', 'Always match the vehicle number and OTP before starting your ride.', 'Today, 9:00 am', true],
  ['receipt', 'Payment successful', '₹71 paid via MOBO Wallet for your parcel to Gaur City Mall.', '2 Nov', false],
  ['gift', 'Your friend joined MOBO!', 'You will get ₹100 once they complete their first ride.', '30 Oct', false],
];
export function Notifications() {
  return (
    <>
      <Header title="Notifications" />
      <div className="scroll">
        {NOTIFS.map((n) => (
          <div key={n[1]} className={'notif' + (n[4] ? ' new' : '')}>
            <span className="lic"><Icon n={n[0]} s={18} /></span>
            <div><b>{n[1]}</b><p>{n[2]}</p><small>{n[3]}</small></div>
          </div>
        ))}
      </div>
    </>
  );
}

