// Chat «Preguntale a tu empresa.» de las páginas de industria (spec 009 §3.E, v6 `Industry Page V2`).
// Motor de tiempos del diseño (TY, TICK, plan(), esperas): escribe la pregunta, piensa, responde por bloques y rota las
// conversaciones. G6: se pausa con el botón, con el puntero encima o con foco en el campo, se congela fuera de pantalla y
// con reduced motion todo aparece completo y quieto. El marcado de servidor muestra la primera conversación completa.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChatBlock, ChatTurn } from '../../content/industries';
import type { IndustriaCopy } from '../../content/pages/industria';
import { Mark } from '../noctiapp/shell/Mark';
import './industry-chat.css';

interface Props {
  convs: ChatTurn[][];
  company: string;
  copy: IndustriaCopy['chat'];
  /** Link de «Hablemos →» en la respuesta fija y destino del formulario sin JavaScript. */
  hablemosHref: string;
  hablemosLabel: string;
}

type Phase = 'idle' | 'type' | 'think' | 'ans' | 'clear' | 'hold' | 'static';
interface Turn extends ChatTurn { cta?: boolean }
interface State {
  c: number;
  list: Turn[];
  k: number;
  ph: Phase;
  e: number;
  user: boolean;
  seen: boolean;
}

const TY = 30;
const TICK = 50;

interface Seg { t: string; b: boolean }
const segs = (s: string): Seg[] => s.split('**').map((t, i) => ({ t, b: i % 2 === 1 })).filter((x) => x.t);
const plen = (s: string) => s.replace(/\*\*/g, '').length;
const cut = (sg: Seg[], n: number): Seg[] => {
  const out: Seg[] = [];
  for (const x of sg) {
    if (n <= 0) break;
    out.push({ t: x.t.slice(0, n), b: x.b });
    n -= x.t.length;
  }
  return out;
};
const blockLen = (b: ChatBlock) => (b.type === 'list' || b.type === 'num' ? b.items.length : b.type === 'rows' ? b.rows.length : 1);
/** Inicio de cada bloque y duración total de la respuesta (plan() del diseño). */
function plan(turn: Turn): { st: number[]; total: number } {
  let t = 0;
  const st = turn.blocks.map((b) => {
    const s = t;
    t += b.type === 'p' ? plen(b.t) * 11 + 180 : 220 + blockLen(b) * 140;
    return s;
  });
  return { st, total: t };
}
const plainText = (turn: Turn) =>
  [turn.u, ...turn.blocks.flatMap((b) => {
    if (b.type === 'p' || b.type === 'call') return [b.t];
    if (b.type === 'list') return b.items;
    if (b.type === 'num') return b.items.map(([h, t]) => `${h}: ${t}`);
    return [b.h, ...b.rows.map(([k, v]) => `${k}: ${v}`)];
  })].filter(Boolean).join(' ').replace(/\*\*/g, '');

const full = (convs: ChatTurn[][]): State => ({ c: 0, list: convs[0]!.slice(), k: convs[0]!.length - 1, ph: 'static', e: 0, user: false, seen: false });
const start = (convs: ChatTurn[][], c = 0): State => ({ c, list: convs[c]!.slice(), k: 0, ph: 'idle', e: 0, user: false, seen: false });

function Segs({ list }: { list: Seg[] }) {
  return <>{list.map((s, i) => (s.b ? <strong key={i}>{s.t}</strong> : <span key={i}>{s.t}</span>))}</>;
}

export default function IndustryChat({ convs, company, copy, hablemosHref, hablemosLabel }: Props) {
  const [s, setS] = useState<State>(() => full(convs));
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  /** Foco en el campo (no escribe solo y cambia el borde). */
  const [focus, setFocus] = useState(false);
  /** Foco en cualquier control del chat: detiene el avance automático (spec 009 §3.E, prioridad 2). */
  const [within, setWithin] = useState(false);
  const [draft, setDraft] = useState('');
  /** Anuncio para lectores de pantalla; `n` cambia en cada respuesta para que una respuesta idéntica se vuelva a leer. */
  const [announce, setAnnounce] = useState({ n: 0, text: '' });
  const say = (text: string) => setAnnounce((a) => ({ n: a.n + 1, text }));
  const visible = useRef(false);
  const sec = useRef<HTMLDivElement | null>(null);
  const sc = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  /** El scroll interno sigue al último mensaje sólo mientras el visitante está al fondo. */
  const stick = useRef(true);
  // El intervalo lee el estado más reciente de estas refs.
  const live = useRef({ s, reduced, paused, hover, within });
  live.current = { s, reduced, paused, hover, within };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const el = sec.current;
    const r = el?.getBoundingClientRect();
    const inView = !!r && r.top < window.innerHeight && r.bottom > 0;
    setReduced(mq.matches);
    // Lo que el visitante hizo antes de hidratar (texto o foco en el campo) se conserva y la demo no arranca.
    const typed = input.current?.value ?? '';
    const touched = !!typed || document.activeElement === input.current;
    if (typed) setDraft(typed);
    if (document.activeElement === input.current) { setFocus(true); setWithin(true); }
    // Fuera de pantalla arranca de cero; si ya está a la vista, deja la conversación completa y sigue desde la espera.
    if (!mq.matches && !touched) setS(inView ? { ...full(convs), ph: 'hold', seen: true } : start(convs));
    setMounted(true);
    const onMq = () => { setReduced(mq.matches); if (mq.matches) setS((st) => ({ ...st, ph: 'static', k: st.list.length - 1 })); };
    mq.addEventListener('change', onMq);
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((es) => { const e = es[es.length - 1]; if (e) visible.current = e.isIntersecting; }, { threshold: 0 });
      io.observe(el);
    } else visible.current = true;
    const id = window.setInterval(() => tick(), TICK);
    return () => { window.clearInterval(id); io?.disconnect(); mq.removeEventListener('change', onMq); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tick() {
    const { s: S, reduced: R, paused: Pz, hover: H, within: W } = live.current;
    if (R || S.ph === 'static' || !visible.current) return;
    if (!S.seen) {
      if (Pz) return;
      const r = sec.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight * 0.8 && r.bottom > 0) setS({ ...S, seen: true });
      return;
    }
    const turn = S.list[S.k]!;
    const last = S.k === S.list.length - 1;
    const total = plan(turn).total;
    const inHold = S.ph === 'ans' && S.e > total + 700;
    const active = S.user && (S.ph === 'type' || S.ph === 'think' || (S.ph === 'ans' && !inHold));
    // Lo que pidió el visitante avanza aunque la demo esté detenida; lo automático espera (prioridades 1 a 3).
    if (!active && (Pz || H || W)) return;
    const e = S.e + TICK;
    if (S.ph === 'hold') return setS(e > 4500 ? { ...S, ph: 'clear', e: 0 } : { ...S, e });
    if (S.ph === 'idle') return setS(e > 700 ? { ...S, ph: 'type', e: 0 } : { ...S, e });
    if (S.ph === 'type') return setS(e > 250 + turn.u.length * TY + 380 ? { ...S, ph: 'think', e: 0 } : { ...S, e });
    if (S.ph === 'think') return setS(e > 950 ? { ...S, ph: 'ans', e: 0 } : { ...S, e });
    if (S.ph === 'ans') {
      // Sólo se anuncian las respuestas que pidió el visitante; el avance automático no habla (spec 009 §3.E).
      if (S.user && S.e < total && e >= total) say(plainText(turn));
      const hold = total + (last ? (S.user ? 7000 : 4500) : 2600);
      if (e < hold) return setS({ ...S, e });
      return setS(last ? { ...S, ph: 'clear', e: 0 } : { ...S, k: S.k + 1, ph: 'type', e: 0 });
    }
    if (S.ph === 'clear') {
      if (e < 650) return setS({ ...S, e });
      stick.current = true;
      return setS({ ...start(convs, (S.c + 1) % convs.length), seen: true });
    }
  }

  /** Agrega un turno del visitante (seguimiento o texto propio) a la conversación en curso. */
  const push = useCallback((turn: Turn, ph: Phase) => {
    setS((S) => {
      const kc = S.ph === 'clear' ? -1 : S.ph === 'type' || S.ph === 'idle' ? S.k - 1 : S.k;
      const list = (S.ph === 'clear' ? [] : S.list.slice(0, kc + 1)).concat([turn]);
      if (live.current.reduced) return { ...S, list, k: list.length - 1, ph: 'static', e: 0, user: true, seen: true };
      return { ...S, list, k: list.length - 1, ph, e: 0, user: true, seen: true };
    });
    if (live.current.reduced) say(plainText(turn));
    setDraft('');
  }, []);

  const send = (ev: { preventDefault(): void }) => {
    ev.preventDefault();
    const t = draft.trim();
    if (!t) return;
    push({ u: t, blocks: [{ type: 'p', t: copy.reply }], src: '', acts: [], sugg: [], cta: true }, 'think');
  };

  useLayoutEffect(() => {
    const el = sc.current;
    if (el && mounted && stick.current) el.scrollTop = el.scrollHeight;
  });
  const onScroll = () => {
    const el = sc.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };
  /** Al elegir un seguimiento el botón desaparece: el foco pasa a la región de mensajes (prioridad 4). */
  const choose = (sg: ChatTurn) => {
    stick.current = true;
    push(sg, 'type');
    sc.current?.focus({ preventScroll: true });
  };

  const S = s;
  const shown = S.ph === 'idle' || S.ph === 'type' ? S.k : S.k + 1;
  const animated = !reduced && S.ph !== 'static' && S.ph !== 'hold';
  const cur = S.list[S.k];
  const auto = mounted && S.ph === 'type' && cur && !focus && !draft ? cur.u.slice(0, Math.max(0, Math.floor((S.e - 250) / TY))) : '';
  const status = paused ? copy.status.paused
    : S.ph === 'think' ? copy.status.thinking
    : S.ph === 'ans' && cur && S.e < plan(cur).total ? copy.status.answering
    : hover && !S.user && animated ? copy.status.paused : copy.status.online;
  const dot = (j: number) => (Math.floor(S.e / 160) % 3 === j ? 1 : 0.25);

  return (
    <div
      className="ic"
      ref={sec}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setWithin(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setWithin(false); }}
    >
      <div className="ic-win">
        <div className="ic-head">
          <div className="ic-who"><Mark size={22} /><span className="ic-name">Nocti</span><span className="ic-co">· {company}</span></div>
          <div className="ic-tools">
            <span className="ic-status">{status}</span>
            {!reduced && (
              <button type="button" className="ic-pause" disabled={!mounted} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
                {paused ? copy.resume : copy.pause}
              </button>
            )}
          </div>
        </div>
        <div className="ic-scroll" ref={sc} role="region" aria-label={copy.log} tabIndex={0} onScroll={onScroll}>
          <div className="ic-list" style={{ opacity: S.ph === 'clear' ? 0 : 1 }}>
            {S.list.slice(0, shown).map((turn, mi) => {
              const isLive = animated && mi === S.k;
              const hasA = !isLive || S.ph === 'ans' || S.ph === 'clear';
              const le = isLive && S.ph === 'ans' ? S.e : 1e9;
              const p = plan(turn);
              const on = (t: number) => le >= t;
              const isLast = mi === S.list.length - 1;
              return (
                <div className="ic-turn" key={mi}>
                  <p className="ic-q">{turn.u}</p>
                  {isLive && S.ph === 'think' && (
                    <div className="ic-think" aria-hidden="true">
                      <Mark size={22} />
                      <span className="ic-dots">{[0, 1, 2].map((j) => <span key={j} style={{ opacity: dot(j) }} />)}</span>
                    </div>
                  )}
                  {hasA && (
                    <div className="ic-a">
                      <Mark size={22} />
                      <div className="ic-body">
                        {turn.blocks.map((b, bi) => {
                          const s0 = p.st[bi]!;
                          const vis = on(s0);
                          const style = { opacity: vis ? 1 : 0, transform: vis || b.type === 'p' ? 'none' : 'translateY(6px)' };
                          return (
                            <div className="ic-block" key={bi} style={style}>
                              {b.type === 'p' && <p className="ic-p"><Segs list={le >= 1e9 ? segs(b.t) : cut(segs(b.t), Math.floor((le - s0) / 11))} /></p>}
                              {b.type === 'call' && (
                                <div className="ic-call"><span className="ic-k ic-k-blue">{b.k}</span><span><Segs list={segs(b.t)} /></span></div>
                              )}
                              {b.type === 'rows' && (
                                <div className="ic-rows">
                                  {b.h && <span className="ic-k">{b.h}</span>}
                                  <dl>
                                    {b.rows.map(([k, v, ref], ri) => (
                                      <div key={ri} className={ref ? 'ic-row is-ref' : 'ic-row'} style={{ opacity: on(s0 + 120 + ri * 140) ? 1 : 0 }}>
                                        <dt>{k}</dt><dd>{v}</dd>
                                      </div>
                                    ))}
                                  </dl>
                                </div>
                              )}
                              {(b.type === 'list' || b.type === 'num') && (
                                <ol className="ic-list-items">
                                  {b.items.map((it, ii) => {
                                    const num = b.type === 'num';
                                    const [h, t] = num ? (it as [string, string]) : ['', it as string];
                                    return (
                                      <li key={ii} style={{ opacity: on(s0 + 120 + ii * 140) ? 1 : 0 }}>
                                        <span className="ic-m" aria-hidden="true">{num ? String(ii + 1).padStart(2, '0') : '—'}</span>
                                        <span>{num && <strong>{h} — </strong>}<Segs list={segs(t)} /></span>
                                      </li>
                                    );
                                  })}
                                </ol>
                              )}
                            </div>
                          );
                        })}
                        {hasA && turn.src && (
                          <p className="ic-src" style={{ opacity: on(p.total + 150) ? 1 : 0 }}>
                            <span className="ic-k">{copy.sources}</span><span className="ic-src-v">{turn.src}</span>
                          </p>
                        )}
                        {hasA && (turn.acts.length > 0 || turn.cta) && (
                          <div className="ic-acts" style={{ opacity: on(p.total + 400) ? 1 : 0, transform: on(p.total + 400) ? 'none' : 'translateY(6px)' }}>
                            {turn.cta
                              ? <a className="ic-act is-main" href={hablemosHref}>{hablemosLabel}</a>
                              : turn.acts.map((a, ai) => <span key={ai} className={ai === 0 ? 'ic-act is-main' : 'ic-act'}>{a}</span>)}
                          </div>
                        )}
                        {hasA && isLast && turn.sugg.length > 0 && (
                          <div className="ic-sugg" style={{ opacity: on(p.total + 650) ? 1 : 0 }}>
                            <span className="ic-k">{copy.more}</span>
                            <div className="ic-sugg-row">
                              {turn.sugg.map((sg, gi) => (
                                <button key={gi} type="button" disabled={!mounted} onClick={() => choose(sg)}>{sg.u}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <form className="ic-form" action={hablemosHref} method="get" onSubmit={send}>
          <div className={focus ? 'ic-field is-focus' : 'ic-field'}>
            <span className="ic-auto" aria-hidden="true">{auto}</span>
            <input
              ref={input}
              type="text"
              aria-label={copy.inputLabel}
              placeholder={auto ? '' : copy.placeholder}
              value={draft}
              autoComplete="off"
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => { setFocus(true); setS((st) => (st.ph === 'type' && !st.user ? { ...st, e: 0 } : st)); }}
              onBlur={() => setFocus(false)}
            />
            <button type="submit" className={draft || auto ? 'ic-send is-on' : 'ic-send'} aria-label={copy.send}>
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </form>
      </div>
      <div className="sr-only" aria-live="polite">{announce.text && <p key={announce.n}>{announce.text}</p>}</div>
    </div>
  );
}
