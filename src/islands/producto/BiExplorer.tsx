// Explorador de Inteligencia de Producto (spec 007 §3.2; V4 L324–463 y biVals/biPlay/biAuto).
// Al entrar en pantalla recorre las tres preguntas de ejemplo (10 s cada una); elegir una corta el recorrido.
// KPIs clicables, períodos, gráfico de línea (o barras en stock crítico), causas con hover, bajada a
// transacciones y creación de alerta.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '../../i18n/routes';
import { Mark } from '../noctiapp/shell/Mark';
import { BI, type Kpi } from './biData';
import './bi.css';

const P = (v: number) => v.toFixed(2);
const tone = (t: Kpi['t']) => (t === 'neg' ? '#A84A3E' : t === 'pos' ? '#2F7D52' : 'var(--muted)');
const spark = (arr: number[]) => {
  const mn = Math.min(...arr), mx = Math.max(...arr), r = mx - mn || 1;
  return arr.map((v, i) => (i ? 'L' : 'M') + ((i / (arr.length - 1)) * 100).toFixed(1) + ' ' + (22 - ((v - mn) / r) * 20).toFixed(1)).join(' ');
};
const STEP = 260;
const AUTO = 10000;

function useMq(q: string, init: boolean) {
  const [m, setM] = useState(init);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}

export default function BiExplorer({ locale }: { locale: Locale }) {
  const c = BI[locale];
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<{ st?: number; a1?: number; a2?: number }>({});
  const lastLine = useRef<Kpi>(c.kpis[1]!);
  const wide = useMq('(min-width: 1000px)', true);
  const mobile = useMq('(max-width: 767.98px)', false);
  const [qi, setQi] = useState(0);
  const [ki, setKi] = useState<number | null>(null);
  const [per, setPer] = useState(1);
  const [ln, setLn] = useState(99);
  const [dr, setDr] = useState(false);
  const [alert, setAlert] = useState(false);
  const [hov, setHov] = useState<number | null>(null);
  const [selC, setSelC] = useState<number | null>(null);
  const [cortes, setCortes] = useState(false);

  const play = (q: number) => {
    const T = timers.current;
    window.clearInterval(T.st);
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setQi(q); setKi(c.qs[q]!.kpi); setLn(rm ? 99 : 0); setDr(false); setAlert(false); setHov(null); setSelC(null); setPer(1);
    if (rm) return;
    let k = 0;
    T.st = window.setInterval(() => { k++; setLn(k); if (k >= 10) window.clearInterval(T.st); }, STEP);
  };
  const stopAuto = () => { window.clearTimeout(timers.current.a1); window.clearTimeout(timers.current.a2); };

  useEffect(() => {
    const el = root.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => {
        if (!e?.isIntersecting) return;
        io?.disconnect();
        play(0);
        timers.current.a1 = window.setTimeout(() => { play(1); timers.current.a2 = window.setTimeout(() => play(2), AUTO); }, AUTO);
      }, { threshold: 0.3 });
      io.observe(el);
    }
    return () => { io?.disconnect(); stopAuto(); window.clearInterval(timers.current.st); };
  }, []);

  const Q = c.qs[qi]!;
  const kSel = ki ?? Q.kpi;
  const K = c.kpis[kSel]!;
  const bars = !!K.bars;
  const hc = hov ?? selC;
  const vis = (i: number): CSSProperties => ({ opacity: ln >= i ? 1 : 0, transform: ln >= i ? 'none' : 'translateY(6px)' });

  // Gráfico de línea: con barras conserva la última línea mostrada.
  const L = bars ? lastLine.current : K;
  if (!bars) lastLine.current = K;
  let ser = L.s, off = 0;
  if (!bars) {
    if (per === 0) { ser = L.s.slice(-4); off = L.s.length - 4; }
    if (per === 2) { ser = L.s.slice(0, 10).concat(L.s.slice(1, 5)).concat(L.s); off = -14; }
  }
  const n = ser.length, [y0, y1, st] = L.y!, X = (i: number) => (i / (n - 1)) * 100, Y = (v: number) => (1 - (v - y0) / (y1 - y0)) * 100;
  const path = ser.map((v, i) => (i ? 'L' : 'M') + P(X(i)) + ' ' + P(Y(v))).join(' ');
  const yLabel = (v: number) => L.unit === 'M' ? (locale === 'es' ? `$${Math.round(v)} M` : `$${Math.round(v)}M`) : L.unit === '%' ? `${Math.round(v)}%` : `${Math.round(v)}`;
  const ticks: { l: string; top: string }[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += st) ticks.push({ l: yLabel(v), top: P(Y(v)) + '%' });
  const mi = L.mk ? L.mk.i - off : -1, mOn = !bars && !!L.mk && mi >= 0 && mi < n;
  const mk = L.mk || { label: '', t: '', c: '#0038CC', bd: '#A9C4FF' };
  const hi = 'M' + P(X(n - 2)) + ' ' + P(Y(ser[n - 2]!)) + ' L' + P(X(n - 1)) + ' ' + P(Y(ser[n - 1]!));
  const dStyle = (d: string): CSSProperties => ({ d: `path('${d}')` } as CSSProperties);

  const nItems = Q.items.length, iT = 2 + nItems, iM = iT + (Q.total ? 1 : 0), iS = iM + 1, iC = iS + 1, iA = iC + 1;
  const areas = wide ? '"chart qa" "chart act"' : mobile ? '"qa" "chart" "cortes" "act"' : '"chart" "qa" "act"';
  const chip = (on: boolean) => ({ background: on ? '#0B0B0C' : 'transparent', color: on ? '#FFFFFF' : 'var(--body-2)' });

  const Filters = () => (
    <>
      {c.cuts.map((cu) => {
        const on = Q.cuts.includes(cu);
        return (
          <span key={cu} className="bi-cut" style={{ background: on ? '#0B0B0C' : '#FFFFFF', color: on ? '#FFFFFF' : '#0B0B0C', borderColor: on ? '#0B0B0C' : '#E2E2DE' }}>
            {on ? `${cu}: ${c.cutVals[cu]}` : cu}<span className="bi-cut-ic" aria-hidden="true">{on ? '×' : '▾'}</span>
          </span>
        );
      })}
    </>
  );
  const TxRows = () => (
    <>
      {c.tx.map(([f, cl, p, q, pr, d, m, id]) => (
        <div key={id} className="bi-tx-r">
          <span className="bi-muted">{f}</span>
          <span className="bi-tx-c"><span>{cl}</span><span className="bi-src bi-src-xs">{c.txSource} · {id}</span></span>
          <span>{p}</span><span className="bi-r">{q}</span><span className="bi-r">{pr}</span><span className="bi-r">{d}</span><span className="bi-r bi-strong bi-red">{m}</span>
        </div>
      ))}
    </>
  );

  return (
    <div className="bi" ref={root}>
      <ul className="bi-caps">{c.caps.map((f) => <li key={f}>{f}</li>)}</ul>
      <div className="bi-frame">
        <div className="bi-app">
          <div className="bi-top">
            <div className="bi-brand"><Mark size={22} /><span className="bi-app-n">{c.app}</span><span className="bi-co">{c.company}</span></div>
            <span className="bi-live"><span className="bi-live-d" />{wide ? c.live : c.liveShort}</span>
          </div>

          <div className={'bi-kpis' + (mobile ? ' is-scroll' : '')}>
            {c.kpis.map((x, i) => {
              const on = i === kSel;
              return (
                <button key={x.k} type="button" className="bi-kpi" aria-pressed={on} onClick={() => { setKi(i); setDr(false); }} style={{ borderColor: on ? '#0047FF' : '#E2E2DE', boxShadow: on ? '0 0 0 1px #0047FF' : 'none' }}>
                  <span className="bi-kpi-k">{x.k}</span>
                  <span className="bi-kpi-v">{x.v}</span>
                  <span className="bi-kpi-d" style={{ color: tone(x.t) }}>{x.d}</span>
                  <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="bi-spark" aria-hidden="true"><path d={spark(x.s)} fill="none" stroke={on ? '#0047FF' : '#A3A39E'} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
                  {x.anom && <span className="bi-anom"><span className="bi-anom-d" />{c.anomaly}</span>}
                </button>
              );
            })}
          </div>

          {!mobile && <div className="bi-cuts"><span className="bi-mono">{c.cutsLabel}</span><Filters /></div>}

          <div className="bi-grid" style={{ gridTemplateColumns: wide ? 'minmax(0,1.1fr) minmax(0,1fr)' : 'minmax(0,1fr)', gridTemplateAreas: areas }}>
            <div className="bi-chart">
              <div className="bi-chart-h">
                <div className="bi-chart-kv">
                  <span className="bi-mono">{K.k}</span>
                  <span className="bi-big">{K.v}</span>
                  <span className="bi-13" style={{ color: tone(K.t) }}>{K.d}</span>
                </div>
                {!bars && (
                  <div className="bi-per" role="group">
                    {c.periods.map((l, i) => <button key={l} type="button" className="bi-per-b" aria-pressed={i === per} onClick={() => setPer(i)} style={chip(i === per)}>{l}</button>)}
                  </div>
                )}
              </div>
              <div className="bi-chart-t"><span className="bi-mono bi-mono-s">{K.title}</span>{bars && <span className="bi-risk">{c.barsRisk}</span>}</div>
              <div className="bi-plot" style={{ minHeight: mobile ? 220 : 240 }} aria-hidden="true">
                <div className="bi-plot-in">
                  <div className="bi-line" style={{ opacity: bars ? 0 : 1 }}>
                    {ticks.map((y) => <div key={y.l + y.top} className="bi-ytick" style={{ top: y.top }}><span>{y.l}</span></div>)}
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bi-svg">
                      <path className="bi-area" d={path + ' L100 100 L0 100 Z'} style={dStyle(path + ' L100 100 L0 100 Z')} />
                      <path className="bi-path" d={path} style={dStyle(path)} />
                      <path className="bi-hi" d={hi} style={{ ...dStyle(hi), stroke: L.hiC || '#0B0B0C' }} />
                    </svg>
                    <div className="bi-mk-l" style={{ left: P(mOn ? X(mi) : X(n - 1)) + '%', borderColor: mk.c, opacity: mOn ? 0.6 : 0 }} />
                    <div className="bi-mk-d" style={{ left: P(mOn ? X(mi) : X(n - 1)) + '%', top: P(mOn ? Y(ser[mi]!) : Y(ser[n - 1]!)) + '%', borderColor: mk.c, opacity: mOn ? 1 : 0 }} />
                    <div className="bi-mk-t" style={{ left: P(mOn ? X(mi) : X(n - 1)) + '%', borderColor: mk.bd, opacity: mOn ? 1 : 0 }}><span className="bi-mk-k" style={{ color: mk.c }}>{mk.label}</span><span>{mk.t}</span></div>
                    <div className="bi-last" style={{ left: P(X(n - 1)) + '%', top: P(Y(ser[n - 1]!)) + '%', background: L.hiC || '#0047FF' }} />
                  </div>
                  <div className="bi-bars" style={{ opacity: bars ? 1 : 0 }}>
                    <div className="bi-ten"><span>{c.tenDays}</span></div>
                    {c.bars.map(([l, d], i) => (
                      <div key={i} className="bi-bar"><span className="bi-bar-l">{l}</span><span className="bi-bar-v" style={{ width: bars ? ((d / 14) * 100).toFixed(1) + '%' : '0%', background: d < 10 ? '#C9786B' : '#C9C9C4', transitionDelay: i * 35 + 'ms' }} /></div>
                    ))}
                  </div>
                </div>
                <div className="bi-x" style={{ opacity: bars ? 0 : 1 }}><span>{c.x0[per]}</span><span>{c.thisWeek}</span></div>
              </div>
              {!mobile && (
                <div className="bi-drawer" style={{ transform: dr ? 'translateX(0)' : 'translateX(104%)' }} aria-hidden={!dr} inert={!dr}>
                  <div className="bi-between">
                    <div className="bi-crumbs"><span>{c.crumbs[0]}</span><span className="bi-arr">→</span><span>{c.crumbs[1]}</span><span className="bi-arr">→</span><span className="bi-ink">{c.crumbs[2]}</span></div>
                    <button type="button" className="bi-close" aria-label={c.close} onClick={() => setDr(false)}>×</button>
                  </div>
                  <span className="bi-tx-t">{c.txTitle}</span>
                  <div className="bi-tx">
                    <div className="bi-tx-h">{c.txH.map((h, i) => <span key={h} className={i > 2 ? 'bi-r' : ''}>{h}</span>)}</div>
                    <TxRows />
                  </div>
                  <span className="bi-mono bi-foot">{c.txFoot}</span>
                </div>
              )}
            </div>

            <div className="bi-qa">
              <div className="bi-ex">
                <span className="bi-mono">{c.examples}</span>
                <div className={'bi-qs' + (mobile ? ' is-row' : '')}>
                  {c.qs.map((x, i) => {
                    const on = i === qi;
                    return <button key={x.q} type="button" className="bi-q" aria-pressed={on} onClick={() => { stopAuto(); play(i); }} style={{ background: on ? '#0B0B0C' : '#FFFFFF', color: on ? '#FFFFFF' : '#0B0B0C', borderColor: on ? '#0B0B0C' : '#D9D9D4', whiteSpace: mobile ? 'nowrap' : 'normal' }}>{x.q}</button>;
                  })}
                </div>
              </div>
              <div className="bi-ask" style={vis(0)}>
                <div className="bi-who"><span className="bi-13 bi-strong">{c.asker}</span><span className="bi-av" aria-hidden="true">LM</span></div>
                <div className="bi-bubble">{Q.q}</div>
              </div>
              <div className="bi-nocti" style={{ opacity: ln >= 1 ? 1 : 0 }}><Mark size={22} /><span className="bi-13 bi-strong">Nocti</span></div>
              <div className="bi-ans" aria-live="polite">
                <span className="bi-14" style={vis(1)}>{Q.lead}</span>
                {nItems > 0 && (
                  <div className="bi-items">
                    {Q.items.map((it, i) => {
                      const on = hc === i && !!it.bar;
                      const Tag = it.bar ? 'button' : 'div';
                      return (
                        <Tag
                          key={it.t}
                          {...(it.bar ? { type: 'button' as const, 'aria-pressed': selC === i, onClick: () => setSelC((x) => (x === i ? null : i)) } : {})}
                          className={'bi-item' + (it.bar ? ' is-btn' : '')}
                          onMouseEnter={() => it.bar && setHov(i)}
                          onMouseLeave={() => setHov(null)}
                          style={{ ...vis(2 + i), background: on ? '#F5F8FF' : 'transparent' }}
                        >
                          <span className="bi-item-n">{it.pos ? <span className="bi-pos" /> : i + 1}</span>
                          <span className="bi-item-b">
                            <span><strong>{it.t}</strong>{it.pp && <> <span className="bi-pp">{it.pp}</span></>} — {it.d}</span>
                            {it.bar && <span className="bi-ibar"><span style={{ left: it.bar[0] + '%', width: it.bar[1] + '%', background: on ? '#0047FF' : hc == null ? '#7FA3FF' : '#D6E1FF' }} /></span>}
                          </span>
                        </Tag>
                      );
                    })}
                    {Q.total && <div className="bi-total" style={{ opacity: ln >= iT ? 1 : 0 }}><span>{c.total}</span><span className="bi-red">{c.totalV}</span></div>}
                  </div>
                )}
                <div className="bi-row" style={vis(iM)}><span className="bi-lbl">{c.metrics}</span>{Q.metrics.map(([v, l]) => <span key={l} className="bi-metric"><strong>{v}</strong><span>{l}</span></span>)}</div>
                <div className="bi-row" style={{ opacity: ln >= iS ? 1 : 0 }}>
                  <span className="bi-lbl">{c.segments}</span>
                  {Q.segs.map((l, i) => {
                    const on = hc != null && Q.items[hc]?.seg === i;
                    return <span key={l} className="bi-seg" style={{ background: on ? '#0047FF' : '#EEF3FF', color: on ? '#FFFFFF' : '#0038CC', borderColor: on ? '#0047FF' : '#A9C4FF' }}>{l}</span>;
                  })}
                </div>
                <div className="bi-row" style={{ opacity: ln >= iC ? 1 : 0 }}><span className="bi-lbl">{c.connections}</span>{Q.src.map((x) => <span key={x} className="bi-src">{x}</span>)}</div>
              </div>
            </div>

            {mobile && (
              <div className="bi-cortes-m">
                <button type="button" className="bi-cortes-b" aria-expanded={cortes} onClick={() => setCortes((x) => !x)}>
                  <span>{Q.cuts.length ? c.cutsApplied(Q.cuts.length) : c.cutsLabel}</span><span className="bi-mono" aria-hidden="true">{cortes ? '▴' : '▾'}</span>
                </button>
                {cortes && <div className="bi-cuts-w"><Filters /></div>}
              </div>
            )}

            <div className="bi-act" style={vis(iA)}>
              <div className="bi-act-g"><span className="bi-mono">{c.down}</span>
                <div className="bi-btns">{Q.down.map((d) => <button key={d.l} type="button" className="bi-btn" onClick={d.tx ? () => { setDr(true); setKi(1); } : undefined}>{d.l}</button>)}</div>
              </div>
              <div className="bi-act-g"><span className="bi-mono">{c.act}</span>
                <div className="bi-btns">{Q.act.map((d, i) => <button key={d.l} type="button" className={'bi-btn' + (i === 0 ? ' bi-btn-dark' : '')} onClick={d.alert ? () => setAlert(true) : undefined}>{d.l}</button>)}</div>
              </div>
              {alert && <div className="bi-alert" role="status"><span className="bi-alert-d" />{c.alert}</div>}
            </div>
          </div>
        </div>
      </div>
      <p className="bi-caption">{c.caption}</p>

      {mobile && dr && (
        <div className="bi-sheet" role="dialog" aria-modal="true" aria-label={c.txTitle}>
          <div className="bi-between"><span className="bi-mono bi-crumb-s">{c.crumbs[0]} → {c.crumbs[1]} → <span className="bi-ink">{c.crumbs[2]}</span></span><button type="button" className="bi-close bi-close-l" aria-label={c.close} onClick={() => setDr(false)} autoFocus>×</button></div>
          <span className="bi-sheet-t">{c.txTitle}</span>
          {c.tx.map(([f, cl, p, q, pr, d, m, id]) => (
            <div key={id} className="bi-sheet-r">
              <div className="bi-between"><span className="bi-strong">{cl}</span><span className="bi-strong bi-red">{m}</span></div>
              <span className="bi-muted">{f} · {p} · {q} {c.units} · {pr} · {c.disc} {d}</span>
              <span className="bi-src bi-src-xs">{c.txSource} · {id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
