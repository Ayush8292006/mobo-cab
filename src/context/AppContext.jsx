import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CURRENT_LOCATION, SAVED, SEED_RIDES } from '../data';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const USER_KEY = 'mobo_user';
function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}

const initialState = () => ({
  user: loadUser(),
  phone: '',
  pickup: CURRENT_LOCATION,
  drop: null,
  veh: 'bike',
  pay: 'cash',
  coupon: null,
  wallet: 240,
  coins: 180,
  mode: 'ride', // 'ride' | 'parcel'
  ride: null,
  chat: [],
  ptype: 'Documents',
  rental: { v: 'eco', p: 1 },
  saved: SAVED,
  rides: SEED_RIDES,
});

export function AppProvider({ children }) {
  /* ----- app state ----- */
  const [st, setSt] = useState(initialState);
  const up = useCallback((patch) => setSt((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);

  useEffect(() => {
    try {
      if (st.user) localStorage.setItem(USER_KEY, JSON.stringify(st.user));
      else localStorage.removeItem(USER_KEY);
    } catch { /* storage unavailable */ }
  }, [st.user]);

  /* ----- navigation (stack based) ----- */
  const [nav, setNav] = useState({ id: 'splash', params: null, anim: 'fade', hist: [], key: 0 });
  const go = useCallback((id, params = null, anim = 'push') =>
    setNav((n) => ({ id, params, anim, hist: [...n.hist, { id: n.id, params: n.params }], key: n.key + 1 })), []);
  const back = useCallback(() =>
    setNav((n) => {
      const h = n.hist.slice();
      const prev = h.pop() || { id: 'home', params: null };
      return { id: prev.id, params: prev.params, anim: 'back', hist: h, key: n.key + 1 };
    }), []);
  /** Switch to a bottom tab (clears history). */
  const tab = useCallback((id) => setNav((n) => ({ id, params: null, anim: 'fade', hist: [], key: n.key + 1 })), []);
  /** Replace current screen. `drop` = screen ids to remove from history; without it history is cleared. */
  const replace = useCallback((id, { params = null, anim = 'fade', drop } = {}) =>
    setNav((n) => ({ id, params, anim, hist: drop ? n.hist.filter((h) => !drop.includes(h.id)) : [], key: n.key + 1 })), []);

  /* ----- toast ----- */
  const [toastState, setToast] = useState({ on: false, text: '', icon: 'check' });
  const toastTimer = useRef();
  const toast = useCallback((text, icon = 'check') => {
    clearTimeout(toastTimer.current);
    setToast({ on: true, text, icon });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), 2300);
  }, []);

  /* ----- bottom sheet ----- */
  const [sheet, setSheet] = useState({ on: false, node: null });
  const openSheet = useCallback((node) => setSheet({ on: true, node }), []);
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, on: false })), []);
  useEffect(() => { closeSheet(); }, [nav.key, closeSheet]);

  const value = useMemo(() => ({
    st, up, nav, go, back, tab, replace, prevId: nav.hist.length ? nav.hist[nav.hist.length - 1].id : null,
    toast, toastState, sheet, openSheet, closeSheet,
  }), [st, up, nav, go, back, tab, replace, toast, toastState, sheet, openSheet, closeSheet]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
