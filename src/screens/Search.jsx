import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackButton, Icon } from '../components/ui';
import { CURRENT_LOCATION, PLACES, withPoint } from '../data';

export default function Search({ params }) {
  const { st, up, go, back, replace, prevId, toast } = useApp();
  const [field, setField] = useState((params && params.field) || 'drop');
  const [pu, setPu] = useState(st.pickup.cur ? 'Current location' : st.pickup.n);
  const [dr, setDr] = useState(st.drop ? st.drop.n : '');
  const puRef = useRef(null);
  const drRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { const el = field === 'pickup' ? puRef.current : drRef.current; el && el.focus(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = (field === 'pickup' ? pu : dr).toLowerCase().trim();
  const query = q === 'current location' ? '' : q;
  const list = useMemo(() => PLACES.filter((p) => !query || (p.n + ' ' + p.a).toLowerCase().includes(query)), [query]);

  const choose = (place, savedKey) => {
    if (field === 'pickup') {
      const pickup = place.cur ? CURRENT_LOCATION : { ...place, cur: false };
      up({ pickup });
      setPu(place.cur ? 'Current location' : place.n);
      if (prevId === 'rental' || prevId === 'parcel') return back();
      if (st.drop) return go('route');
      setField('drop');
      drRef.current && drRef.current.focus();
      return undefined;
    }
    up((s) => ({ drop: withPoint(place, savedKey), veh: s.mode === 'parcel' ? 'parcel' : s.veh === 'parcel' ? 'bike' : s.veh }));
    replace('route', { drop: ['search', 'route'] });
    return undefined;
  };

  const swap = () => {
    if (!st.drop) return toast('Add a drop location first', 'info');
    const a = st.pickup, b = st.drop;
    const newPickup = { n: b.n, a: b.a, km: b.km, cur: false };
    const newDrop = a.cur ? { n: 'Sector 62, Noida', a: a.a, km: 0, pt: (b.pt) } : withPoint(a);
    up({ pickup: newPickup, drop: newDrop });
    setPu(newPickup.n); setDr(newDrop.n);
    return toast('Locations swapped', 'swap');
  };

  const title = st.mode === 'parcel' ? 'Where to deliver?' : field === 'pickup' ? 'Choose pickup' : 'Where to?';

  return (
    <>
      <div className="hdr"><BackButton /><h1>{title}</h1></div>
      <div className="sbox">
        <div className="vline" />
        <div className="srow">
          <span className="dot g" />
          <input ref={puRef} placeholder="Pickup location" value={pu}
            onFocus={(e) => { setField('pickup'); e.target.select(); }} onChange={(e) => setPu(e.target.value)} />
        </div>
        <div className="srow">
          <span className="sq" />
          <input ref={drRef} placeholder={st.mode === 'parcel' ? 'Enter delivery location' : 'Where are you going?'} value={dr}
            onFocus={() => setField('drop')} onChange={(e) => setDr(e.target.value)} />
        </div>
        <button className="swap" onClick={swap}><Icon n="swap" s={16} /></button>
      </div>
      <div className="hs" style={{ padding: '6px 16px 10px' }}>
        <button className="chip" onClick={() => choose(st.saved.home, 'home')}><Icon n="home" s={15} />Home</button>
        <button className="chip" onClick={() => choose(st.saved.work, 'work')}><Icon n="work" s={15} />Work</button>
        <button className="chip" onClick={() => go('saved')}><Icon n="plus" s={15} />Add place</button>
      </div>
      <div className="div" />
      <div className="scroll">
        {field === 'pickup' && (
          <div className="li" onClick={() => choose(CURRENT_LOCATION)}>
            <span className="lic" style={{ background: '#EAF1FE', color: '#2F6FEB' }}><Icon n="locate" s={18} /></span>
            <div className="t"><b>Use current location</b><span>Sector 62, Noida, Uttar Pradesh</span></div>
          </div>
        )}
        {!query && field === 'drop' && (
          <p style={{ padding: '14px 16px 4px', fontSize: 12, fontWeight: 800, color: 'var(--mut2)', letterSpacing: '.6px' }}>RECENT & POPULAR</p>
        )}
        {list.map((p) => (
          <div className="li" key={p.n} onClick={() => choose(p)}>
            <span className="lic"><Icon n={query ? 'pin' : 'clock'} s={18} /></span>
            <div className="t"><b>{p.n}</b><span>{p.a}</span></div>
            <span className="small mut" style={{ fontWeight: 700 }}>{p.km} km</span>
          </div>
        ))}
        {!list.length && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }} className="mut">
            <Icon n="search" s={32} w={1.5} />
            <p style={{ marginTop: 10, fontWeight: 700 }}>No places found for "{field === 'pickup' ? pu : dr}"</p>
            <p className="small" style={{ marginTop: 4 }}>Try a landmark, area or metro station</p>
          </div>
        )}
      </div>
    </>
  );
}
