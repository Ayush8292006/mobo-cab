import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Art, BackButton, Icon } from '../components/ui';
import mark from '../assets/mobo-mark.png';

const SPLASH_MS = 2200;

export function Splash() {
  const { st, tab, replace } = useApp();
  useEffect(() => {
    const t = setTimeout(() => (st.user ? tab('home') : replace('login')), SPLASH_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="sp-center">
        <img src={mark} alt="MOBO Cab" />
        <div className="sp-word">MOBO <span>Cab</span></div>
      </div>
      <div className="sp-foot">
        <div className="sp-bar" />
        <p>GO ANYWHERE</p>
      </div>
    </>
  );
}
Splash.cls = 'splash';

export function Login() {
  const { up, go } = useApp();
  const [ph, setPh] = useState('');
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current && ref.current.focus(), 350); return () => clearTimeout(t); }, []);
  const ok = ph.length === 10;
  const next = () => { if (!ok) return; up({ phone: ph }); go('otp'); };
  return (
    <>
      <div className="auth-top">
        <img src={mark} alt="" />
        <h2>Bike, Auto & Cab rides.<br /><em>Anywhere, anytime.</em></h2>
        <p>Lowest fares in town, verified captains and rides that reach you in minutes.</p>
        <div className="auth-veh">
          {[['bike', 'Bike'], ['auto', 'Auto'], ['eco', 'Cab'], ['parcel', 'Parcel']].map(([t, l]) => <div key={t}><Art type={t} />{l}</div>)}
        </div>
      </div>
      <div className="auth-body">
        <h3>Enter your mobile number</h3>
        <p className="mut small" style={{ marginTop: 4 }}>We'll send you a verification code</p>
        <label className="phin">
          <span className="cc"><span className="flag" />+91</span>
          <input ref={ref} inputMode="numeric" maxLength={10} placeholder="98765 43210" value={ph}
            onChange={(e) => setPh(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && next()} />
        </label>
        <div style={{ flex: 1 }} />
        <button className="btn" disabled={!ok} onClick={next}>Continue</button>
        <p className="terms">By continuing, you agree to MOBO Cab's <u>Terms of Service</u> and <u>Privacy Policy</u></p>
      </div>
    </>
  );
}

export function Otp() {
  const { st, back, go, tab } = useApp();
  const [code, setCode] = useState(['', '', '', '']);
  const [auto, setAuto] = useState(true);
  const [secs, setSecs] = useState(25);
  const [busy, setBusy] = useState(false);
  const refs = useRef([]);
  const busyRef = useRef(false);
  const phone = st.phone;

  const verify = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setTimeout(() => (st.user && st.user.phone === phone ? tab('home') : go('name')), 700);
  };

  // simulate SMS auto-read
  useEffect(() => {
    refs.current[0] && refs.current[0].focus();
    const otp = String(1000 + Math.floor(Math.random() * 9000));
    const timers = [];
    timers.push(setTimeout(() => {
      [0, 1, 2, 3].forEach((i) => timers.push(setTimeout(() => {
        setCode((c) => { const n = c.slice(); n[i] = otp[i]; return n; });
        if (i === 3) { setAuto(false); timers.push(setTimeout(verify, 600)); }
      }, i * 160)));
    }, 1700));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secs <= 0) return undefined;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const onDigit = (i, v) => {
    v = v.replace(/\D/g, '').slice(-1);
    const n = code.slice(); n[i] = v; setCode(n);
    if (v && i < 3) refs.current[i + 1].focus();
    if (n.join('').length === 4) setTimeout(verify, 350);
  };
  const full = code.join('').length === 4;

  return (
    <>
      <div className="hdr"><BackButton /></div>
      <div className="auth-body" style={{ paddingTop: 6 }}>
        <h3>Verify your number</h3>
        <p className="mut" style={{ marginTop: 6 }}>
          Enter the 4-digit code sent to <b style={{ color: 'var(--ink)' }}>+91 {phone.slice(0, 5)} {phone.slice(5)}</b>{' '}
          <a style={{ fontWeight: 800, color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer' }} onClick={back}>Edit</a>
        </p>
        <div className="otp">
          {code.map((d, i) => (
            <input key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" maxLength={1} value={d} className={d ? 'f' : ''}
              onChange={(e) => onDigit(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1].focus(); }} />
          ))}
        </div>
        <div className="autor">{auto ? <><span className="spin" />Auto-reading OTP from SMS…</> : <><Icon n="check" s={16} /> OTP auto-filled</>}</div>
        <p className="mut small" style={{ marginTop: 16 }}>
          {secs > 0 ? <>Resend code in <b>0:{String(secs).padStart(2, '0')}</b></> : <>Didn't get it? <b style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setSecs(25)}>Resend code</b></>}
        </p>
        <div style={{ flex: 1 }} />
        <button className="btn" disabled={!full || busy} onClick={verify}>{busy ? <span className="spin" /> : 'Verify'}</button>
      </div>
    </>
  );
}

export function Name() {
  const { st, up, tab, toast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const ok = name.trim().length > 1;
  const save = () => {
    if (!ok) return;
    const n = name.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    up({ user: { name: n, phone: st.phone, email: email.trim() } });
    tab('home');
    setTimeout(() => toast(`Welcome to MOBO Cab, ${n.split(' ')[0]}!`, 'heart'), 300);
  };
  return (
    <>
      <div className="hdr"><BackButton /></div>
      <div className="auth-body" style={{ paddingTop: 6 }}>
        <h3>What should we call you?</h3>
        <p className="mut" style={{ marginTop: 6 }}>Your captain will see this name</p>
        <input className="field" autoFocus placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        <input className="field" placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ flex: 1 }} />
        <button className="btn" disabled={!ok} onClick={save}>Let's go</button>
      </div>
    </>
  );
}
