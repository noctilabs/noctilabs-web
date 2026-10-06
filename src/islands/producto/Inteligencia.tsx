// Inteligencia de Producto (spec 007 §3.C, v4 «Producto · Inteligencia»): tablero de KPIs, gráfico con cortes y períodos,
// chat con preguntas de ejemplo y acciones. Al entrar en pantalla recorre las tres preguntas cada 10 s, una sola vez (v4 biAuto).
// F5: «Pausar avance» detiene el recorrido; con reduced motion no avanza solo, el chat aparece completo y no hay transiciones.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import './inteligencia.css';
import { Mark } from '../noctiapp/shell/Mark';
import type { Locale } from '../noctiapp/data/types';
import { BI, type Kpi } from './bi-data';
import { useMounted, useReducedMotion } from './shared';

const AUTO_MS = 10_000;
const LINE_MS = 260;
const tone = (t: Kpi['t']) => (t === 'neg' ? 'is-neg' : t === 'pos' ? 'is-pos' : '');
const P = (v: number) => v.toFixed(2);
// Preferencia vigente, para no iniciar ni programar avances con reduced motion activado después de montar.
const reducedNow = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function spark(arr: number[]) {
  const mn = Math.min(...arr), mx = Math.max(...arr), r = mx - mn || 1;
  return arr.map((v, i) => (i ? 'L' : 'M') + ((i / (arr.length - 1)) * 100).toFixed(1) + ' ' + (22 - ((v - mn) / r) * 20).toFixed(1)).join(' ');
}

function tickLabel(v: number, unit: Kpi['unit'], locale: Locale) {
  const n = Math.round(v);
  if (unit === 'mill') return locale === 'es' ? `$${n} M` : `$${n}M`;
  if (unit === 'pct') return locale === 'es' ? `${n} %` : `${n}%`;
  return String(n);
}

export default function Inteligencia({ locale }: { locale: Locale }) {
  const t = BI[locale];
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const [qi, setQi] = useState(0);
  const [ki, setKi] = useState(t.qs[0]!.kpi);
  const [per, setPer] = useState(1);
  const [ln, setLn] = useState(99);
  const [drawer, setDrawer] = useState(false);
  const [alert, setAlert] = useState(false);
  const [hov, setHov] = useState<number | null>(null);
  const [selC, setSelC] = useState<number | null>(null);
  const [cortes, setCortes] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [auto, setAuto] = useState<'idle' | 'on' | 'paused' | 'done'>('idle');

  const root = useRef<HTMLDivElement>(null);
  const lastLine = useRef(t.qs[0]!.kpi);
  const lineT = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const autoT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoLeft = useRef(AUTO_MS);
  const autoAt = useRef(0);
  const autoQ = useRef(0);
  const io = useRef<IntersectionObserver | undefined>(undefined);
  const txBtn = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);

  const play = useCallback((q: number, animate: boolean) => {
    clearInterval(lineT.current);
    setQi(q);
    setKi(t.qs[q]!.kpi);
    setDrawer(false);
    setAlert(false);
    setHov(null);
    setSelC(null);
    setPer(1);
    if (!animate) { setLn(99); return; }
    setLn(0);
    let k = 0;
    lineT.current = setInterval(() => { k++; setLn(k); if (k >= 10) clearInterval(lineT.current); }, LINE_MS);
  }, [t]);

  // Recorrido automático: q0 al entrar, q1 a los 10 s y q2 a los 20 s. Pausable: guarda lo que falta del intervalo.
  const schedule = useCallback(() => {
    clearTimeout(autoT.current);
    if (autoQ.current >= 2 || reducedNow()) { setAuto('done'); return; }
    autoAt.current = Date.now();
    autoT.current = setTimeout(() => {
      if (reducedNow()) { setAuto('done'); return; }
      autoQ.current++;
      autoLeft.current = AUTO_MS;
      play(autoQ.current, true);
      schedule();
    }, autoLeft.current);
  }, [play]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => { if (e) setNarrow(e.contentRect.width < 600); });
    ro.observe(el);
    if (reducedNow() || typeof IntersectionObserver === 'undefined') return () => ro.disconnect();
    const obs = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      obs.disconnect();
      if (reducedNow()) return;
      setAuto('on');
      autoQ.current = 0;
      play(0, true);
      schedule();
    }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
    io.current = obs;
    obs.observe(el);
    return () => { ro.disconnect(); obs.disconnect(); clearTimeout(autoT.current); clearInterval(lineT.current); };
  }, [play, schedule]);

  // Reduced motion activado en el medio: se corta el recorrido (y el disparador pendiente) y todo queda visible.
  useEffect(() => {
    if (!reduced) return;
    io.current?.disconnect();
    clearTimeout(autoT.current);
    clearInterval(lineT.current);
    setLn(99);
    setAuto((a) => (a === 'idle' ? a : 'done'));
  }, [reduced]);

  const stopAuto = () => { clearTimeout(autoT.current); setAuto((a) => (a === 'idle' ? a : 'done')); };
  const togglePause = () => {
    if (auto === 'on') {
      clearTimeout(autoT.current);
      autoLeft.current = Math.max(0, autoLeft.current - (Date.now() - autoAt.current));
      setAuto('paused');
    } else if (auto === 'paused') {
      setAuto('on');
      schedule();
    }
  };
  const ask = (i: number) => { stopAuto(); play(i, !reduced); };

  // Detalle de transacciones: panel sobre el gráfico (ancho) o hoja modal (angosto); el foco va al cerrar y vuelve al botón.
  // Abrirlo, como elegir un KPI o un período, corta el recorrido: el detalle queda abierto hasta que el visitante lo cierre.
  const openTx = (btn: HTMLButtonElement) => { stopAuto(); txBtn.current = btn; setKi(1); setDrawer(true); };
  const closeTx = () => { setDrawer(false); txBtn.current?.focus(); };
  useEffect(() => {
    const d = sheet.current;
    if (!d) return;
    if (drawer && narrow && !d.open) d.showModal();
    if ((!drawer || !narrow) && d.open) d.close();
    if (drawer && !narrow) closeBtn.current?.focus();
  }, [drawer, narrow]);

  const Q = t.qs[qi]!;
  const K = t.kpis[ki]!;
  const bars = !!K.bars;
  if (!bars) lastLine.current = ki;
  const L = t.kpis[bars ? lastLine.current : ki]!;
  let ser = L.s, off = 0;
  if (!bars) {
    if (per === 0) { ser = L.s.slice(-4); off = L.s.length - 4; }
    if (per === 2) { ser = L.s.slice(0, 10).concat(L.s.slice(1, 5)).concat(L.s); off = -14; }
  }
  const n = ser.length;
  const [y0, y1, st] = L.y ?? [0, 1, 1];
  const X = (i: number) => (i / (n - 1)) * 100;
  const Y = (v: number) => (1 - (v - y0) / (y1 - y0)) * 100;
  const path = ser.map((v, i) => (i ? 'L' : 'M') + P(X(i)) + ' ' + P(Y(v))).join(' ');
  const area = path + ' L100 100 L0 100 Z';
  const hi = 'M' + P(X(n - 2)) + ' ' + P(Y(ser[n - 2]!)) + ' L' + P(X(n - 1)) + ' ' + P(Y(ser[n - 1]!));
  const ticks: { l: string; top: string }[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += st) ticks.push({ l: tickLabel(v, L.unit, locale), top: P(Y(v)) + '%' });
  const mi = L.mk ? L.mk.i - off : -1;
  const mOn = !bars && !!L.mk && mi >= 0 && mi < n;
  const mk = L.mk;
  const mx = P(mOn ? X(mi) : X(n - 1)) + '%';
  const my = P(mOn ? Y(ser[mi]!) : Y(ser[n - 1]!)) + '%';
  const vis = (i: number) => (ln >= i ? ' is-in' : '');
  const nItems = Q.items.length;
  const iT = 2 + nItems, iM = iT + (Q.total ? 1 : 0), iS = iM + 1, iC = iS + 1, iA = iC + 1;
  const hc = hov ?? selC;
  const cutsOn = t.cuts.filter(([c]) => Q.cuts.includes(c));

  const cutChips = t.cuts.map(([c, v]) => {
    const on = Q.cuts.includes(c);
    return <li key={c} className={on ? 'is-on' : undefined}>{on ? `${c}: ${v}` : c}<span aria-hidden="true">{on ? '×' : '▾'}</span></li>;
  });

  const txRows = t.tx.map(([f, c, p, q, pr, d, m, id]) => ({ f, c, p, q, pr, d, m, id }));
  const drawerBody = (
    <>
      <div className="bi-dr-h">
        <p className="bi-crumbs">{t.drawer.crumbs.map((c, i) => <span key={c}>{i > 0 && <span className="bi-arrow" aria-hidden="true">→</span>}<span className={i === 2 ? 'is-cur' : undefined}>{c}</span></span>)}</p>
        <button type="button" ref={closeBtn} className="bi-close" aria-label={t.drawer.close} onClick={closeTx}>×</button>
      </div>
      <h4 className="bi-dr-t">{t.drawer.title}</h4>
    </>
  );

  return (
    <div ref={root} className={'pr-bi' + (reduced ? ' is-reduced' : '')}>
      <div className="bi-frame">
        <div className="bi-app">
          <div className="bi-top">
            <div className="bi-brand"><Mark size={22} /><span className="bi-name">{t.title}</span><span className="bi-co">{t.company}</span></div>
            <span className="bi-live"><span className="bi-live-d" aria-hidden="true" /><span className="bi-live-s">{t.live}</span><span className="bi-live-l">{t.liveLong}</span></span>
          </div>

          <div className="bi-kpis" role="group" aria-label={t.kpisLabel}>
            {t.kpis.map((x, i) => (
              <button key={x.k} type="button" className="bi-kpi" aria-pressed={i === ki} disabled={!mounted} onClick={() => { stopAuto(); setKi(i); setDrawer(false); }}>
                <span className="bi-kpi-k">{x.k}</span>
                <span className="bi-kpi-v">{x.v}</span>
                <span className={'bi-kpi-d ' + tone(x.t)}>{x.d}</span>
                <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="bi-spark" aria-hidden="true" focusable="false"><path d={spark(x.s)} vectorEffect="non-scaling-stroke" /></svg>
                {x.anom && <span className="bi-anom"><span aria-hidden="true" />{t.anomaly}</span>}
              </button>
            ))}
          </div>

          <div className="bi-cuts">
            <span className="bi-k">{t.cutsLabel}</span>
            <ul>{cutChips}</ul>
          </div>

          <div className="bi-grid">
            <div className="bi-chart">
              <div className="bi-ch-h">
                <div className="bi-ch-sel">
                  <span className="bi-k">{K.k}</span>
                  <span className="bi-ch-v">{K.v}</span>
                  <span className={'bi-ch-d ' + tone(K.t)}>{K.d}</span>
                </div>
                {!bars && (
                  <div className="bi-per" role="group" aria-label={t.periods.join(' / ')}>
                    {t.periods.map((l, i) => <button key={l} type="button" aria-pressed={i === per} disabled={!mounted} onClick={() => { stopAuto(); setPer(i); }}>{l}</button>)}
                  </div>
                )}
              </div>
              <div className="bi-ch-sub">
                <span className="bi-ch-title">{K.title}</span>
                {bars && <span className="bi-ch-alert">{t.barsAlert}</span>}
              </div>
              <div className="bi-plot" role="img" aria-label={t.chartAlt(K, t.x0[per]!)}>
                <div className="bi-plot-in" aria-hidden="true">
                  <div className={'bi-line' + (bars ? '' : ' is-on')}>
                    {ticks.map((y) => <div key={y.l} className="bi-tick" style={{ top: y.top }}><span>{y.l}</span></div>)}
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bi-svg" focusable="false">
                      <path className="bi-area" d={area} style={{ d: `path('${area}')` } as CSSProperties} />
                      <path className="bi-path" d={path} vectorEffect="non-scaling-stroke" style={{ d: `path('${path}')` } as CSSProperties} />
                      <path className="bi-hi" d={hi} vectorEffect="non-scaling-stroke" style={{ d: `path('${hi}')`, stroke: L.hiC ?? '#0B0B0C' } as CSSProperties} />
                    </svg>
                    <div className={'bi-mk-line' + (mOn ? ' is-on' : '')} style={{ left: mx, borderColor: mk?.c }} />
                    <div className={'bi-mk-dot' + (mOn ? ' is-on' : '')} style={{ left: mx, top: my, borderColor: mk?.c }} />
                    <div className={'bi-mk-tip' + (mOn ? ' is-on' : '')} style={{ left: mx, borderColor: mk?.bd }}>
                      <span style={{ color: mk?.c }}>{mk?.label}</span><span>{mk?.t}</span>
                    </div>
                    <div className="bi-last" style={{ left: P(X(n - 1)) + '%', top: P(Y(ser[n - 1]!)) + '%', background: L.hiC ?? '#0047FF' }} />
                  </div>
                  <div className={'bi-bars' + (bars ? ' is-on' : '')}>
                    <div className="bi-ten"><span>{t.tenDays}</span></div>
                    {t.bars.map(([l, d], i) => (
                      <div key={i} className="bi-bar">
                        <span>{l}</span>
                        <span className={'bi-bar-v' + (d < 10 ? ' is-risk' : '')} style={{ width: bars ? ((d / 14) * 100).toFixed(1) + '%' : '0%', transitionDelay: i * 35 + 'ms' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={'bi-x' + (bars ? '' : ' is-on')} aria-hidden="true"><span>{t.x0[per]}</span><span>{t.xEnd}</span></div>
              </div>
              {!narrow && (
                <div className={'bi-drawer' + (drawer ? ' is-open' : '')} inert={!drawer} aria-hidden={!drawer} onKeyDown={(e) => { if (e.key === 'Escape') closeTx(); }}>
                  {drawerBody}
                  <div className="bi-tx" role="table" aria-label={t.drawer.title}>
                    <div role="row" className="bi-tx-r bi-tx-h">{t.drawer.cols.map((c) => <span key={c} role="columnheader">{c}</span>)}</div>
                    {txRows.map((r) => (
                      <div key={r.id} role="row" className="bi-tx-r">
                        <span role="cell" className="bi-muted">{r.f}</span>
                        <span role="cell" className="bi-tx-c"><span>{r.c}</span><span className="bi-src">ERP · {locale === 'es' ? 'Ventas' : 'Sales'} · {r.id}</span></span>
                        <span role="cell">{r.p}</span><span role="cell">{r.q}</span><span role="cell">{r.pr}</span><span role="cell">{r.d}</span>
                        <span role="cell" className="bi-tx-m">{r.m}</span>
                      </div>
                    ))}
                  </div>
                  <span className="bi-dr-f">{t.drawer.foot}</span>
                </div>
              )}
            </div>

            <div className="bi-qa">
              <div className="bi-qa-q">
                <div className="bi-qa-h">
                  <span className="bi-k">{t.examples}</span>
                  {(auto === 'on' || auto === 'paused') && (
                    <button type="button" className="bi-pause" aria-pressed={auto === 'paused'} onClick={togglePause}>{auto === 'paused' ? t.play : t.pause}</button>
                  )}
                </div>
                <div className="bi-qs">
                  {t.qs.map((x, i) => <button key={x.q} type="button" aria-pressed={i === qi} disabled={!mounted} onClick={() => ask(i)}>{x.q}</button>)}
                </div>
              </div>
              <div className={'bi-ask' + vis(0)}>
                <div className="bi-who"><span>{t.askerName}</span><span className="bi-av" aria-hidden="true">{t.askerInitials}</span></div>
                <p className="bi-bubble">{Q.q}</p>
              </div>
              <div className={'bi-nocti' + vis(1)}><Mark size={22} /><span translate="no">Nocti</span></div>
              <div className="bi-ans">
                <p className={'bi-lead' + vis(1)}>{Q.lead}</p>
                {nItems > 0 && (
                  <div className="bi-items">
                    {Q.items.map((it, i) => {
                      const on = hc === i && !!it.bar;
                      const body = (
                        <>
                          <span className="bi-it-n">{it.pos ? <span className="bi-pos" aria-hidden="true" /> : i + 1}</span>
                          <span className="bi-it-b">
                            <span><strong>{it.t}</strong> {it.pp && <span className="bi-pp">{it.pp}</span>} — {it.d}</span>
                            {it.bar && <span className="bi-it-bar" aria-hidden="true"><span style={{ left: it.bar[0] + '%', width: it.bar[1] + '%' }} className={on ? 'is-on' : hc == null ? '' : 'is-dim'} /></span>}
                          </span>
                        </>
                      );
                      return it.bar ? (
                        <button key={i} type="button" className={'bi-item' + vis(2 + i) + (on ? ' is-on' : '')} aria-pressed={selC === i} disabled={!mounted}
                          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onClick={() => setSelC((s) => (s === i ? null : i))}>{body}</button>
                      ) : (
                        <div key={i} className={'bi-item' + vis(2 + i)}>{body}</div>
                      );
                    })}
                    {Q.total && <div className={'bi-total' + vis(iT)}><span>{t.totalLabel}</span><span className="bi-pp">{t.totalValue}</span></div>}
                  </div>
                )}
                <div className={'bi-row' + vis(iM)}><span className="bi-rl">{t.metrics}</span>{Q.metrics.map(([v, l]) => <span key={l} className="bi-metric"><strong>{v}</strong> {l}</span>)}</div>
                <div className={'bi-row' + vis(iS)}><span className="bi-rl">{t.segments}</span>{Q.segs.map((l, i) => <span key={l} className={'bi-seg' + (hc != null && Q.items[hc]?.seg === i ? ' is-on' : '')}>{l}</span>)}</div>
                <div className={'bi-row' + vis(iC)}><span className="bi-rl">{t.connections}</span>{Q.src.map((x) => <span key={x} className="bi-src">{x}</span>)}</div>
              </div>
            </div>

            <div className="bi-mcuts">
              <button type="button" className="bi-mcuts-b" aria-expanded={cortes} disabled={!mounted} onClick={() => setCortes((c) => !c)}>
                <span>{t.cutsApplied(cutsOn.length)}</span><span aria-hidden="true">{cortes ? '▴' : '▾'}</span>
              </button>
              {cortes && <ul>{cutChips}</ul>}
            </div>

            <div className={'bi-act' + vis(iA)}>
              <div className="bi-act-g">
                <span className="bi-k">{t.down}</span>
                <div>{Q.down.map((l) => <button key={l} type="button" className="bi-btn" disabled={!mounted} onClick={l === t.txAction ? (e) => openTx(e.currentTarget) : undefined}>{l}</button>)}</div>
              </div>
              <div className="bi-act-g">
                <span className="bi-k">{t.act}</span>
                <div>{Q.act.map((l, i) => <button key={l} type="button" className={'bi-btn' + (i === 0 ? ' is-dark' : '')} disabled={!mounted} onClick={l === t.alertAction ? () => setAlert(true) : undefined}>{l}</button>)}</div>
              </div>
              <p className="bi-alert" role="status">{alert && <><span aria-hidden="true" />{t.alert}</>}</p>
            </div>
          </div>
        </div>
      </div>

      <dialog ref={sheet} className="bi-sheet" aria-label={t.drawer.title} onClose={() => { if (drawer) closeTx(); }}>
        {narrow && drawer && (
          <>
            {drawerBody}
            {txRows.map((r) => (
              <div key={r.id} className="bi-sh-r">
                <div className="bi-sh-a"><span>{r.c}</span><span className="bi-tx-m">{r.m}</span></div>
                <span className="bi-muted">{r.f} · {r.p} · {r.q} {t.drawer.qty} · {r.pr} · {t.drawer.disc} {r.d}</span>
                <span className="bi-src">ERP · {locale === 'es' ? 'Ventas' : 'Sales'} · {r.id}</span>
              </div>
            ))}
          </>
        )}
      </dialog>
    </div>
  );
}
