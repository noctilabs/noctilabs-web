// Agentes de Producto (spec 007 §3.C): `Agent Flow.dc.html` de la v4. Una corrida del agente elegido: disparador, agentes en
// paralelo, composición, acciones (una con aprobación humana) y lo que sigue después de aprobar; abajo, la tarjeta de
// aprobación y el resultado. Arranca al entrar en pantalla; si nadie decide, se aprueba solo a los 8 s, como en la v4.
// F5: «Pausar» congela la corrida y sus animaciones. Con reduced motion la corrida salta a la espera de aprobación, sin
// aprobación automática ni animaciones, y al aprobar muestra el resultado final.
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import './agent-flow.css';
import type { Locale } from '../noctiapp/data/types';
import { FICONS, FLOW, type FNode } from './flow-data';
import { useMounted, useReducedMotion } from './shared';

const T_PAR = 900, T_COMP = 2800, T_COMPD = 3800, T_BR = 4100, T_BRD = 4900, T_WAIT = 4900, AUTO_APPROVE = 8000, TICK = 50;
const DURS = [1200, 1500, 1000];
const CW = 1160, CH = 460, COLX = [0, 240, 480, 720, 960];
const cl = (v: number) => Math.max(0, Math.min(1, v));
const mmss = (ms: number) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const rows = (n: number) => (n === 3 ? [80, 230, 380] : n === 2 ? [155, 305] : [230]);

type St = 'pend' | 'hold' | 'run' | 'done' | 'appr' | 'okA' | 'rej' | 'cancel';
interface Laid { id: string; d: FNode; col: number; cy: number; h: number }

function Spin({ still }: { still: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" className="af-spin" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3.5" />
      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        {!still && <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite" />}
      </path>
    </svg>
  );
}

export default function AgentFlow({ locale }: { locale: Locale }) {
  const c = FLOW[locale];
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const [sel, setSel] = useState(0);
  const [t, setT] = useState(0);
  const [wait, setWait] = useState(0);
  const [appr, setAppr] = useState(false);
  const [rej, setRej] = useState(false);
  const [by, setBy] = useState('');
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pop, setPop] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [bw, setBw] = useState(CW + 32);
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const drawerBtn = useRef<HTMLButtonElement | null>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const S = useRef({ sel, t, wait, appr, rej, started, paused, reduced });
  S.current = { sel, t, wait, appr, rej, started, paused, reduced };
  const popId = useId();

  const A = c.agents[sel]!;
  const end = (a = A) => T_WAIT + 400 + a.down.length * 800 + 300;

  const run = useCallback((i: number) => {
    setSel(i); setWait(0); setAppr(false); setRej(false); setBy(''); setStarted(true); setPop(null); setDrawer(false);
    setT(S.current.reduced ? T_WAIT : 0);
  }, []);

  const approve = useCallback((who?: string) => {
    const s = S.current;
    if (s.t < T_WAIT || s.appr || s.rej) return;
    const a = c.agents[s.sel]!;
    setAppr(true);
    setBy(c.card.by(who ?? a.approver));
    if (s.reduced) setT(T_WAIT + 400 + a.down.length * 800 + 300);
  }, [c]);
  const reject = () => { if (t < T_WAIT || appr || rej) return; setRej(true); };

  // Arranque al entrar en pantalla (v4: threshold .3; acá, cuando el bloque pasa el 70 % del alto de la ventana, porque en mobile mide más que la pantalla) y medida de la caja del lienzo.
  useEffect(() => {
    const el = root.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => { if (e?.isIntersecting && !S.current.started) run(S.current.sel); }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
      io.observe(el);
    }
    const ro = new ResizeObserver(([e]) => { if (e && e.contentRect.width > 0) setBw(Math.round(e.contentRect.width)); });
    if (box.current) ro.observe(box.current);
    return () => { io?.disconnect(); ro.disconnect(); };
  }, [run]);

  // Reloj de la corrida (v4: 50 ms). Sin reloj en pausa, con reduced motion ni con el panel por SKU abierto (si no,
  // la corrida se aprueba sola detrás del panel y su disparador desaparece mientras el visitante lo lee).
  useEffect(() => {
    if (!started || paused || reduced || drawer) return;
    const id = setInterval(() => {
      const s = S.current;
      const a = c.agents[s.sel]!;
      if (s.t < T_WAIT) { setT(Math.min(T_WAIT, s.t + TICK)); return; }
      if (!s.appr && !s.rej) { const w = s.wait + TICK; if (w >= AUTO_APPROVE) approve(a.approver); else setWait(w); return; }
      if (s.appr && s.t < T_WAIT + 400 + a.down.length * 800 + 300) setT(s.t + TICK);
    }, TICK);
    return () => clearInterval(id);
  }, [started, paused, reduced, drawer, c, approve]);

  // Reduced motion activado durante la corrida: salta a la espera.
  useEffect(() => { if (reduced && started && t < T_WAIT) setT(T_WAIT); }, [reduced, started, t]);

  // Panel por SKU modal: lo cubierto queda `inert`, Tab gira dentro, el foco va a «Cerrar» y,
  // al cerrar y ya sin `inert`, vuelve al disparador.
  useEffect(() => {
    if (drawer) drawerClose.current?.focus();
    else if (drawerBtn.current) { drawerBtn.current.focus(); drawerBtn.current = null; }
  }, [drawer]);
  const closeDrawer = () => setDrawer(false);
  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const f = e.currentTarget.querySelectorAll<HTMLElement>('button, [tabindex="0"]');
    const a = f[0], z = f[f.length - 1], at = document.activeElement;
    if (e.shiftKey ? at === a || at === e.currentTarget : at === z) { e.preventDefault(); (e.shiftKey ? z : a)?.focus(); }
  };

  // Estado de cada nodo (v4 renderVals).
  const post = A.down.map((_, k) => T_WAIT + 400 + k * 800);
  const st: Record<string, St> = {};
  st.tr = t < 600 && started ? 'run' : t < 600 ? 'pend' : 'done';
  A.par.forEach((_, i) => (st['p' + i] = t < T_PAR ? 'pend' : t < T_PAR + DURS[i]! ? 'run' : 'done'));
  st.c = t < T_COMP ? 'pend' : t < T_COMPD ? 'run' : 'done';
  A.branch.forEach((b, j) => (st['b' + j] = t < T_BR ? 'pend' : b.appr ? (rej ? 'rej' : appr ? 'okA' : 'appr') : t < T_BRD ? 'run' : 'done'));
  A.down.forEach((_, k) => (st['d' + k] = rej ? 'cancel' : !appr ? (t >= T_BR ? 'hold' : 'pend') : t < post[k]! ? 'hold' : t < post[k]! + 600 ? 'run' : 'done'));
  const finished = appr && t >= end();
  const waiting = t >= T_WAIT && !appr && !rej;

  const list: Laid[] = [];
  const add = (id: string, d: FNode, col: number, cy: number, comp = false) => list.push({ id, d, col, cy, h: comp ? 168 : 108 });
  add('tr', A.trigger, 0, 230);
  A.par.forEach((p, i) => add('p' + i, p, 1, rows(A.par.length)[i]!));
  add('c', A.comp, 2, 230, true);
  A.branch.forEach((b, j) => add('b' + j, b, 3, rows(A.branch.length)[j]!));
  A.down.forEach((d, k) => add('d' + k, d, 4, rows(A.down.length)[k]!));
  const byId = Object.fromEntries(list.map((x) => [x.id, x]));

  const resultText = (x: Laid, s2: St) => {
    if (x.id === 'c' && x.d.count) { const p = s2 === 'pend' ? 0 : cl((t - T_COMP) / (T_COMPD - T_COMP)); return c.num(x.d.count[0] * p, x.d.count[1]) + x.d.count[2]; }
    return x.d.r ?? '';
  };
  const ruleOn = t >= T_COMPD - 200;

  const node = (x: Laid, mob: boolean) => {
    const s2 = st[x.id]!;
    let tag = c.tag[s2];
    if (s2 === 'done' && x.d.dur) tag = c.ready(x.d.dur);
    const open = pop === x.id;
    const dim = s2 === 'pend' || s2 === 'hold' || s2 === 'cancel';
    const faint = s2 === 'pend' || (s2 === 'run' && x.id !== 'c');
    const style = mob ? undefined : { left: COLX[x.col] + 'px', top: x.cy - x.h / 2 + 'px' };
    return (
      <li key={x.id + sel} className={'af-node' + (mob ? ' is-mob' : '')} data-st={s2} data-open={open || undefined} style={style}>
        <button type="button" className="af-node-b" aria-expanded={open} aria-controls={open ? popId + (mob ? 'm' : 'd') : undefined} disabled={!mounted} onClick={() => setPop((p) => (p === x.id ? null : x.id))}>
          <span className="af-node-k">
            <span className={'af-ic' + (dim ? ' is-dim' : '')} aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={FICONS[x.d.ic]} /></svg></span>
            <span className="af-type">{x.d.type}</span>
            {mob && <span className="af-tag" data-st={s2}>{s2 === 'run' && <Spin still={reduced || paused} />}{tag}</span>}
          </span>
          <span className="af-t">{x.d.t}</span>
          {!mob && <span className="af-tag" data-st={s2}>{s2 === 'run' && <Spin still={reduced || paused} />}{tag}</span>}
          <span className={'af-r' + (faint ? ' is-faint' : '')}>{resultText(x, s2)}</span>
          {x.id === 'c' && <span className={'af-rule' + (ruleOn ? ' is-on' : '')}>{x.d.rule}</span>}
        </button>
        {mob && open && (
          <div id={popId + 'm'} className="af-more">
            <div className="af-srcs">{x.d.src.map((s) => <span key={s} className="af-src">{s}</span>)}</div>
            <span><span className="af-muted">{c.rule} · </span>{x.d.ruleD ?? x.d.rule}</span>
            <span><span className="af-muted">{c.result} · </span>{x.d.out}</span>
          </div>
        )}
      </li>
    );
  };

  // Aristas del lienzo.
  const E: [string, string][] = [];
  A.par.forEach((_, i) => E.push(['tr', 'p' + i]));
  A.par.forEach((_, i) => E.push(['p' + i, 'c']));
  A.branch.forEach((_, j) => E.push(['c', 'b' + j]));
  A.down.forEach((d, k) => E.push(['b' + (d.from ?? 0), 'd' + k]));
  const live = (s2: St) => s2 !== 'pend' && s2 !== 'hold' && s2 !== 'cancel';
  const edges = E.map(([a, b]) => {
    const A1 = byId[a]!, B1 = byId[b]!;
    const x1 = COLX[A1.col]! + 200, y1 = A1.cy, x2 = COLX[B1.col]!, y2 = B1.cy, xm = (x1 + x2) / 2;
    const d = `M${x1} ${y1} C${xm} ${y1} ${xm} ${y2} ${x2} ${y2}`;
    const sa = st[a]!, sb = st[b]!;
    const on = (sa === 'done' || sa === 'okA') && live(sb);
    const flowing = on && (sb === 'run' || sb === 'appr') && !reduced && !paused;
    const col = sb === 'appr' ? '#C9A13B' : on ? '#3D7BFF' : '#C9C9C4';
    return (
      <g key={a + b + sel}>
        <path d={d} fill="none" stroke={col} strokeWidth="1.6" strokeDasharray="2 5" strokeLinecap="round" className="af-edge" />
        {flowing && <circle r="3.5" fill={col}><animateMotion dur="1.1s" repeatCount="indefinite" path={d} /></circle>}
      </g>
    );
  });

  const sc = Math.min(1, (bw - 32) / CW);
  const pn = pop ? byId[pop] : undefined;
  const popPos = pn ? { left: Math.min(COLX[pn.col]!, CW - 250) + 'px', top: (pn.cy + pn.h / 2 + 8 > CH - 150 ? pn.cy - pn.h / 2 - 158 : pn.cy + pn.h / 2 + 8) + 'px' } : undefined;

  const hd = rej ? { l: c.head.rej, k: 'rej' } : finished ? { l: c.head.done, k: 'done' } : waiting ? { l: c.head.wait(mmss(wait)), k: 'wait' } : { l: started ? c.head.run : c.head.idle, k: 'run' };
  const lit = new Set<number>();
  if (t >= T_PAR && t < T_COMP) lit.add(1);
  if (t >= T_COMPD - 200 && t < T_WAIT) lit.add(2);
  if (waiting || (t >= T_BR && t < T_WAIT)) lit.add(4);
  if (finished) lit.add(5);

  const rp = cl((t - (T_BR + 200)) / 1000);
  const C = A.card;
  const apState = appr ? 'ok' : rej ? 'rej' : waiting ? 'wait' : 'prep';
  const apTag = waiting ? c.card.pend : appr ? c.card.appr : rej ? c.card.rej : c.card.prep;
  const groups: [string, string[]][] = [[c.groups[0], ['tr']], [c.groups[1], A.par.map((_, i) => 'p' + i)], [c.groups[2], ['c']], [c.groups[3], A.branch.map((_, j) => 'b' + j)], [c.groups[4], A.down.map((_, k) => 'd' + k)]];
  const dot = (i: number) => (i !== sel ? 'done' : waiting ? 'wait' : rej ? 'rej' : finished ? 'done' : 'run');

  return (
    <div ref={root} className={'pr-af' + (reduced ? ' is-reduced' : '')} onKeyDown={(e) => { if (e.key === 'Escape') { if (drawer) closeDrawer(); else if (pop) setPop(null); } }}>
      <ul className="af-chips">{c.chips.map((l, i) => <li key={l} className={lit.has(i) ? 'is-on' : undefined}>{l}</li>)}</ul>
      <div className="af-frame">
        <div className="af-app">
          <div className="af-bar" inert={drawer}>
            <div className="af-agents" role="group" aria-label={c.agentsLabel}>
              {c.agents.map((a, i) => (
                <button key={a.name} type="button" aria-pressed={i === sel} disabled={!mounted} onClick={() => run(i)}>
                  <span className="af-dot" data-st={dot(i)} aria-hidden="true" />{a.name}
                </button>
              ))}
            </div>
            <div className="af-ctl">
              {started && !reduced && !finished && !rej && (
                <button type="button" className="af-link" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? c.play : c.pause}</button>
              )}
              <button type="button" className="af-link" disabled={!mounted} onClick={() => { setPaused(false); run(sel); }}>{c.replay}</button>
            </div>
          </div>
          <div className="af-head" inert={drawer}>
            <div className="af-head-t"><h3>{A.name}</h3><p>{A.desc}</p></div>
            <span className="af-status" data-k={hd.k}><span aria-hidden="true" />{hd.l}</span>
          </div>

          <div ref={box} className="af-box" inert={drawer} style={{ height: Math.round(CH * sc + 32) + 'px' }}>
            <div className="af-canvas" style={{ transform: `scale(${sc.toFixed(4)})`, left: Math.max(16, (bw - CW * sc) / 2) + 'px', height: CH + 'px' }} aria-label={c.canvasLabel} role="group">
              <svg width={CW} height={CH} className="af-edges" aria-hidden="true" focusable="false">{edges}</svg>
              <ul>{list.map((x) => node(x, false))}</ul>
              {pn && (
                <div id={popId + 'd'} className="af-pop" style={popPos} role="group" aria-label={pn.d.t}>
                  <div className="af-pop-h"><span>{pn.d.t}</span><button type="button" aria-label={c.close} onClick={() => setPop(null)}>×</button></div>
                  <div className="af-srcs"><span className="af-muted">{c.sources}</span>{pn.d.src.map((s) => <span key={s} className="af-src">{s}</span>)}</div>
                  <span><span className="af-muted">{c.rule} · </span>{pn.d.ruleD ?? pn.d.rule}</span>
                  <span><span className="af-muted">{c.result} · </span>{pn.d.out}</span>
                </div>
              )}
            </div>
          </div>

          <div className="af-list" inert={drawer}>
            {groups.map(([l, ids], gi) => (
              <div key={l} className="af-group">
                <h4 className="af-gl">{l}</h4>
                <ul>{ids.map((id) => node(byId[id]!, true))}</ul>
                {gi < 4 && <span className="af-vline" aria-hidden="true" />}
              </div>
            ))}
          </div>

          <div className="af-low" inert={drawer}>
            <div className="af-card" data-st={apState}>
              <div className="af-card-h"><h4>{appr ? c.card.appr : rej ? c.card.rej : c.card.need}</h4><span className="af-ctag" data-st={apState}>{apTag}</span></div>
              <p className="af-card-x">{C.text}</p>
              <table className="af-table">
                <thead><tr>{C.h.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                <tbody>{C.rows.map(([a, b, d]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{d}</td></tr>)}</tbody>
              </table>
              <p className="af-note">{C.note}</p>
              {!appr && !rej && (
                <div className="af-btns">
                  <button type="button" className="af-btn is-dark" disabled={!mounted || !waiting} onClick={() => approve()}>{C.b1}</button>
                  <button type="button" className="af-btn" disabled={!mounted || (!C.drawer && !waiting)} onClick={(e) => { if (C.drawer) { drawerBtn.current = e.currentTarget; setDrawer(true); } else reject(); }}>{C.b2}</button>
                </div>
              )}
              {(appr || rej) && <p className="af-done" data-st={rej ? 'rej' : 'ok'}><span aria-hidden="true" />{rej ? c.card.rejNote : by}</p>}
            </div>
            <div className="af-res">
              <h4 className="af-gl">{c.resultTitle}</h4>
              <ul>
                {A.results.map(([v, k, l, m]) => {
                  const dimR = m === 'appr' && !appr;
                  const amb = m === 'amber' && rp > 0;
                  return <li key={l} className={(dimR ? 'is-dim' : '') + (amb ? ' is-amber' : '')}><span className="af-rv">{c.num(v * rp, k)}</span><span>{l}</span></li>;
                })}
              </ul>
              <span className={'af-audit' + (finished ? ' is-on' : '')}>{c.audit}</span>
            </div>
          </div>

          {drawer && (
            <div className="af-drawer">
              <div className="af-drawer-p" role="dialog" aria-modal="true" aria-label={c.skuTitle} tabIndex={-1} onKeyDown={trapTab}>
                <div className="af-pop-h af-drawer-h"><h4>{c.skuTitle}</h4><button type="button" ref={drawerClose} aria-label={c.close} onClick={closeDrawer}>×</button></div>
                <div className="af-sku-w" role="region" aria-label={c.skuTitle} tabIndex={0}>
                  <table className="af-sku">
                    <thead><tr>{c.skuCols.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                    <tbody>{c.skus.map((r) => <tr key={r[0]}>{r.map((x, i) => <td key={i}>{x}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <span className="af-sku-src">{c.skuSource}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
