import { useEffect, useMemo, useRef } from 'react';
import { BASE, topV, homeOverlay, routeOverlay } from './mapBase';

/**
 * Full-screen map layer.
 * mode: 'home' | 'route' | 'searching' | 'live'
 * run (optional): { key, d, t0, ms, type, onTick(k), onDone() } — animates a vehicle along path d.
 */
export default function MapView({ mode, dropPt, pickTxt = 'Pickup', dropTxt = 'Drop', run }) {
  const overlay = useMemo(
    () => (mode === 'home' ? homeOverlay() : routeOverlay(dropPt, pickTxt, dropTxt, mode === 'searching')),
    [mode, dropPt, pickTxt, dropTxt]
  );
  const pathRef = useRef(null);
  const markRef = useRef(null);
  const cbRef = useRef(run);
  cbRef.current = run;

  useEffect(() => {
    if (!run || !pathRef.current || !markRef.current) return undefined;
    const p = pathRef.current;
    const m = markRef.current;
    const L = p.getTotalLength();
    let ang = 0;
    let raf = 0;
    let finished = false;
    const frame = () => {
      const { t0, ms, onTick, onDone } = cbRef.current || {};
      const k = Math.min(1, Math.max(0, (Date.now() - t0) / ms));
      const a = p.getPointAtLength(k * L);
      const b = p.getPointAtLength(Math.min(L, k * L + 2));
      if (b.x !== a.x || b.y !== a.y) ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      m.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`);
      onTick && onTick(k);
      if (k < 1) raf = requestAnimationFrame(frame);
      else if (!finished) { finished = true; onDone && onDone(); }
    };
    frame();
    return () => cancelAnimationFrame(raf);
    // restart only when a new run starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run && run.key]);

  return (
    <div className="map">
      <svg viewBox={mode === 'home' ? '0 0 400 800' : '0 -45 400 800'} preserveAspectRatio="xMidYMin slice">
        <g dangerouslySetInnerHTML={{ __html: BASE }} />
        <g dangerouslySetInnerHTML={{ __html: overlay }} />
        {run && (
          <>
            <path ref={pathRef} d={run.d} fill="none" />
            <g ref={markRef} dangerouslySetInnerHTML={{ __html: topV(run.type) }} />
          </>
        )}
      </svg>
    </div>
  );
}
