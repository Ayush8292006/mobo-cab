import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Art, Avatar, BackButton, Icon, Star, TripCard } from '../components/ui';
import MapView from '../map/MapView';
import { APPROACH_D, routeD } from '../map/mapBase';
import { CAPS, COUPONS, PAYS, T_APPROACH, T_SEARCH, T_TRIP, T_WAIT, VEH, discFor, fare } from '../data';
import { CallSheet, CancelSheet, FareInfoSheet, PaySheet, ShareSheet, SosSheet } from '../sheets/Sheets';
import { inMin, initials, otp4, pick, rideId, short, tFmt, tripKm, tripMin } from '../utils';

const pickTxt = (st) => 'Pickup · ' + short(st.pickup.cur ? 'You' : st.pickup.n, 12);

/* ============ Choose a ride ============ */
export function Route() {
  const { st, up, go, replace, openSheet, toast } = useApp();
  if (!st.drop) return null;
  const km = tripKm(st.pickup, st.drop);
  const list = st.mode === 'parcel' ? ['parcel'] : ['bike', 'auto', 'eco', 'prem'];
  const veh = list.includes(st.veh) ? st.veh : list[0];
  const pay = PAYS[st.pay];
  const coupon = COUPONS.find((x) => x.c === st.coupon);
  const f = fare(veh, km);
  const ds = discFor(st.coupon, veh, f);

  const book = () => {
    if (st.pay === 'wallet' && st.wallet < f - ds) return toast('Low wallet balance. Add money or change payment', 'alert');
    const c = pick(CAPS);
    up({
      veh, chat: [],
      ride: {
        id: rideId(), veh, from: st.pickup.cur ? 'Sector 62, Noida' : st.pickup.n, to: st.drop.n, km, fare: f, disc: ds, total: f - ds, pay: st.pay,
        cap: { name: c[0], rating: c[1], trips: c[2], plate: `UP16 ${pick([...'BCDKMR'])}X ${1000 + Math.floor(Math.random() * 9000)}` },
        otp: otp4(), tS: Date.now(),
      },
    });
    replace('searching');
    return undefined;
  };

  return (
    <>
      <MapView mode="route" dropPt={st.drop.pt} pickTxt={pickTxt(st)} dropTxt={short(st.drop.n, 20)} />
      <BackButton floating />
      <div className="mtop" onClick={() => go('search', { field: 'drop' })}>
        <div><span className="dot g" style={{ width: 8, height: 8 }} /><span>{st.pickup.cur ? 'Current location' : st.pickup.n}</span></div>
        <div><span className="sq" style={{ width: 8, height: 8 }} /><span>{st.drop.n}</span></div>
      </div>
      <div className="panel">
        <div className="grab" />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="ptitle">{st.mode === 'parcel' ? 'Send a parcel' : 'Choose a ride'}</p>
            <p className="small mut" style={{ marginTop: 2 }}>{km} km · about {tripMin(km)} min trip</p>
          </div>
          <button className="chip" onClick={() => openSheet(<FareInfoSheet />)}><Icon n="info" s={15} />Fare info</button>
        </div>
        <div className="vlist">
          {list.map((k) => {
            const V = VEH[k], F = fare(k, km), D = discFor(st.coupon, k, F);
            return (
              <div key={k} className={'veh' + (k === veh ? ' on' : '')} onClick={() => up({ veh: k })}>
                <Art type={k} />
                <div className="t">
                  <b>{V.n} {V.seats > 0 && <small><Icon n="seat" s={11} />{V.seats}</small>} {k === 'bike' && <span className="fast">FASTEST</span>}</b>
                  <span>{V.eta} min away · Drop {inMin(V.eta + tripMin(km))}</span>
                </div>
                <div className="p"><b>₹{F - D}</b>{D > 0 && <s>₹{F}</s>}</div>
              </div>
            );
          })}
        </div>
        <div className="payrow">
          <button onClick={() => openSheet(<PaySheet />)}><Icon n={pay.i} s={18} />{pay.n}<Icon n="down" s={14} /></button>
          <button onClick={() => go('offers')} className={ds ? 'ok' : ''}>
            <Icon n="tag" s={18} />{coupon ? (ds ? `${coupon.c} applied` : `${coupon.c} · not valid`) : 'Offers'}<Icon n="right" s={14} />
          </button>
        </div>
        <button className="btn" onClick={book}>{VEH[veh].cta}{ds ? ` · ₹${f - ds}` : ''}</button>
      </div>
    </>
  );
}
Route.map = true;

/* ============ Finding captain ============ */
const SEARCH_MSGS = ['Connecting you to nearby captains…', 'Found 6 captains near you', 'Waiting for a captain to accept…'];
export function Searching() {
  const { st, up, replace, openSheet } = useApp();
  const r = st.ride;
  const [msg, setMsg] = useState(0);
  useEffect(() => {
    if (!r) return undefined;
    const el = Date.now() - r.tS;
    const timers = SEARCH_MSGS.map((_, i) => setTimeout(() => setMsg(i), Math.max(0, i * 1500 - el)));
    timers.push(setTimeout(() => { up((s) => ({ ride: s.ride && { ...s.ride, tA: Date.now() } })); replace('assigned'); }, Math.max(0, T_SEARCH - el)));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!r) return null;
  return (
    <>
      <MapView mode="searching" dropPt={st.drop.pt} pickTxt={pickTxt(st)} dropTxt={short(st.drop.n, 20)} />
      <div className="panel">
        <div className="grab" />
        <div className="row">
          <div style={{ flex: 1 }}><p className="ptitle">Finding your captain</p><p className="small mut" style={{ marginTop: 3 }}>{SEARCH_MSGS[msg]}</p></div>
          <Art type={r.veh} width={60} height={40} />
        </div>
        <div className="prog"><i /></div>
        <TripCard ride={r} coupon={st.coupon} />
        <button className="txtbtn" style={{ marginTop: 6 }} onClick={() => openSheet(<CancelSheet />)}>Cancel ride</button>
      </div>
    </>
  );
}
Searching.map = true;

/* ============ Captain assigned & arriving ============ */
export function Assigned() {
  const { st, up, go, replace, openSheet, toast } = useApp();
  const r = st.ride;
  const [arrived, setArrived] = useState(() => r && Date.now() - r.tA >= T_APPROACH);
  const etaRef = useRef(null);

  useEffect(() => {
    if (!r) return undefined;
    const el = Date.now() - r.tA;
    const start = () => {
      up((s) => ({ ride: s.ride && { ...s.ride, tT: Date.now() } }));
      replace('trip');
      setTimeout(() => toast('OTP verified · Ride started', 'check'), 400);
    };
    if (el >= T_APPROACH + T_WAIT) { start(); return undefined; }
    const timers = [];
    if (el < T_APPROACH) timers.push(setTimeout(() => toast(`${r.cap.name.split(' ')[0]} has arrived at pickup`, 'pin'), T_APPROACH - el));
    timers.push(setTimeout(start, T_APPROACH + T_WAIT - el));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!r) return null;
  const v = VEH[r.veh];
  const run = {
    key: 'approach-' + r.tA, d: APPROACH_D, t0: r.tA, ms: T_APPROACH, type: r.veh,
    onTick: (k) => { if (etaRef.current && k < 1) etaRef.current.textContent = `Arriving in ${Math.max(1, Math.ceil((1 - k) * (v.eta + 1)))} min · ${r.cap.plate}`; },
    onDone: () => setArrived(true),
  };

  return (
    <>
      <MapView mode="live" dropPt={st.drop.pt} pickTxt={pickTxt(st)} dropTxt={short(st.drop.n, 20)} run={run} />
      <div className="panel" style={{ maxHeight: '58%', overflowY: 'auto' }}>
        <div className="status">
          <div>
            <b>{arrived ? 'Captain has arrived' : 'Captain is on the way'}</b>
            <span ref={etaRef}>{arrived ? 'Share the OTP with your captain to start' : `Arriving in ${v.eta + 1} min`}</span>
          </div>
          <div className="otpbox"><small>OTP</small><b>{r.otp}</b></div>
        </div>
        <div className="cap">
          <div className="av">{initials(r.cap.name)}<span className="rt"><Star s={9} fill="#141414" />{r.cap.rating}</span></div>
          <div><b style={{ fontSize: 16 }}>{r.cap.name}</b><p className="small mut" style={{ marginTop: 2 }}>{r.cap.trips} rides · {v.n}</p></div>
          <div className="plate"><b>{r.cap.plate}</b><span>{v.model}</span></div>
        </div>
        <div className="acts">
          <button onClick={() => openSheet(<CallSheet />)}><i><Icon n="phone" s={19} /></i>Call</button>
          <button onClick={() => go('chat')}><i><Icon n="msg" s={19} /></i>Chat</button>
          <button onClick={() => openSheet(<ShareSheet />)}><i><Icon n="share" s={19} /></i>Share ride</button>
          <button className="sos" onClick={() => openSheet(<SosSheet />)}><i><Icon n="shield" s={19} /></i>Safety</button>
        </div>
        <TripCard ride={r} coupon={st.coupon} />
        <button className="txtbtn" onClick={() => openSheet(<CancelSheet captainOnWay />)}>Cancel ride</button>
      </div>
    </>
  );
}
Assigned.map = true;

/* ============ On trip ============ */
export function Trip() {
  const { st, up, go, replace, openSheet } = useApp();
  const r = st.ride;
  const barRef = useRef(null);
  const etaRef = useRef(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    up((s) => {
      const ride = s.ride;
      const done = { ...ride, when: 'Today, ' + tFmt(new Date()), status: 'Completed' };
      return {
        ride: done,
        wallet: ride.pay === 'wallet' ? s.wallet - ride.total : s.wallet,
        coins: s.coins + Math.round(ride.total / 10),
        coupon: ride.disc ? null : s.coupon,
        rides: [{ ...done, cap: ride.cap.name, rate: 0 }, ...s.rides],
      };
    });
    replace('done');
  };

  useEffect(() => {
    if (r && Date.now() - r.tT >= T_TRIP) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!r) return null;
  const m = tripMin(r.km);
  const run = {
    key: 'trip-' + r.tT, d: routeD(st.drop.pt), t0: r.tT, ms: T_TRIP, type: r.veh,
    onTick: (k) => {
      if (barRef.current) barRef.current.style.width = k * 100 + '%';
      if (etaRef.current && k < 1) { const left = Math.max(1, Math.ceil((1 - k) * m)); etaRef.current.textContent = `Reaching in ${left} min · ${inMin(left)}`; }
    },
    onDone: () => setTimeout(finish, 700),
  };

  return (
    <>
      <MapView mode="live" dropPt={st.drop.pt} pickTxt={pickTxt(st)} dropTxt={short(st.drop.n, 20)} run={run} />
      <button className="sosf" onClick={() => openSheet(<SosSheet />)}><Icon n="shield" s={15} />SOS</button>
      <div className="panel">
        <div className="status">
          <div><b>Heading to {short(r.to, 22)}</b><span ref={etaRef}>Reaching in {m} min · {inMin(m)}</span></div>
          <Icon n="pin" s={22} />
        </div>
        <div className="prog det"><i ref={barRef} /></div>
        <div className="cap">
          <Avatar text={initials(r.cap.name)} style={{ width: 44, height: 44, fontSize: 15 }} />
          <div style={{ flex: 1 }}><b style={{ fontSize: 15 }}>{r.cap.name}</b><p className="small mut">{r.cap.plate} · {VEH[r.veh].model}</p></div>
          <button className="round" style={{ boxShadow: 'none', background: 'var(--bg)' }} onClick={() => go('chat')}><Icon n="msg" s={18} /></button>
          <button className="round" style={{ boxShadow: 'none', background: 'var(--bg)' }} onClick={() => openSheet(<CallSheet />)}><Icon n="phone" s={18} /></button>
        </div>
        <div className="row" style={{ margin: '14px 0 4px', gap: 10 }}>
          <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => openSheet(<ShareSheet />)}><Icon n="share" s={16} />Share trip status</button>
          <button className="btn ghost sm" style={{ flex: 1 }}><Icon n={PAYS[r.pay].i} s={16} />{PAYS[r.pay].n} · ₹{r.total}</button>
        </div>
      </div>
    </>
  );
}
Trip.map = true;

/* ============ Ride complete ============ */
const GOOD = ['Polite captain', 'Safe driving', 'Clean vehicle', 'On time', 'Smooth ride'];
const BAD = ['Rash driving', 'Late pickup', 'Rude behaviour', 'Wrong route', 'Vehicle not clean'];
const RATE_TXT = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent!'];

export function Done() {
  const { st, up, tab, toast } = useApp();
  const [rate, setRate] = useState(0);
  const [tip, setTip] = useState(0);
  const [tags, setTags] = useState([]);
  const r = st.ride;
  if (!r) return null;
  const tax = Math.round(r.fare * 0.05);
  const first = r.cap.name.split(' ')[0];
  const coins = Math.round(r.total / 10);

  const submit = () => {
    tab('home');
    up((s) => ({ rides: s.rides.map((x, i) => (i === 0 ? { ...x, rate } : x)), ride: null, drop: null }));
    setTimeout(() => toast(rate ? `Thanks for rating${tip ? ' & tipping ₹' + tip : ''}!` : 'Thanks for riding with MOBO', 'heart'), 300);
  };

  return (
    <>
      <div className="scroll">
        <div className="done-top">
          <div className="tick"><Icon n="check" s={32} w={3} /></div>
          <h2>You've reached your destination</h2>
          <p>{r.to}</p>
          <div className="amt">₹{r.total}</div>
          <span className="pm"><Icon n={PAYS[r.pay].i} s={14} />{r.pay === 'cash' ? `Please pay ₹${r.total} in cash to captain` : `Paid via ${PAYS[r.pay].n}`}</span>
        </div>
        <div className="pad">
          <div className="bd">
            <div><span className="mut">Ride fare ({r.km} km)</span><span>₹{r.fare - tax}</span></div>
            <div><span className="mut">Taxes & fees</span><span>₹{tax}</span></div>
            {r.disc > 0 && <div><span className="gr">Discount</span><span className="gr">− ₹{r.disc}</span></div>}
            <div className="t"><span>Total</span><span>₹{r.total}</span></div>
          </div>
          <p className="small" style={{ background: 'var(--y2)', padding: '10px 12px', borderRadius: 10, marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
            <Icon n="coin" s={16} />You earned {coins} MOBO Coins on this ride
          </p>
        </div>
        <div className="div" />
        <div className="pad" style={{ textAlign: 'center' }}>
          <Avatar text={initials(r.cap.name)} style={{ margin: '4px auto 0' }} />
          <p style={{ fontWeight: 800, fontSize: 16, marginTop: 12 }}>How was your ride with {first}?</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => { setRate(i); setTags([]); }}><Star s={36} fill={i <= rate ? '#D4A537' : 'none'} /></button>
            ))}
          </div>
          {rate > 0 && (
            <>
              <p className="small mut" style={{ marginBottom: 10 }}>{RATE_TXT[rate]}</p>
              <div className="tags">
                {(rate >= 4 ? GOOD : BAD).map((t) => (
                  <button key={t} className={'chip' + (tags.includes(t) ? ' on' : '')}
                    onClick={() => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}>{t}</button>
                ))}
              </div>
            </>
          )}
          <p style={{ fontWeight: 800, marginTop: 20, textAlign: 'left' }}>Add a tip for your captain</p>
          <p className="small mut" style={{ textAlign: 'left', marginTop: 2 }}>100% of the tip goes to {first}</p>
          <div className="hs" style={{ marginTop: 10 }}>
            {[10, 20, 30, 50].map((t) => (
              <button key={t} className={'chip' + (tip === t ? ' on' : '')} onClick={() => setTip(tip === t ? 0 : t)}>₹{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="pad" style={{ borderTop: '1px solid var(--line)' }}><button className="btn" onClick={submit}>Done</button></div>
    </>
  );
}

/* ============ Chat with captain ============ */
const QUICK = ['I am at the pickup point', 'Please come fast', 'Where are you?', 'Call me when you arrive'];
const REPLIES = {
  'I am at the pickup point': 'Ok ji, bas 2 minute mein pahunch raha hoon',
  'Please come fast': 'Ji haan, traffic thoda hai, jaldi aa raha hoon',
  'Where are you?': 'Main main road pe hoon, bas aa gaya',
  'Call me when you arrive': 'Theek hai, pahunch ke call karta hoon',
};
export function Chat() {
  const { st, up, openSheet } = useApp();
  const [text, setText] = useState('');
  const box = useRef(null);
  const r = st.ride;

  useEffect(() => {
    if (r && !st.chat.length) up({ chat: [{ s: 'sys', t: 'Chats are monitored for your safety' }, { s: 'cp', t: 'Namaste, main aapki pickup location pe aa raha hoon 🙏', tm: tFmt(new Date()) }] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [st.chat.length]);

  if (!r) return null;
  const add = (m) => up((s) => ({ chat: [...s.chat, m] }));
  const send = (t) => {
    t = (t || text).trim();
    if (!t) return;
    setText('');
    add({ s: 'me', t, tm: tFmt(new Date()) });
    setTimeout(() => add({ s: 'cp', t: REPLIES[t] || 'Ok ji 👍', tm: tFmt(new Date()) }), 1300);
  };

  return (
    <>
      <div className="hdr line">
        <BackButton />
        <Avatar text={initials(r.cap.name)} style={{ width: 38, height: 38, fontSize: 13 }} />
        <div style={{ flex: 1 }}><b style={{ fontSize: 15 }}>{r.cap.name}</b><p className="small mut">{r.cap.plate} · {VEH[r.veh].n}</p></div>
        <button className="ib" onClick={() => openSheet(<CallSheet />)}><Icon n="phone" s={20} /></button>
      </div>
      <div className="chat" ref={box}>
        {st.chat.map((m, i) => (m.s === 'sys'
          ? <div key={i} className="sysm"><Icon n="lock" s={12} />{m.t}</div>
          : <div key={i} className={'msg ' + m.s}>{m.t}<small>{m.tm}</small></div>))}
      </div>
      <div className="qr">{QUICK.map((q) => <button key={q} className="chip" onClick={() => send(q)}>{q}</button>)}</div>
      <div className="cin">
        <input placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={() => send()}><Icon n="send" s={19} /></button>
      </div>
    </>
  );
}
