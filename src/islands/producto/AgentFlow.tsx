// Flujo de agentes de Producto (spec 007 §3.3; port de «Agent Flow.dc.html»). Una corrida se reproduce sola al
// entrar en pantalla: disparador → 3 agentes en paralelo → composición → acciones; la acción con aprobación espera
// (o se aprueba sola a los 8 s) y después se ejecuta lo que depende de ella.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '../../i18n/routes';
import { FLOW, type Agent, type FNode, type Ic } from './agentData';
import './agent-flow.css';

const IC: Record<Ic, string> = {
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  erp: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  web: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20',
  doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
  bot: 'M12 8V4H8M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM9 13v2M15 13v2',
  comp: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
  chat: 'M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6',
  crm: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  act: 'M13 2L3 14h9l-1 8 10-12h-9z',
};
const T_PAR = 900, T_COMP = 2800, T_COMPD = 3800, T_BR = 4100, T_BRD = 4900, T_WAIT = 4900;
const DURS = [1200, 1500, 1000];
const TICK = 50;
const AUTO_APPROVE = 8000;
const CW = 1160, CH = 460;
const COLX = [0, 240, 480, 720, 960];
const NARROW = 820;

type St = 'pend' | 'hold' | 'run' | 'done' | 'appr' | 'okA' | 'rej' | 'cancel';
const LOOK: Record<St, [string, string, number, string]> = {
  pend: ['#FFFFFF', '#E2E2DE', 0.45, 'none'], hold: ['#FFFFFF', '#E2E2DE', 0.5, 'none'],
  run: ['#FFFFFF', '#0047FF', 1, '0 0 0 4px rgba(0,71,255,.10)'], done: ['#FFFFFF', '#CFE3D6', 1, 'none'],
  appr: ['#FFFDF6', '#E3C46F', 1, '0 0 0 4px rgba(227,196,111,.22)'], okA: ['#F5FBF7', '#6FAE88', 1, 'none'],
  rej: ['#FBF1EE', '#E8C9C2', 1, 'none'], cancel: ['#FFFFFF', '#E2E2DE', 0.4, 'none'],
};
const TAGC: Record<St, [string, string]> = {
  pend: ['#F1F1EF', '#8A8A86'], hold: ['#F1F1EF', '#8A8A86'], run: ['#EEF3FF', '#0038CC'], done: ['#EEF6F1', '#2F7D52'],
  appr: ['#F6EBD3', '#9A6A0E'], okA: ['#EEF6F1', '#2F7D52'], rej: ['#FBF1EE', '#AE1800'], cancel: ['#F1F1EF', '#8A8A86'],
};
const cl = (v: number) => Math.max(0, Math.min(1, v));
const rowsY = (n: number) => (n === 3 ? [80, 230, 380] : n === 2 ? [155, 305] : [230]);
const endT = (A: Agent) => T_WAIT + 400 + A.down.length * 800 + 300;
const mmss = (ms: number) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

interface Pos { id: string; d: FNode & { count?: [number, 'i' | 'm', string]; ruleD?: string }; col: number; cy: number; h: number }

function Spin() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true" className="af-spin">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3.5" />
      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AgentFlow({ locale, contactHref }: { locale: Locale; contactHref: string }) {
  const c = FLOW[locale];
  const tag = locale === 'es' ? 'es-AR' : 'en-US';
  const fmt = (v: number, k: 'i' | 'm') => k === 'm'
    ? (locale === 'es' ? '$' + v.toFixed(1).replace('.', ',') + ' M' : '$' + v.toFixed(1) + 'M')
    : Math.round(v).toLocaleString(tag);
  const secs = (s: number) => s.toLocaleString(tag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' s';

  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  const [t, setT] = useState(0);
  const [wait, setWait] = useState(0);
  const [appr, setAppr] = useState(false);
  const [rej, setRej] = useState(false);
  const [by, setBy] = useState('');
  const [started, setStarted] = useState(false);
  const [vis, setVis] = useState(false);
  const [pop, setPop] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [bw, setBw] = useState(1100);
  const [reduced, setReduced] = useState(false);
  const S = useRef({ sel, t, wait, appr, rej, started });
  S.current = { sel, t, wait, appr, rej, started };
  const A = c.agents[sel]!;

  const run = (i: number) => {
    setSel(i); setT(reduced ? T_WAIT : 0); setWait(0); setAppr(false); setRej(false); setBy(''); setStarted(true); setPop(null); setDrawer(false);
  };
  const approve = (who?: string) => {
    const s = S.current;
    if (s.t < T_WAIT || s.appr || s.rej) return;
    setAppr(true);
    setBy(who || c.card.approvedBy + c.agents[s.sel]!.approver);
    if (reduced) setT(endT(c.agents[s.sel]!));
  };
  const reject = () => { const s = S.current; if (s.t < T_WAIT || s.appr || s.rej) return; setRej(true); };

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = box.current;
    let ro: ResizeObserver | undefined;
    if (el) { setBw(el.clientWidth); ro = new ResizeObserver(([e]) => { if (e) setBw(Math.round(e.contentRect.width)); }); ro.observe(el); }
    const r = root.current;
    let io: IntersectionObserver | undefined;
    if (r && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => setVis(!!e?.isIntersecting), { threshold: 0.3 });
      io.observe(r);
    }
    return () => { ro?.disconnect(); io?.disconnect(); };
  }, []);

  // Arranca la primera vez que se ve.
  useEffect(() => { if (vis && !S.current.started) run(S.current.sel); }, [vis]);

  // Reloj: solo mientras se ve y queda algo por hacer.
  const finished = appr && t >= endT(A);
  useEffect(() => {
    if (!started || !vis || rej || finished) return;
    const id = window.setInterval(() => {
      const s = S.current, ag = c.agents[s.sel]!;
      if (s.t < T_WAIT) { setT(Math.min(T_WAIT, s.t + TICK)); return; }
      if (!s.appr && !s.rej) { const w = s.wait + TICK; if (w >= AUTO_APPROVE) approve(); else setWait(w); return; }
      if (s.appr && s.t < endT(ag)) setT(s.t + TICK);
    }, TICK);
    return () => window.clearInterval(id);
  }, [started, vis, rej, finished, sel]);

  const mob = bw < NARROW;
  const post = A.down.map((_, k) => T_WAIT + 400 + k * 800);
  const st: Record<string, St> = {};
  st.tr = t < 600 ? 'run' : 'done';
  A.par.forEach((_, i) => { st['p' + i] = t < T_PAR ? 'pend' : t < T_PAR + DURS[i]! ? 'run' : 'done'; });
  st.c = t < T_COMP ? 'pend' : t < T_COMPD ? 'run' : 'done';
  A.branch.forEach((b, j) => { st['b' + j] = t < T_BR ? 'pend' : b.appr ? (rej ? 'rej' : appr ? 'okA' : 'appr') : t < T_BRD ? 'run' : 'done'; });
  A.down.forEach((_, k) => { st['d' + k] = rej ? 'cancel' : !appr ? (t >= T_BR ? 'hold' : 'pend') : t < post[k]! ? 'hold' : t < post[k]! + 600 ? 'run' : 'done'; });

  const list = useMemo<Pos[]>(() => {
    const L: Pos[] = [];
    const add = (id: string, d: Pos['d'], col: number, cy: number, big = false) => L.push({ id, d, col, cy, h: big ? 168 : 108 });
    add('tr', A.trigger, 0, 230);
    A.par.forEach((p, i) => add('p' + i, p, 1, rowsY(A.par.length)[i]!));
    add('c', A.comp, 2, 230, true);
    A.branch.forEach((b, j) => add('b' + j, b, 3, rowsY(A.branch.length)[j]!));
    A.down.forEach((d, k) => add('d' + k, d, 4, rowsY(A.down.length)[k]!));
    return L;
  }, [A]);
  const byId = Object.fromEntries(list.map((x) => [x.id, x]));

  const ptxt = (x: Pos, s: St) => {
    if (x.id === 'c' && x.d.count) { const p = s === 'pend' ? 0 : cl((t - T_COMP) / (T_COMPD - T_COMP)); return fmt(x.d.count[0] * p, x.d.count[1]) + x.d.count[2]; }
    return x.d.r ?? '';
  };
  const node = (x: Pos) => {
    const s = st[x.id]!, lk = LOOK[s], tg = TAGC[s];
    let label = c.tags[(s === 'hold' ? 'pend' : s) as Exclude<St, 'hold'>];
    if (s === 'done' && x.d.dur) label = c.tags.done + ' · ' + secs(x.d.dur);
    const ruleOn = x.id === 'c' && t >= T_COMPD - 200;
    const quiet = s === 'pend' || s === 'hold' || s === 'cancel';
    return { s, lk, tg, label, ruleOn, quiet, r: ptxt(x, s), rop: s === 'pend' || (s === 'run' && x.id !== 'c') ? 0.35 : 1, open: pop === x.id };
  };
  const NodeBody = ({ x, inline }: { x: Pos; inline?: boolean }) => {
    const n = node(x);
    return (
      <>
        <div className="af-n-h">
          <span className="af-n-ic" style={{ background: n.quiet ? '#F1F1EF' : '#EEF3FF', color: n.quiet ? '#8A8A86' : '#0038CC' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={IC[x.d.ic]} /></svg>
          </span>
          <span className="af-n-type">{x.d.type}</span>
          {inline && <span className="af-tag af-tag-r" style={{ background: n.tg[0], color: n.tg[1] }}>{n.s === 'run' && <Spin />}{n.label}</span>}
        </div>
        <span className="af-n-t">{x.d.t}</span>
        {!inline && <span className="af-tag" style={{ background: n.tg[0], color: n.tg[1] }}>{n.s === 'run' && <Spin />}{n.label}</span>}
        <span className="af-n-r" style={{ opacity: n.rop }}>{n.r}</span>
        {x.id === 'c' && <span className="af-rule" style={{ opacity: n.ruleOn ? 1 : 0, transform: n.ruleOn ? 'none' : 'translateY(6px)' }}>{x.d.rule}</span>}
        {inline && n.open && (
          <div className="af-detail">
            <div className="af-srcs">{x.d.src.map((s) => <span key={s} className="af-src">{s}</span>)}</div>
            <span><span className="af-muted">{c.rule}</span>{x.d.ruleD || x.d.rule}</span>
            <span><span className="af-muted">{c.result}</span>{x.d.out}</span>
          </div>
        )}
      </>
    );
  };
  const nodeStyle = (x: Pos) => { const n = node(x); return { background: n.lk[0], borderColor: n.open ? '#0B0B0C' : n.lk[1], opacity: n.lk[2], boxShadow: n.lk[3] }; };

  // Conexiones
  const E: [string, string][] = [];
  A.par.forEach((_, i) => E.push(['tr', 'p' + i]));
  A.par.forEach((_, i) => E.push(['p' + i, 'c']));
  A.branch.forEach((_, j) => E.push(['c', 'b' + j]));
  A.down.forEach((d, k) => E.push(['b' + (d.from ?? 0), 'd' + k]));
  const live = (s: St) => s !== 'pend' && s !== 'hold' && s !== 'cancel';

  const sc = Math.min(1, (bw - 32) / CW);
  const pn = pop ? byId[pop] : undefined;
  const waiting = t >= T_WAIT && !appr && !rej;
  const hd = rej ? { l: c.status.rejected, bg: '#FBF1EE', fg: '#AE1800', bd: '#E8C9C2' }
    : finished ? { l: c.status.done, bg: '#EEF6F1', fg: '#2F7D52', bd: '#CFE3D6' }
    : waiting ? { l: c.status.waiting + mmss(wait), bg: '#FFFAEE', fg: '#9A6A0E', bd: '#E3C46F' }
    : { l: started ? c.status.running : c.status.ready, bg: '#EEF3FF', fg: '#0038CC', bd: '#C9D8FF' };
  const lit = new Set<number>();
  if (t >= T_PAR && t < T_COMP) lit.add(1);
  if (t >= T_COMPD - 200 && t < T_WAIT) lit.add(2);
  if (waiting || (t >= T_BR && t < T_WAIT)) lit.add(4);
  if (finished) lit.add(5);
  const rp = cl((t - (T_BR + 200)) / 1000);
  const C = A.card;
  const pulse = waiting && wait < 900;
  const groups: [string, string[]][] = [
    [c.groups[0], ['tr']], [c.groups[1], A.par.map((_, i) => 'p' + i)], [c.groups[2], ['c']],
    [c.groups[3], A.branch.map((_, j) => 'b' + j)], [c.groups[4], A.down.map((_, k) => 'd' + k)],
  ];

  return (
    <div className="af">
      <ul className="af-chips" aria-label={A.name}>
        {c.chips.map((l, i) => <li key={l} className={lit.has(i) ? 'is-on' : ''}>{l}</li>)}
      </ul>
      <div className="af-frame">
        <div ref={root} className="af-app">
          <div className="af-top">
            <div className="af-tabs" role="group">
              {c.agents.map((a, i) => {
                const on = i === sel;
                const dot = on ? (waiting ? '#C9A13B' : rej ? '#AE1800' : finished ? '#2F7D52' : '#0047FF') : '#2F7D52';
                return <button key={a.name} type="button" aria-pressed={on} className={'af-tab' + (on ? ' is-on' : '')} onClick={() => run(i)}><span className="af-dot" style={{ background: dot }} />{a.name}</button>;
              })}
            </div>
            <button type="button" className="af-replay" onClick={() => run(sel)}>{c.replay}</button>
          </div>
          <div className="af-head">
            <div className="af-head-t"><span className="af-name">{A.name}</span><span className="af-desc">{A.desc}</span></div>
            <span className="af-status" role="status" style={{ background: hd.bg, color: hd.fg, borderColor: hd.bd }}><span className="af-dot" style={{ background: hd.fg }} />{hd.l}</span>
          </div>

          <div ref={box}>
          {!mob ? (
            <div className="af-board" style={{ height: Math.round(CH * sc + 32) }}>
              <div className="af-canvas" style={{ left: Math.max(16, (bw - CW * sc) / 2), height: CH, transform: `scale(${sc.toFixed(4)})` }}>
                <svg width={CW} height={CH} className="af-edges" aria-hidden="true">
                  {E.map(([a, b], i) => {
                    const A1 = byId[a]!, B1 = byId[b]!, x1 = COLX[A1.col]! + 200, y1 = A1.cy, x2 = COLX[B1.col]!, y2 = B1.cy, xm = (x1 + x2) / 2;
                    const d = `M${x1} ${y1} C${xm} ${y1} ${xm} ${y2} ${x2} ${y2}`;
                    const sa = st[a]!, sb = st[b]!, on = (sa === 'done' || sa === 'okA') && live(sb), flowing = on && (sb === 'run' || sb === 'appr') && !reduced;
                    const col = sb === 'appr' ? '#C9A13B' : on ? '#3D7BFF' : '#C9C9C4';
                    return (
                      <g key={sel + '-' + i}>
                        <path d={d} fill="none" stroke={col} strokeWidth="1.6" strokeDasharray="2 5" strokeLinecap="round" style={{ transition: 'stroke .4s' }} />
                        {flowing && <circle r="3.5" fill={col}><animateMotion dur="1.1s" repeatCount="indefinite" path={d} /></circle>}
                      </g>
                    );
                  })}
                </svg>
                {list.map((x) => (
                  <button
                    key={sel + x.id}
                    type="button"
                    className="af-node"
                    aria-expanded={pop === x.id}
                    onClick={() => setPop((p) => (p === x.id ? null : x.id))}
                    style={{ left: COLX[x.col], top: x.cy - x.h / 2, ...nodeStyle(x) }}
                  >
                    <NodeBody x={x} />
                  </button>
                ))}
                {pn && (
                  <div className="af-pop" style={{ left: Math.min(COLX[pn.col]!, CW - 250), top: pn.cy + pn.h / 2 + 8 > CH - 150 ? pn.cy - pn.h / 2 - 158 : pn.cy + pn.h / 2 + 8 }}>
                    <div className="af-pop-h"><span className="af-strong">{pn.d.t}</span><button type="button" className="af-x" aria-label={c.closePop} onClick={() => setPop(null)}>×</button></div>
                    <div className="af-srcs"><span className="af-muted af-10">{c.sources}</span>{pn.d.src.map((s) => <span key={s} className="af-src">{s}</span>)}</div>
                    <span><span className="af-muted">{c.rule}</span>{pn.d.ruleD || pn.d.rule}</span>
                    <span><span className="af-muted">{c.result}</span>{pn.d.out}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="af-list">
              {groups.map(([l, ids], gi) => (
                <div key={l} className="af-group">
                  <span className="af-group-l">{l}</span>
                  {ids.map((id) => {
                    const x = byId[id]!;
                    return (
                      <button key={sel + id} type="button" className="af-node af-node-m" aria-expanded={pop === id} onClick={() => setPop((p) => (p === id ? null : id))} style={nodeStyle(x)}>
                        <NodeBody x={x} inline />
                      </button>
                    );
                  })}
                  {gi < 4 && <div className="af-vline" />}
                </div>
              ))}
            </div>
          )}
          </div>

          <div className="af-low">
            <div className="af-card" style={{ borderColor: waiting ? '#E3C46F' : appr ? '#CFE3D6' : '#E2E2DE', boxShadow: pulse ? '0 0 0 8px rgba(227,196,111,.25)' : 'none' }}>
              <div className="af-between">
                <span className="af-card-t">{appr ? c.card.approved : rej ? c.card.rejected : c.card.need}</span>
                <span className="af-pill" style={{ background: waiting ? '#F6EBD3' : appr ? '#EEF6F1' : rej ? '#FBF1EE' : '#F1F1EF', color: waiting ? '#9A6A0E' : appr ? '#2F7D52' : rej ? '#AE1800' : '#8A8A86' }}>
                  {waiting ? c.card.pending : appr ? c.card.approved : rej ? c.card.rejected : c.card.prep}
                </span>
              </div>
              <span className="af-14">{C.text}</span>
              <table className="af-table">
                <thead><tr>{C.h.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                <tbody>{C.rows.map(([a, b, d]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{d}</td></tr>)}</tbody>
              </table>
              <span className="af-note">{C.note}</span>
              {!appr && !rej ? (
                <div className="af-btns">
                  <button type="button" className="af-btn af-btn-dark" disabled={t < T_WAIT} onClick={() => approve()}>{C.b1}</button>
                  <button type="button" className="af-btn" disabled={!C.drawer && t < T_WAIT} onClick={() => (C.drawer ? setDrawer(true) : reject())}>{C.b2}</button>
                </div>
              ) : (
                <div className="af-done" style={{ background: rej ? '#FBF1EE' : '#EEF6F1', borderColor: rej ? '#E8C9C2' : '#CFE3D6', color: rej ? '#AE1800' : '#2F7D52' }}>
                  <span className="af-dot" style={{ background: 'currentColor' }} />{rej ? c.card.rejectedTxt : by}
                </div>
              )}
            </div>
            <div className="af-res">
              <span className="af-mono">{c.run}</span>
              <div className="af-res-g">
                {A.results.map(([v, k, l, m]) => {
                  const dim = m === 'appr' && !appr, amb = m === 'amber' && rp > 0;
                  return (
                    <div key={l} className="af-r" style={{ opacity: dim ? 0.4 : 1, background: amb ? '#FFFAEE' : '#FFFFFF', borderColor: amb ? '#E3C46F' : '#E2E2DE' }}>
                      <span className="af-r-v" style={{ color: amb ? '#9A6A0E' : '#0B0B0C' }}>{fmt(v * rp, k)}</span>
                      <span className="af-r-l">{l}</span>
                    </div>
                  );
                })}
              </div>
              <span className="af-audit" style={{ opacity: finished ? 1 : 0 }}>{c.audit}</span>
            </div>
          </div>

          {drawer && (
            <div className="af-drawer" onKeyDown={(e) => { if (e.key === 'Escape') setDrawer(false); }}>
              <div className="af-drawer-p" role="dialog" aria-modal="false" aria-label={c.drawer.title}>
                <div className="af-between"><span className="af-card-t">{c.drawer.title}</span><button type="button" className="af-close" aria-label={c.drawer.close} onClick={() => setDrawer(false)} autoFocus>×</button></div>
                <table className="af-sku">
                  <thead><tr>{c.drawer.h.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>{c.skus.map(([s, p, l, v, q, a]) => <tr key={s}><td className="af-muted">{s}</td><td>{p}</td><td>{l}</td><td>{v}</td><td className="af-num">{q.toLocaleString(tag)}</td><td className="af-strong">{a}</td></tr>)}</tbody>
                </table>
                <span className="af-mono">{c.drawer.source}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="af-foot">
        <a className="af-cta" href={contactHref}>{c.cta} <span className="af-cta-l">{c.ctaLink}</span></a>
        <span className="af-mono af-cap">{c.caption}</span>
      </div>
    </div>
  );
}
