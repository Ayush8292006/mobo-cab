import { P } from './iconPaths';
import { SV } from './art';
import { useApp } from '../context/AppContext';
import { PAYS } from '../data';

/* ---------- Icons ---------- */
export function Icon({ n, s = 20, w = 2, className = '', style }) {
  return (
    <svg className={'ic ' + className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: P[n] || '' }} />
  );
}
export function Star({ s = 16, fill = 'none' }) {
  return (
    <svg className="ic" width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? '#CFCFCA' : fill}
      strokeWidth="1.6" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: P.star }} />
  );
}

/* ---------- Vehicle illustration ---------- */
const inner = (svg) => svg.replace(/^<svg[^>]*>|<\/svg>$/g, '');
export function Art({ type, className, width, height }) {
  return <svg className={className} width={width} height={height} viewBox="0 0 72 48" dangerouslySetInnerHTML={{ __html: inner(SV[type]) }} />;
}

/* ---------- Buttons / headers ---------- */
export function BackButton({ floating }) {
  const { back } = useApp();
  return (
    <button className={'bk' + (floating ? ' fl' : '')} onClick={back} aria-label="Back">
      <Icon n="arrowl" s={20} w={2.3} />
    </button>
  );
}

export function Header({ title, sub, line = true, right }) {
  return (
    <div className={'hdr' + (line ? ' line' : '')}>
      <BackButton />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1>{title}</h1>
        {sub && <p className="small mut">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export const Avatar = ({ text, style }) => <div className="av" style={style}>{text}</div>;

/* ---------- Trip summary card ---------- */
export function TripCard({ ride, coupon }) {
  const pay = PAYS[ride.pay];
  return (
    <div className="trip">
      <div className="r"><span className="dot g" /><div><b>{ride.from}</b><span>Pickup</span></div></div>
      <div className="r"><span className="sq" /><div><b>{ride.to}</b><span>Drop · {ride.km} km</span></div><b style={{ flex: 'none' }}>₹{ride.total}</b></div>
      <div className="r"><Icon n={pay.i} s={18} /><div><b>{pay.n}</b><span>{ride.disc ? `₹${ride.disc} saved with ${coupon || 'coupon'}` : 'Payment'}</span></div></div>
    </div>
  );
}

/* ---------- Bottom tab bar ---------- */
const TABS = [['home', 'home', 'Ride'], ['services', 'grid', 'Services'], ['activity', 'list', 'Activity'], ['account', 'user', 'Account']];
export function TabBar() {
  const { nav, tab } = useApp();
  return (
    <nav id="tabs" className="show">
      {TABS.map(([id, ic, label]) => (
        <button key={id} className={nav.id === id ? 'on' : ''} onClick={() => tab(id)}>
          <span className="tb"><Icon n={ic} s={20} /></span>{label}
        </button>
      ))}
    </nav>
  );
}

/* ---------- Toast + Sheet hosts ---------- */
export function ToastHost() {
  const { toastState } = useApp();
  return <div id="toast" className={toastState.on ? 'on' : ''}><Icon n={toastState.icon} s={16} />{toastState.text}</div>;
}
export function SheetHost() {
  const { sheet, closeSheet } = useApp();
  return (
    <>
      <div id="scrim" className={sheet.on ? 'on' : ''} onClick={closeSheet} />
      <div id="sheet" className={sheet.on ? 'on' : ''}>
        <div className="grab" />
        {sheet.node}
      </div>
    </>
  );
}

/* ---------- Selectable list option (radio) ---------- */
export function Option({ on, onClick, icon, title, sub, bold = true }) {
  return (
    <div className={'opt' + (on ? ' on' : '')} onClick={onClick}>
      {icon && <span className="lic"><Icon n={icon} s={18} /></span>}
      <div className="t"><b style={bold ? undefined : { fontWeight: 600 }}>{title}</b>{sub && <span>{sub}</span>}</div>
      <span className="radio" />
    </div>
  );
}
