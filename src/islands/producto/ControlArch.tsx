// «Delegá trabajo en la IA sin perder el control» (spec 007 §3.5; V4 L564–658, runArch y prodVals).
// Una orden (OC-4471) recorre la banda de controles hasta el control elegido; al lado, qué hace ese control y un
// ejemplo en Nocti. Desde 1000 px el diagrama es la banda con 6 botones; debajo, un acordeón con los mismos controles.
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/routes';
import { Mark } from '../noctiapp/shell/Mark';
import { NIcon } from './NIcon';
import { ARCH } from './archData';
import './control-arch.css';

const PPL_X = [11, 30, 50, 70, 89];
const PPL_AGENT = [true, true, false, false, false];
const SYS_X = [14, 32, 50, 68, 86];
const GX = [17.5, 32, 46.5, 61, 75.5, 90];
const BAND_Y = 59.5;
const FLOW_ORDER = [0, 2, 1, 3, 4, 5];
const STEP = 380;

/** Recorrido del punto hasta el control g (V4 L1077). */
function archPath(g: number): [number, number][] {
  const p: [number, number][] = [[11, 14], [11, BAND_Y]];
  for (let i = 0; i <= g; i++) p.push([GX[i]!, BAND_Y]);
  if (g === 0) p.push([17.5, 70], [14, 82]);
  if (g === 2) p.push([95, BAND_Y], [95, 26], [89, 14]);
  return p;
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const icon = (i: number) => 'c' + (FLOW_ORDER[i]! + 1);

export default function ControlArch({ locale }: { locale: Locale }) {
  const c = ARCH[locale];
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [sel, setSel] = useState(0);
  const [pk, setPk] = useState(0);
  const [run, setRun] = useState(0);
  const [appr, setAppr] = useState<null | 'ok' | 'no'>(null);
  const [wide, setWide] = useState(true);

  const start = (g: number) => {
    window.clearInterval(timer.current);
    const n = archPath(g).length;
    setSel(g); setAppr(null); setRun((r) => r + 1);
    if (reduced()) { setPk(n - 1); return; }
    setPk(0);
    let k = 0;
    timer.current = window.setInterval(() => {
      k++;
      setPk(k);
      if (k >= n - 1) window.clearInterval(timer.current);
    }, STEP);
  };

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)');
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    // Arranca solo la primera vez que la sección sube al 75 % de la pantalla (V4 L1441).
    const el = root.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((es) => { if (es[0]?.isIntersecting) { start(0); io?.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' });
      io.observe(el);
    }
    return () => { mq.removeEventListener('change', apply); io?.disconnect(); window.clearInterval(timer.current); };
  }, []);

  const path = archPath(sel);
  const p = Math.min(pk, path.length - 1);
  const done = p === path.length - 1;
  const [px, py] = path[p]!;
  const [title, desc] = c.items[sel]!;
  const rows = c.gates.map((_, i) => i);
  const before = wide ? [] : rows.slice(0, sel);
  const after = wide ? [] : rows.slice(sel + 1);

  const pplStyle = (i: number) => {
    const hl = i === 4 && sel === 2 && done, src = i === 0, ag = PPL_AGENT[i];
    return { background: hl ? '#0047FF' : ag ? '#EEF3FF' : '#FFFFFF', color: hl ? '#FFFFFF' : ag ? '#0038CC' : '#0B0B0C', borderColor: hl || src ? '#0047FF' : ag ? '#A9C4FF' : '#D9D9D4' };
  };
  const sysStyle = (i: number) => {
    const hl = i === 0 && sel === 0 && done;
    return { background: hl ? '#0047FF' : '#FFFFFF', color: hl ? '#FFFFFF' : '#0B0B0C', borderColor: hl ? '#0047FF' : '#D9D9D4' };
  };
  const Row = ({ i }: { i: number }) => (
    <button type="button" className="ca-row" aria-expanded="false" onClick={() => start(i)}>
      <NIcon k={icon(i)} fg="#0B0B0C" ac="#0047FF" size={30} />
      <span className="ca-row-n">{'0' + (i + 1)}</span>
      <span className="ca-row-l">{c.items[i]![0]}</span>
      <span className="ca-row-p" aria-hidden="true">+</span>
    </button>
  );

  return (
    <div ref={root} className="ca">
      {wide ? (
        <div className="ca-dia">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ca-lines" aria-hidden="true">
            {PPL_X.map((x, i) => <line key={'p' + i} x1={x} y1={18} x2={x} y2={34} />)}
            {SYS_X.map((x, i) => <line key={'s' + i} x1={x} y1={64} x2={x} y2={82} />)}
          </svg>
          <span className="ca-cap ca-cap-top">{c.ppl}</span>
          {c.pplNames.map((l, i) => <span key={l} className="ca-ppl" style={{ left: PPL_X[i] + '%', ...pplStyle(i) }}>{l}</span>)}
          <div className="ca-band" />
          <span className="ca-band-l">{c.band}</span>
          {c.gates.map((l, i) => {
            const on = i === sel, past = !on && i < sel && p >= 2 + i;
            return (
              <button
                key={l}
                type="button"
                className="ca-gate"
                aria-pressed={on}
                onClick={() => start(i)}
                style={{ left: GX[i] + '%', background: on ? '#FFFFFF' : past ? '#0047FF' : '#1E1E21', color: on ? '#0B0B0C' : '#FFFFFF', boxShadow: `inset 0 0 0 1px ${on ? '#FFFFFF' : past ? '#0047FF' : '#3A3A3E'}` }}
              >
                <NIcon k={icon(i)} fg={on ? '#0047FF' : '#FFFFFF'} ac={on ? '#0047FF' : '#5B8CFF'} size={24} manual go={on ? run : 0} />
                <span>{l}</span>
              </button>
            );
          })}
          <div className="ca-dot" aria-hidden="true" style={{ left: px + '%', top: py + '%', background: done && sel === 1 ? '#E0A030' : '#3D7BFF' }} />
          {c.sysNames.map((l, i) => <span key={l} className="ca-sys" style={{ left: SYS_X[i] + '%', ...sysStyle(i) }}>{l}</span>)}
          <span className="ca-cap ca-cap-bot">{c.sys}</span>
        </div>
      ) : (
        <div className="ca-mob">
          <span className="ca-cap">{c.ppl}</span>
          <div className="ca-wrap">{c.pplNames.map((l, i) => <span key={l} className="ca-ppl-m" style={pplStyle(i)}>{l}</span>)}</div>
          <div className="ca-link" />
          <div className="ca-band-m"><span className="ca-band-l">{c.band}</span><span className="ca-band-d">{c.bandMob}</span></div>
          <div className="ca-link" />
          <div className="ca-wrap">{c.sysNames.map((l, i) => <span key={l} className="ca-sys-m" style={sysStyle(i)}>{l}</span>)}</div>
          <span className="ca-cap">{c.sys}</span>
        </div>
      )}

      <div className="ca-grid">
        {before.map((i) => <Row key={i} i={i} />)}
        <div className={'ca-info' + (wide ? '' : ' is-acc')} aria-live="polite">
          <div className="ca-info-h"><NIcon k={icon(sel)} fg="#0047FF" ac="#0047FF" size={32} manual go={run} /><span className="ca-num">{`0${sel + 1} / ${c.of} · ${c.gates[sel]}`}</span></div>
          <span className="ca-title">{title}</span>
          <span className="ca-desc">{desc}</span>
          <span className="ca-fx" style={{ color: done ? (sel === 1 ? '#9A6A0E' : '#0038CC') : '#8A8A86' }}><span className="ca-fx-d" />{done ? c.fx[sel] : c.enRoute}</span>
        </div>
        <div className="ca-sn">
          <div className="ca-sn-h"><span className="ca-sn-t"><Mark size={18} /><span className="ca-mono">Nocti · {title}</span></span><span className="ca-mono ca-sn-o">{c.order}</span></div>
          {sel === 0 && (
            <div className="ca-card">
              <div className="ca-between"><span className="ca-strong ca-14">{c.snPerm.agent}</span><span className="ca-pill ca-ok">{c.snPerm.active}</span></div>
              {c.snPerm.rows.map(([k, t, d]) => (
                <div key={t} className="ca-perm"><span className={k === 'ok' ? 'ca-c-ok' : 'ca-c-err'}>{k === 'ok' ? '✓' : '✕'}</span><span className="ca-strong">{t}</span><span className="ca-muted">{d}</span></div>
              ))}
            </div>
          )}
          {sel === 1 && (
            <div className="ca-card">
              <div className="ca-between ca-base"><span className="ca-mono ca-10">{c.snLimit.label}</span><span className="ca-strong">{c.snLimit.value}</span></div>
              <div className="ca-limit"><span /></div>
              <div className="ca-between ca-12 ca-muted"><span>{c.snLimit.auto}</span><span className="ca-c-warn">{c.snLimit.order}</span></div>
              <span className="ca-stop">{c.snLimit.stop}</span>
            </div>
          )}
          {sel === 2 && (
            <div className="ca-card ca-card-flush">
              <div className="ca-appr-h" style={{ background: appr === 'ok' ? '#2F7D52' : appr === 'no' ? '#0B0B0C' : '#9A6A0E' }}>
                <span>{appr === 'ok' ? c.snAppr.ok : appr === 'no' ? c.snAppr.no : c.snAppr.pending}</span><span>{c.snAppr.who}</span>
              </div>
              <div className="ca-appr-b">
                <span className="ca-strong ca-14">{c.order} · Plastar S.A. · {locale === 'es' ? '$18.400.000' : '$18,400,000'}</span>
                {appr === null ? (
                  <div className="ca-btns">
                    <button type="button" className="ca-btn ca-btn-dark" onClick={() => setAppr('ok')}>{c.snAppr.approve}</button>
                    <button type="button" className="ca-btn" onClick={() => setAppr('no')}>{c.snAppr.reject}</button>
                  </div>
                ) : (
                  <div className="ca-done"><span>{appr === 'ok' ? c.snAppr.okMsg : c.snAppr.noMsg}</span><button type="button" className="ca-undo" onClick={() => setAppr(null)}>{c.snAppr.undo}</button></div>
                )}
              </div>
            </div>
          )}
          {sel === 3 && (
            <div className="ca-card">
              {c.snTrace.map(([t, x, s]) => (
                <div key={t} className="ca-trace"><span className="ca-time">{t}</span><span className="ca-trace-b"><span className="ca-strong">{x}</span><span className="ca-src">{s}</span></span></div>
              ))}
            </div>
          )}
          {sel === 4 && (
            <div className="ca-card ca-card-list">
              {c.snAgents.map(([n, t, s, k]) => (
                <div key={n} className="ca-agent"><span className="ca-strong">{n}</span><span className="ca-muted">{t}</span><span className={'ca-pill ca-' + k}>{s}</span></div>
              ))}
            </div>
          )}
          {sel === 5 && (
            <div className="ca-card ca-card-list ca-card-log">
              {c.snLog.map(([t, a, x]) => (
                <div key={t} className="ca-log"><span className="ca-time">{t}</span><span className="ca-log-b"><span className="ca-strong">{x}</span><span className="ca-muted ca-12">{a}</span></span></div>
              ))}
              <span className="ca-export">{c.exportLog}</span>
            </div>
          )}
        </div>
        {after.map((i) => <Row key={i} i={i} />)}
      </div>
    </div>
  );
}
