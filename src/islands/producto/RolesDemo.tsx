// «Preguntá. Entendé. Actuá.» de Producto (spec 007 §3.C, v4 «Producto · Por rol»): selector «Ver como» con 7 roles,
// la app compacta con el chat de la v4 y el panel de permisos y contexto. En mobile, el panel pasa a «Qué puede ver».
// Isla aparte de NoctiApp: reutiliza su controlador del chat, sus piezas y su CSS, sin cambiar el home ni Control.
// Avance automático (F5): la primera pregunta de cada rol se anima y, al terminar, sigue la segunda una sola vez;
// se pausa con «Pausar demo», se congela fuera de pantalla y con reduced motion las respuestas aparecen completas.
import { useCallback, useEffect, useRef, useState } from 'react';
import '../noctiapp/app.css';
import './roles.css';
import { ChatController, EMPTY_CHAT, type ChatState } from '../noctiapp/controller';
import { EN } from '../noctiapp/data/en';
import { ES } from '../noctiapp/data/es';
import { makeFmt } from '../noctiapp/data/format';
import type { Locale } from '../noctiapp/data/types';
import { BOT, ICONS } from '../noctiapp/icons';
import { Mark } from '../noctiapp/shell/Mark';
import { VIEW_ORDER } from '../noctiapp/shell/Sidebar';
import { Avatar } from '../noctiapp/shell/User';
import { Ctx, Icon, useScrollRow } from '../noctiapp/views/ui';
import { ROLE4_ORDER, ROLES4, type Role4, type RoleData } from './roles-data';

const COPY = { es: ES, en: EN };
const FMT = { es: makeFmt('es'), en: makeFmt('en') };

function Sel({ role, label, roles, disabled, onRole }: { role: Role4; label: string; roles: Record<Role4, RoleData>; disabled: boolean; onRole: (k: Role4) => void }) {
  const row = useScrollRow<HTMLDivElement>(role);
  return (
    <div ref={row} className="na-rd-sel pr-sel" role="group" aria-label={label}>
      {ROLE4_ORDER.map((k) => (
        <button key={k} type="button" aria-pressed={role === k} disabled={disabled} onClick={() => onRole(k)}>
          {k === 'agentes' && <Icon d={BOT} size={13} width={2} className="pr-sel-bot" />}
          {roles[k].tab}
        </button>
      ))}
    </div>
  );
}

function Perms({ r, title }: { r: RoleData; title: string }) {
  return (
    <>
      {r.perms.map(([ok, t], i) => (
        <p key={i} className={'na-perm' + (ok ? '' : ' is-no')}>
          <span className={'na-perm-i' + (ok ? ' is-ok' : '')} aria-hidden="true">{ok ? '✓' : '✕'}</span>
          <span><span className="sr-only">{title}: </span>{t}</span>
        </p>
      ))}
    </>
  );
}

export default function RolesDemo({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const t = ROLES4[locale];
  const [role, setRole] = useState<Role4>('ceo');
  const [qi, setQi] = useState<0 | 1>(0);
  const [chat, setChat] = useState<ChatState>(EMPTY_CHAT);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState('');

  const ctrl = useRef<ChatController | null>(null);
  const io = useRef<IntersectionObserver | null>(null);
  const roleRef = useRef(role);
  roleRef.current = role;
  const qiRef = useRef(qi);
  qiRef.current = qi;
  const autoDone = useRef<Partial<Record<Role4, true>>>({});

  const announceOf = (k: Role4, i: 0 | 1) => {
    const q = t.roles[k].qs[i];
    return copy.ask.announce({ q: q.q, lead: q.lead, items: q.items.map(([title, text]) => ({ title, text })), sources: [], action: '' });
  };
  const onEnd = useRef<() => void>(() => {});
  const getCtrl = () => (ctrl.current ??= new ChatController({ onState: setChat, onAnnounce: setLive, onEnd: () => onEnd.current() }));
  const play = (k: Role4, i: 0 | 1, announce = false) => {
    const q = t.roles[k].qs[i];
    getCtrl().start(q.q, t.roles[k].sources.length, q.items.length, announce ? { announce: announceOf(k, i), completeIfPaused: true } : {});
  };

  // v4 (onAnsDone): al terminar la primera respuesta de un rol, sigue la segunda una sola vez. Con reduced motion no avanza solo.
  onEnd.current = () => {
    const k = roleRef.current;
    if (qiRef.current !== 0 || autoDone.current[k] || getCtrl().reduced) return;
    autoDone.current[k] = true;
    setQi(1);
    play(k, 1);
  };

  useEffect(() => {
    const c = getCtrl();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    c.reduced = mq.matches;
    setReduced(mq.matches);
    const onMq = () => { setReduced(mq.matches); c.setReduced(mq.matches); };
    mq.addEventListener('change', onMq);
    setMounted(true);
    play('ceo', 0);
    return () => { mq.removeEventListener('change', onMq); c.dispose(); io.current?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La secuencia avanza solo con el chat en pantalla (threshold 0, como la isla del home).
  const watchRef = useCallback((el: HTMLDivElement | null) => {
    io.current?.disconnect();
    io.current = null;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    io.current = new IntersectionObserver((es) => { const e = es[es.length - 1]; if (e) getCtrl().setVisible(e.isIntersecting); }, { threshold: 0 });
    io.current.observe(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseRole = (k: Role4) => {
    setRole(k);
    setQi(0);
    roleRef.current = k;
    qiRef.current = 0;
    play(k, 0, true);
  };
  const togglePause = () => { const p = !paused; setPaused(p); getCtrl().setPaused(p); };

  const r = t.roles[role];
  const q = r.qs[qi];
  const hero = !chat.showQ;
  const typing = chat.typed > 0;
  const permsTitle = role === 'agentes' ? t.permsTitleAgents : t.permsTitle;

  return (
    <Ctx.Provider value={{ copy, fmt: FMT[locale], mounted, reduced }}>
      <section className="nocti-root pr-roles" aria-label={copy.rootLabel}>
        <div className="pr-sel-wrap">
          <span className="pr-sel-l" aria-hidden="true">{copy.ask.viewAs}</span>
          <Sel role={role} label={copy.ask.viewAs} roles={t.roles} disabled={!mounted} onRole={chooseRole} />
        </div>
        <div className="pr-cq">
          <div className="pr-app">
            <div className="pr-rail" aria-hidden="true">
              <Mark size={22} />
              <ul>
                {VIEW_ORDER.map((v) => (
                  <li key={v} className={v === 'cerebro' ? 'is-on' : undefined}>
                    <Icon d={ICONS[v]} size={15} transform={v === 'fuentes' ? 'rotate(45 12 12)' : undefined} />
                  </li>
                ))}
              </ul>
              <Avatar p={r.person} size={30} />
            </div>
            <div className="pr-main" ref={watchRef}>
              <div className="pr-top">
                <span className="na-tagpill">{r.person.bot ? <Icon d={BOT} size={13} width={2} className="pr-pill-bot" /> : <span className="na-dot-g" aria-hidden="true" />}{r.who}</span>
                <span className="na-tagpill">{copy.ask.conexiones}</span>
                <button type="button" className="na-pause" disabled={!mounted} aria-pressed={paused} onClick={togglePause}>{paused ? copy.ask.resume : copy.ask.pause}</button>
              </div>
              <div className="pr-grid">
                <div className={'na-chat pr-chat' + (hero ? ' is-hero' : ' is-convo')}>
                  {hero && (
                    <div className="na-hero">
                      <h3 className="na-hero-h">{copy.hello(r.person.bot ? null : r.person.first)}</h3>
                      <span className="na-hero-sub">{copy.ask.heroSub}</span>
                    </div>
                  )}
                  <div className="na-log" role="log" aria-live="off" aria-label={copy.ask.log}>
                    {chat.showQ && (
                      <div className="na-q">
                        <div className="na-q-who"><span className="na-q-name">{r.chatName}</span><Avatar p={r.person} size={26} /></div>
                        <p className="na-bubble">{q.q}</p>
                      </div>
                    )}
                    {chat.thinking && (
                      <div className="na-think">
                        <span className="na-think-h"><span className="na-pulse" style={{ opacity: chat.pulse ? 1 : 0.25 }} aria-hidden="true" />{copy.ask.thinking} · {r.label}</span>
                        <div className="na-refs">{r.sources.slice(0, chat.src).map((s) => <span key={s} className="na-ref">{s}</span>)}</div>
                      </div>
                    )}
                    {chat.showA && (
                      <>
                        <div className="na-a-who"><Mark size={22} /><span translate="no">Nocti</span></div>
                        <div className="na-answer">
                          {q.figs && (
                            <dl className="pr-figs">
                              {q.figs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                              {q.diff && <div className="is-diff"><dt>{t.diff}</dt><dd>{q.diff}</dd></div>}
                            </dl>
                          )}
                          <p className="na-lead">{q.lead}</p>
                          <ol className="na-items">
                            {q.items.slice(0, chat.items).map(([title, text], i) => (
                              <li key={i}><span className="na-items-n" aria-hidden="true">{i + 1}</span><span>{title && <strong>{title}</strong>}{title ? ' — ' : ''}{text}</span></li>
                            ))}
                          </ol>
                          {chat.foot && (
                            <>
                              {q.note && <p className="pr-note">{q.note}</p>}
                              <div className="na-refs"><span className="na-refs-l">{copy.ask.conexiones}</span>{r.sources.map((s) => <span key={s} className="na-ref">{s}</span>)}</div>
                              <div className="na-btnrow">
                                {q.actions.map((a, i) => <span key={a} className={'na-fake' + (i === 0 ? ' na-fake-dark' : '')}>{a} →</span>)}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className={'na-composer' + (typing ? ' is-typing' : '')}>
                    <span className="na-comp-text">{typing ? q.q.slice(0, chat.typed) : copy.ask.placeholder}<span className="na-caret" aria-hidden="true" /></span>
                    <div className="na-comp-row">
                      <span className="na-tagpill">{copy.ask.area}</span>
                      <span className="na-tagpill">{copy.ask.period}</span>
                      <span className="na-send" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></span>
                    </div>
                  </div>
                </div>
                <aside className="na-perms pr-perms" aria-label={permsTitle}>
                  <div className="na-perms-a">
                    <h4 className="na-kicker">{permsTitle}</h4>
                    <Perms r={r} title={permsTitle} />
                  </div>
                  <div className="na-perms-b">
                    <h4 className="na-kicker">{copy.ask.ctxTitle}</h4>
                    <dl>{r.ctx.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                  </div>
                </aside>
              </div>
            </div>
          </div>
          <div className="pr-see">
            <div className="pr-see-h"><h4>{t.canSee}</h4><span className="pr-see-who">{r.who}</span></div>
            <div className="pr-see-p"><Perms r={r} title={t.canSee} /></div>
            <dl className="pr-see-rows">{r.ctx.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{live}</div>
      </section>
    </Ctx.Provider>
  );
}
