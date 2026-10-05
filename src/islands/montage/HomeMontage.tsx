// Montaje «Preguntá. Entendé. Actuá.» de la home (spec 006 §4). Port de «Home Montage.dc.html» («M»).
// Un lienzo fijo (1280×720, o 640×800 en angosto) escalado al ancho del contenedor. El lienzo es decorativo
// (aria-hidden); lo mismo se cuenta en un resumen .sr-only por escena.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '../../i18n/routes';
import { Mark } from '../noctiapp/shell/Mark';
import { montage } from './data';
import './montage.css';

const DUR = [8000, 8000, 9000];
const SPEED = 1.2;
const TICK = 60;
const NARROW = 640;
const MARGIN = [31.3, 31.5, 31.2, 31.6, 31.4, 31.7, 31.3, 31.5, 31.8, 31.4, 31.4, 28.2];

const cl = (v: number) => Math.max(0, Math.min(1, v));
const on = (t: number, a: number) => ({ opacity: t >= a ? 1 : 0, transform: t >= a ? 'none' : 'translateY(10px)' });

// Estados de los nodos de la escena 3: fondo, borde, texto, halo, color del label.
const NS = {
  pend: ['#FFFFFF', '#D9D9D4', '#8A8A86', 'none', '#8A8A86'],
  run: ['#0047FF', '#0047FF', '#FFFFFF', '0 0 0 7px rgba(0,71,255,.16)', '#0B0B0C'],
  wait: ['#F6EBD3', '#C9A13B', '#9A6A0E', '0 0 0 7px rgba(201,161,59,.22)', '#0B0B0C'],
  done: ['#FFFFFF', '#0047FF', '#0047FF', 'none', '#0B0B0C'],
} as const;
type NState = keyof typeof NS;

function Initials({ name, initials, bg }: { name: string; initials: string; bg: string }) {
  return <span className="hm-av" style={{ background: bg }} title={name}>{initials}</span>;
}

export default function HomeMontage({ locale }: { locale: Locale }) {
  const c = montage[locale];
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ms, setMs] = useState(0);
  const [mt, setMt] = useState(0);
  const [loop, setLoop] = useState(0);
  const [paused, setPaused] = useState(false);
  const [vis, setVis] = useState(false);
  // null hasta medir el contenedor: antes de eso el marco reserva su alto con CSS (aspect-ratio) y no se dibuja el lienzo.
  const [bw, setBw] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const clock = useRef({ ms: 0, mt: 0, loop: 0 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    setBw(Math.round(el.clientWidth));
    const ro = new ResizeObserver(([e]) => { if (e) setBw(Math.round(e.contentRect.width)); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVis(true); return; }
    const io = new IntersectionObserver(([e]) => setVis(!!e?.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) { clock.current.mt = DUR[clock.current.ms]!; setMt(clock.current.mt); }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Un solo intervalo, y solo mientras se ve, no está pausado y no hay reduced motion.
  useEffect(() => {
    if (reduced || paused || !vis) return;
    const id = window.setInterval(() => {
      const k = clock.current;
      k.mt += TICK * SPEED;
      if (k.mt >= DUR[k.ms]!) { k.mt = 0; k.ms = (k.ms + 1) % 3; if (k.ms === 0) k.loop++; }
      setMs(k.ms); setMt(k.mt); setLoop(k.loop);
    }, TICK);
    return () => window.clearInterval(id);
  }, [reduced, paused, vis]);

  const go = useCallback((i: number) => {
    const k = clock.current;
    k.ms = i; k.mt = reduced ? DUR[i]! : 0;
    setMs(k.ms); setMt(k.mt);
  }, [reduced]);

  const w = bw ?? 0, mob = bw !== null && bw < NARROW;
  const cw = mob ? 640 : 1280, ch = mob ? 800 : 720, sc = w / cw;
  const pad = mob ? '40px 36px' : '56px 72px';
  const T = (k: number) => (k === ms ? mt : DUR[k]!);
  const layer = (k: number): CSSProperties => ({ padding: pad, opacity: k === ms ? 1 : 0, transform: k === ms ? 'scale(1)' : 'scale(1.035)' });

  // Escena 1
  const t1 = T(0), r1 = c.s1.personas[loop % 2]!;
  const typedN = Math.round(cl((t1 - 400) / 1600) * r1.q.length), sent = t1 >= 2300, typing = !sent && typedN > 0;

  // Escena 2
  const t2 = T(1), X = (i: number) => (i / 11) * 500, Y = (v: number) => (1 - (v - 27) / 5) * 240;
  const path = MARGIN.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  const lp = cl((t2 - 300) / 1900), drawn = lp >= 1, mx = ((10 / 11) * 100).toFixed(2) + '%';
  const btnOn = t2 >= 5000;

  // Escena 3
  const t3 = T(2);
  const nst = (i: number): NState => i === 0 ? (t3 < 200 ? 'pend' : t3 < 900 ? 'run' : 'done')
    : i === 1 ? (t3 < 900 ? 'pend' : t3 < 1600 ? 'run' : 'done')
    : i === 2 ? (t3 < 1600 ? 'pend' : t3 < 2100 ? 'run' : t3 < 5500 ? 'wait' : 'done')
    : (t3 < 5800 ? 'pend' : t3 < 6600 ? 'run' : 'done');
  const okA = t3 >= 5500, fin = t3 >= 6600, pressed = t3 >= 4300 && t3 < 4700, approved = t3 >= 4700;
  const st = fin ? { l: c.s3.status.done, bg: '#EEF6F1', fg: '#2F7D52' }
    : t3 >= 2100 && !okA ? { l: c.s3.status.wait, bg: '#F6EBD3', fg: '#9A6A0E' }
    : { l: c.s3.status.run, bg: '#EEF3FF', fg: '#0038CC' };
  const waitN = t3 >= 2500 && !approved, tabI = t3 < 3700 ? 0 : t3 < 5000 ? 1 : 2;
  const dev = t3 >= 2500;
  const npTag = approved ? { l: c.s3.tag.ok, bg: '#EEF6F1', fg: '#2F7D52' } : waitN ? { l: c.s3.tag.pending, bg: '#F6EBD3', fg: '#9A6A0E' } : { l: c.s3.tag.none, bg: '#F1F1EF', fg: '#8A8A86' };
  const pane = (i: number): CSSProperties => ({ display: mob && i !== tabI ? 'none' : 'flex' });
  const paneH = mob ? 400 : 380;
  const mailDot = approved ? '#2F7D52' : t3 >= 2700 ? '#0047FF' : '#D9D9D4';

  const Pending = ({ second }: { second: string }) => approved
    ? <div className="hm-ok"><span className="hm-ok-dot" />{c.s3.approvedFrom}</div>
    : <div className="hm-btns"><span className="hm-b hm-b-dark">{c.s3.approve}</span><span className="hm-b">{second}</span></div>;

  return (
    <div ref={root} className="home-montage">
      <div ref={box} className="hm-box" style={bw === null ? undefined : { height: Math.round((w * ch) / cw) }} aria-hidden="true">
        {bw !== null && <div className="hm-canvas" style={{ width: cw, height: ch, transform: `scale(${sc.toFixed(4)})` }}>

          {/* Escena 1: Preguntá */}
          <div className="hm-layer hm-l1" style={layer(0)}>
            <div className="hm-s1" style={{ width: mob ? '100%' : 760 }}>
              <div className="hm-s1-panel" style={{ maxHeight: sent ? 640 : 0 }}>
                <div className="hm-col">
                  <div className="hm-q" style={on(t1, 2400)}>
                    <div className="hm-who"><span className="hm-name">{r1.name}</span><Initials name={r1.name} initials={r1.initials} bg={r1.bg} /></div>
                    <div className="hm-bubble">{r1.q}</div>
                  </div>
                  <div className="hm-nocti" style={{ opacity: t1 >= 2700 ? 1 : 0 }}>
                    <Mark size={26} /><span className="hm-name">Nocti</span>
                    <span className="hm-kick hm-blue">{t1 < 3900 ? c.s1.consulting : c.s1.consulted}</span>
                    <div className="hm-chips">{r1.cx.map((l, i) => <span key={l} className="hm-chip" style={on(t1, 2900 + i * 300)}>{l}</span>)}</div>
                  </div>
                  <div className="hm-card" style={{ opacity: t1 >= 3900 ? 1 : 0 }}>
                    <span className="hm-lead" style={on(t1, 3900)}>{r1.lead}</span>
                    {r1.items.map((t, i) => (
                      <div key={i} className="hm-item" style={on(t1, 4300 + i * 380)}><span className="hm-strong">{i + 1}</span><span>{t}</span></div>
                    ))}
                    <div className="hm-cx" style={{ opacity: t1 >= 5500 ? 1 : 0 }}>
                      <span className="hm-muted">{c.s1.connections}</span>
                      {r1.cx.map((x) => <span key={x} className="hm-chip">{x}</span>)}
                    </div>
                    <span className="hm-perm" style={{ opacity: t1 >= 5800 ? 1 : 0 }}><span className="hm-blue hm-strong">✓</span> {r1.perm}</span>
                    <div className="hm-acts" style={on(t1, 6100)}>
                      {r1.acts.map((a, i) => <span key={a} className={'hm-b hm-b-lg' + (i ? '' : ' hm-b-dark')}>{a}</span>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hm-bar" style={{ borderColor: typing ? '#0047FF' : '#E2E2DE' }}>
                <span className="hm-bar-t" style={{ color: typing ? '#0B0B0C' : '#8A8A86' }}>
                  {typing ? r1.q.slice(0, typedN) : c.s1.placeholder}<span className="hm-caret" style={{ opacity: typing ? 1 : 0 }} />
                </span>
                <span className="hm-send" style={{ background: typing ? '#0047FF' : '#A9C4FF' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </span>
              </div>
            </div>
          </div>

          {/* Escena 2: Entendé */}
          <div className="hm-layer hm-l2" style={{ ...layer(1), gridTemplateColumns: mob ? 'minmax(0,1fr)' : '588px minmax(0,1fr)' }}>
            <div className="hm-kpi">
              <div className="hm-kpi-h">
                <span className="hm-kick">{c.s2.kpiLabel}</span>
                <span className="hm-kpi-v">{c.s2.kpi}</span>
                <span className="hm-red">{c.s2.delta}</span>
              </div>
              <div className="hm-chart" style={{ height: mob ? 150 : 240 }}>
                {[32, 31, 30, 29, 28, 27].map((v) => (
                  <div key={v} className="hm-grid" style={{ top: ((Y(v) / 240) * 100).toFixed(2) + '%' }}><span>{v}%</span></div>
                ))}
                <svg viewBox="0 0 500 240" preserveAspectRatio="none" className="hm-svg">
                  <path d={path + ' L500 240 L0 240 Z'} fill="#EEF3FF" style={{ opacity: drawn ? 0.7 : 0, transition: 'opacity .6s' }} />
                  <path d={path} pathLength={100} fill="none" stroke="#0B0B0C" strokeWidth="2" strokeLinejoin="round" strokeDasharray="100" style={{ strokeDashoffset: (100 - lp * 100).toFixed(2) }} />
                  <path d={'M' + X(10).toFixed(1) + ' ' + Y(31.4).toFixed(1) + ' L500 ' + Y(28.2).toFixed(1)} fill="none" stroke="#0047FF" strokeWidth="3" strokeLinecap="round" style={{ opacity: drawn ? 1 : 0, transition: 'opacity .4s' }} />
                </svg>
                <div className="hm-mark" style={{ left: mx, opacity: t2 >= 2500 ? 1 : 0 }} />
                <div className="hm-anom" style={{ left: mx, opacity: t2 >= 2500 ? 1 : 0 }}><span className="hm-anom-k">{c.s2.anomaly}</span><span>{c.s2.anomalyText}</span></div>
                <div className="hm-last" style={{ top: ((Y(28.2) / 240) * 100).toFixed(2) + '%', opacity: drawn ? 1 : 0 }} />
              </div>
              <div className="hm-tx" style={{ transform: t2 >= 5600 ? 'translateY(0)' : 'translateY(105%)' }}>
                <span className="hm-crumbs">{c.s2.crumbs[0]} → {c.s2.crumbs[1]} → <span className="hm-ink">{c.s2.crumbs[2]}</span></span>
                {c.s2.tx.map(([cl_, p, d, m, id]) => (
                  <div key={id} className="hm-tx-r">
                    <span className="hm-tx-c"><span>{cl_}</span><span className="hm-chip hm-chip-xs">{c.s2.txSource} · {id}</span></span>
                    <span className="hm-body2">{p}</span><span className="hm-r hm-muted">{d}</span><span className="hm-r hm-strong hm-red">{m}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hm-col">
              <div className="hm-q2" style={on(t2, 900)}><div className="hm-bubble">{c.s2.q}</div><Initials {...c.s2.asker} /></div>
              <div className="hm-nocti" style={{ opacity: t2 >= 1400 ? 1 : 0 }}><Mark size={26} /><span className="hm-name">Nocti</span></div>
              <div className="hm-card hm-card-tight" style={{ opacity: t2 >= 1400 ? 1 : 0 }}>
                <span className="hm-lead2" style={{ opacity: t2 >= 1600 ? 1 : 0 }}>{c.s2.lead}</span>
                {c.s2.causes.map(([t, pp, l, w], i) => {
                  const v = t2 >= 2900 + i * 500;
                  return (
                    <div key={t} className="hm-cause" style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(10px)' }}>
                      <div className="hm-cause-h"><span>{t}</span><span className="hm-strong hm-red">{pp}</span></div>
                      <div className="hm-track"><span style={{ left: l + '%', width: v ? w + '%' : '0%' }} /></div>
                    </div>
                  );
                })}
                <div className="hm-total" style={{ opacity: t2 >= 4400 ? 1 : 0 }}><span>{c.s2.total}</span><span className="hm-red">{c.s2.totalV}</span></div>
                <div className="hm-acts" style={{ opacity: t2 >= 4400 ? 1 : 0 }}>
                  <span className="hm-b hm-b-lg" style={{ background: btnOn ? '#EEF3FF' : '#EDEDEA', color: btnOn ? '#0038CC' : '#0B0B0C', boxShadow: btnOn ? '0 0 0 2px #0047FF' : 'none' }}>{c.s2.btn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Escena 3: Actuá */}
          <div className="hm-layer hm-l3" style={layer(2)}>
            <div className="hm-agent">
              <div className="hm-agent-h">
                <div className="hm-agent-n">
                  <span className="hm-bot"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM2 14h2M20 14h2M9 13v2M15 13v2" /></svg></span>
                  <span className="hm-agent-t">{c.s3.agent}</span>
                </div>
                <div className="hm-agent-s">
                  <span className="hm-stamp" style={{ opacity: t3 >= 7000 ? 1 : 0, transform: t3 >= 7000 ? 'scale(1)' : 'scale(.85)' }}>{c.s3.stamp}</span>
                  <span className="hm-pill" style={{ background: st.bg, color: st.fg }}><span className="hm-pill-d" style={{ background: st.fg }} />{st.l}</span>
                </div>
              </div>
              <div className="hm-steps" style={{ gap: mob ? 8 : 16 }}>
                {c.s3.steps.map((t, i) => {
                  const k = nst(i), s = NS[k], ap = i === 2 && k === 'done';
                  return (
                    <div key={i} className="hm-step" style={{ flexDirection: mob ? 'column' : 'row', textAlign: mob ? 'center' : 'left' }}>
                      <span className="hm-node" style={{ background: ap ? '#EEF6F1' : s[0], borderColor: ap ? '#6FAE88' : s[1], color: ap ? '#2F7D52' : s[2], boxShadow: s[3] }}>{k === 'done' ? '✓' : i + 1}</span>
                      <span style={{ fontSize: mob ? 12 : 14, color: ap ? '#1F5A3A' : s[4] }}>{ap ? c.s3.approvedStep : t}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {mob && (
              <div className="hm-tabs" style={{ opacity: dev ? 1 : 0 }}>
                {c.s3.tabs.map((l, i) => <span key={l} className={'hm-tab' + (i === tabI ? ' is-on' : '')}>{l}</span>)}
              </div>
            )}
            <div className="hm-panes" style={{ gridTemplateColumns: mob ? 'minmax(0,1fr)' : 'repeat(3,minmax(0,1fr))', opacity: dev ? 1 : 0, transform: dev ? 'none' : 'translateX(40px)' }}>
              <div className="hm-pane" style={pane(0)}>
                <span className="hm-kick hm-kick-xs">{c.s3.panelLabel}</span>
                <div className="hm-np" style={{ height: paneH }}>
                  <div className="hm-np-h"><Mark size={22} /><span className="hm-np-t">{c.s3.approvals}</span><span className="hm-tag" style={{ background: npTag.bg, color: npTag.fg }}>{npTag.l}</span></div>
                  <div className="hm-np-card" style={{ borderColor: approved ? '#CFE3D6' : '#E3C46F', background: approved ? '#F5FBF7' : '#FFFDF6' }}>
                    <span className="hm-kick hm-kick-xxs" style={{ color: approved ? '#2F7D52' : '#9A6A0E' }}>{approved ? c.s3.approved : c.s3.need}</span>
                    <span className="hm-order">{c.s3.order}</span>
                    <span className="hm-rule">{c.s3.rule}</span>
                    <div className="hm-chips hm-chips-wrap">{c.s3.sources.map((s) => <span key={s} className="hm-chip hm-chip-xs">{s}</span>)}</div>
                    <div className="hm-push"><Pending second={c.s3.reject} /></div>
                  </div>
                </div>
              </div>
              <div className="hm-pane" style={pane(1)}>
                <span className="hm-kick hm-kick-xs">{c.s3.wa.label}</span>
                <div className="hm-phone" style={{ height: paneH }}>
                  <div className="hm-screen">
                    <div className="hm-wa-h">
                      <span className="hm-wa-av"><Mark size={18} /></span>
                      <div className="hm-wa-who"><span className="hm-wa-n">{c.s3.wa.name}</span><span className="hm-wa-o">{c.s3.wa.online}</span></div>
                      <span className="hm-kick hm-kick-xxs hm-wa-l">{c.s3.wa.label}</span>
                    </div>
                    <div className="hm-wa-body">
                      {t3 >= 2700 && t3 < 3400 && <div className="hm-typing"><span /><span /><span /></div>}
                      {t3 >= 3400 && (
                        <div className="hm-wa-msg">
                          <div className="hm-wa-b"><span className="hm-w600">{c.s3.wa.from}</span><span className="hm-strong">{c.s3.order}</span><span className="hm-body2">{c.s3.wa.text}</span></div>
                          {c.s3.wa.qr.map((l, i) => (
                            <div key={l} className="hm-qr" style={{ background: i === 0 && (pressed || approved) ? '#D7E3FF' : '#FFFFFF', transform: i === 0 && pressed ? 'scale(.97)' : 'none' }}>{l}</div>
                          ))}
                        </div>
                      )}
                      {approved && <div className="hm-reply">{c.s3.wa.reply}</div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hm-pane" style={pane(2)}>
                <span className="hm-kick hm-kick-xs">{c.s3.mail.label}</span>
                <div className="hm-mail" style={{ height: paneH }}>
                  <div className="hm-mail-h"><span className="hm-mail-d" style={{ background: mailDot }} /><span className="hm-w600">{c.s3.mail.inbox}</span></div>
                  <span><span className="hm-muted">{c.s3.mail.fromK}</span> {c.s3.mail.from}</span>
                  <span><span className="hm-muted">{c.s3.mail.toK}</span> {c.s3.mail.to}</span>
                  <span className="hm-w600 hm-subj">{c.s3.mail.subject}</span>
                  <span className="hm-body2">{c.s3.mail.body}</span>
                  <div className="hm-push"><Pending second={c.s3.mail.review} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>

      <div className="sr-only">{c.summary.map((s, i) => <p key={i}>{s}</p>)}</div>

      <div className="hm-ctrl">
        <div className="hm-segs">
          {c.segs.map((l, i) => {
            const w = i < ms ? 100 : i === ms ? (mt / DUR[ms]!) * 100 : 0;
            return (
              <button key={l} type="button" className="hm-seg" aria-pressed={i === ms} aria-label={`${c.goTo}: ${l}`} onClick={() => go(i)}>
                <span className="hm-seg-track"><span style={{ width: w.toFixed(1) + '%' }} /></span>
                <span className="hm-seg-l" style={{ color: i === ms ? 'var(--ink)' : 'var(--muted)' }}>{l}</span>
              </button>
            );
          })}
        </div>
        {!reduced && (
          <button type="button" className="hm-play" aria-label={paused ? c.play : c.pause} onClick={() => setPaused((p) => !p)}>
            {paused
              ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
              : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" /></svg>}
          </button>
        )}
      </div>
    </div>
  );
}
