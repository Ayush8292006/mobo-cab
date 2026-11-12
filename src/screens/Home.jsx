import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Art, Icon } from '../components/ui';
import MapView from '../map/MapView';
import { PLACES, VEH, withPoint } from '../data';
import { firstName, greet, initials } from '../utils';

const OFFERS = [
  { cls: 'o1', title: '50% off on your next 3 rides', sub: 'Up to ₹50 off on every ride', code: 'MOBO50', art: 'eco', to: 'offers' },
  { cls: 'o2', title: 'Parcel anything across the city', sub: 'Starting at just ₹25', code: 'PARCEL15', art: 'parcel', to: 'parcel', light: true },
  { cls: 'o3', title: '₹75 off on Cab rides', sub: 'On Cab Economy & Premium above ₹299', code: 'CAB75', art: 'bike', to: 'offers' },
];

export default function Home() {
  const { st, up, go, tab, toast } = useApp();
  const [slide, setSlide] = useState(0);
  const [mapKey, setMapKey] = useState(0);
  const ofs = useRef(null);
  const u = st.user || { name: 'Guest' };

  // auto-play offers carousel
  useEffect(() => {
    const t = setInterval(() => {
      const el = ofs.current;
      if (!el) return;
      const w = el.firstElementChild.offsetWidth + 12;
      const next = (Math.round(el.scrollLeft / w) + 1) % OFFERS.length;
      el.scrollTo({ left: next * w, behavior: 'smooth' });
    }, 3800);
    return () => clearInterval(t);
  }, []);
  const onScroll = () => {
    const el = ofs.current;
    if (el) setSlide(Math.round(el.scrollLeft / (el.firstElementChild.offsetWidth + 12)));
  };

  const search = (field) => { up({ mode: 'ride' }); go('search', { field }); };
  const quick = (v) => { up({ mode: 'ride', veh: v }); go('search', { field: 'drop' }); };
  const toPlace = (p, key) => { up({ mode: 'ride', drop: withPoint(p, key), veh: st.veh === 'parcel' ? 'bike' : st.veh }); go('route'); };

  const Tile = ({ v, cls, sub, badge }) => (
    <div className={`tl ${cls}`} onClick={() => quick(v)}>
      {badge && <span className="bd2">{badge}</span>}
      <div><b>{VEH[v].n}</b><span>{sub}</span></div>
      <span className="pr">from ₹{VEH[v].base + VEH[v].km}</span>
      <Art type={v} />
    </div>
  );

  return (
    <>
      <MapView key={mapKey} mode="home" />
      <div className="htop-fade" />
      <div className="home-top">
        <button className="avbtn" onClick={() => tab('account')}>{initials(u.name)}</button>
        <div className="locchip" onClick={() => search('pickup')}>
          <span className="dot g" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <small>Pickup from</small>
            <b>{st.pickup.cur ? 'Current location · ' : ''}{st.pickup.n}</b>
          </div>
          <Icon n="down" s={16} />
        </div>
        <button className="round" onClick={() => go('notifications')}><Icon n="bell" s={20} /><i className="badge" /></button>
      </div>
      <button className="round locate" style={{ top: 'calc(42% - 58px)' }} onClick={() => { setMapKey((k) => k + 1); toast('Location updated', 'locate'); }}>
        <Icon n="locate" s={20} />
      </button>

      <div className="hsheet">
        <div className="grab" />
        <div className="hello">
          <div><p>Good {greet()}, {firstName(st.user)}</p><h2>Where to today?</h2></div>
          <button className="coins" onClick={() => go('wallet')}><Icon n="coin" s={16} />{st.coins}</button>
        </div>

        <div className="where2" onClick={() => search('drop')}>
          <span className="wd"><Icon n="search" s={17} w={2.4} /></span>
          <b>Search destination</b>
          <span className="now" onClick={(e) => { e.stopPropagation(); toast('Scheduled rides are coming soon', 'cal'); }}>
            <Icon n="clock" s={15} />Now<Icon n="down" s={13} />
          </span>
        </div>

        <div className="qchips">
          <div className="qc" onClick={() => toPlace(st.saved.home, 'home')}><i><Icon n="home" s={15} /></i>Home</div>
          <div className="qc" onClick={() => toPlace(st.saved.work, 'work')}><i><Icon n="work" s={15} /></i>Work</div>
          <div className="qc" onClick={() => go('saved')}><i><Icon n="plus" s={15} /></i>Add place</div>
        </div>

        <div className="recent2">
          {PLACES.slice(0, 2).map((p) => (
            <div className="li" key={p.n} onClick={() => toPlace(p)}>
              <span className="lic"><Icon n="clock" s={18} /></span>
              <div className="t"><b>{p.n}</b><span>{p.a}</span></div>
              <Icon n="right" s={18} />
            </div>
          ))}
        </div>

        <div className="sec-h" style={{ marginTop: 14 }}>Ride with MOBO <a onClick={() => tab('services')}>All services</a></div>
        <div className="tiles2">
          <Tile v="bike" cls="t-bike" sub="Beat the traffic" badge="FASTEST" />
          <Tile v="auto" cls="t-auto" sub="No bargaining" />
          <Tile v="eco" cls="t-eco" sub="AC cab rides" />
          <Tile v="prem" cls="t-prem" sub="Top-rated sedans" />
          <div className="tl wd2 t-parcel" onClick={() => go('parcel')}><div><b>Parcel</b><span>Send anything</span></div><Art type="parcel" /></div>
          <div className="tl wd2 t-rent" onClick={() => go('rental')}><div><b>Rentals</b><span>By the hour</span></div><Art type="rental" /></div>
        </div>

        <div className="stat3">
          <div><b>2 min</b><span>Avg. pickup</span></div>
          <div><b>4.8★</b><span>Captain rating</span></div>
          <div><b>24x7</b><span>SOS support</span></div>
        </div>

        <div className="sec-h">Offers for you</div>
        <div className="offers" ref={ofs} onScroll={onScroll}>
          {OFFERS.map((o) => (
            <div key={o.code} className={`offer ${o.cls}`} onClick={() => go(o.to)}>
              <h4>{o.title}</h4><p>{o.sub}</p>
              <span className="cd" style={o.light ? { color: 'var(--pd)' } : undefined}>{o.code}</span>
              <Art type={o.art} />
            </div>
          ))}
        </div>
        <div className="dots">{OFFERS.map((o, i) => <i key={o.code} className={i === slide ? 'on' : ''} />)}</div>

        <div className="ref2" onClick={() => go('refer')}>
          <span className="lic"><Icon n="gift" s={20} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 15 }}>Invite friends, earn ₹100</b><p>For every friend who takes their first ride</p></div>
          <Icon n="right" s={18} />
        </div>
        <div className="safety" style={{ marginTop: 12 }} onClick={() => go('safety')}>
          <span className="lic"><Icon n="shield" s={20} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15 }}>Your safety comes first</b>
            <p className="mut small" style={{ marginTop: 3, lineHeight: 1.45 }}>Verified captains, live tracking & 24x7 SOS on every ride.</p>
          </div>
          <Icon n="right" s={18} />
        </div>
        <div className="foot"><h2>Go<br />Anywhere.</h2><p>Crafted with <Icon n="heart" s={12} /> in India · MOBO Cab</p></div>
      </div>
    </>
  );
}
Home.cls = 'tabpad';
