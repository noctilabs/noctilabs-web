// Isla Nocti App (spec 003 §3). Estado local y efímero por instancia: vista, conversación, rol, aprobaciones y Lista/Centro.
// SSR determinista: el primer render es la vista `view` sin conversación ni animación; las APIs del navegador van en efectos.
import { useCallback, useEffect, useRef, useState } from 'react';
import './app.css';
import { ChatController, completeChat, EMPTY_CHAT, type ChatState, type StartOptions } from './controller';
import { EN } from './data/en';
import { ES } from './data/es';
import { makeFmt } from './data/format';
import type { AgentKey, ApprState, Locale, RoleAnswer, RoleKey, ViewKey } from './data/types';
import { NarrowBar, Sidebar } from './shell/Sidebar';
import { Agentes, activeAgents } from './views/Agentes';
import { Conexiones, type ConexMode } from './views/Conexiones';
import { Control } from './views/Control';
import { Inicio } from './views/Inicio';
import { Inteligencia } from './views/Inteligencia';
import { Permisos } from './views/Permisos';
import { PermsPanel, Preguntar, ROLE_ORDER } from './views/Preguntar';
import { Ctx } from './views/ui';

export interface NoctiAppProps {
  view: 'inicio' | 'cerebro' | 'inteligencia' | 'agentes' | 'control';
  locale: Locale;
  contactHref: string;
  variant?: 'role-demo';
}

const COPY = { es: ES, en: EN };
const FMT = { es: makeFmt('es'), en: makeFmt('en') };

export default function NoctiApp(props: NoctiAppProps) {
  const copy = COPY[props.locale];
  const fmt = FMT[props.locale];
  const roleDemo = props.variant === 'role-demo';

  const [view, setView] = useState<ViewKey>(props.view);
  const [role, setRole] = useState<RoleKey>('ceo');
  const [convo, setConvo] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatState>(EMPTY_CHAT);
  const [paused, setPaused] = useState(false);
  const [oc, setOc] = useState<ApprState>('pending');
  const [runs, setRuns] = useState<Record<'cobranzas' | 'comercial', ApprState>>({ cobranzas: 'pending', comercial: 'pending' });
  const [agentOpen, setAgentOpen] = useState<AgentKey | null>(null);
  const [drill, setDrill] = useState(false);
  const [conex, setConex] = useState<ConexMode>('list');
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState('');
  const [status, setStatus] = useState('');

  const root = useRef<HTMLElement>(null);
  const ctrl = useRef<ChatController | null>(null);
  const rotation = useRef(true);
  const roleRef = useRef(role);
  roleRef.current = role;
  const focusNext = useRef<string | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const io = useRef<IntersectionObserver | null>(null);

  const answerOf = (r: RoleKey, c: number | null): RoleAnswer => {
    if (c == null) return copy.roles[r];
    const cv = copy.convos[c]!;
    return { ...copy.roles[cv.role], q: cv.q, lead: cv.lead, items: cv.items, sources: cv.sources, action: cv.action };
  };

  // Una sola fuente de temporizadores por isla; se crea solo en el cliente.
  const onEnd = useRef<() => void>(() => {});
  const getCtrl = () => (ctrl.current ??= new ChatController({ onState: setChat, onAnnounce: setLive, onEnd: () => onEnd.current() }));
  const startSeq = (r: RoleKey, opts: StartOptions = {}) => { const a = copy.roles[r]; getCtrl().start(a.q, a.sources.length, a.items.length, opts); };

  // Fin de secuencia (§4.3): role-demo rota si la rotación sigue activa; el resto repite.
  onEnd.current = () => {
    if (roleDemo) {
      if (!rotation.current) return;
      const next = ROLE_ORDER[(ROLE_ORDER.indexOf(roleRef.current) + 1) % ROLE_ORDER.length]!;
      setRole(next);
      setConvo(null);
      startSeq(next);
    } else startSeq(roleRef.current);
  };

  useEffect(() => {
    const c = getCtrl();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    c.reduced = mq.matches;
    setReduced(mq.matches);
    const onMq = () => { setReduced(mq.matches); c.setReduced(mq.matches); };
    mq.addEventListener('change', onMq);
    setMounted(true);
    if (props.view === 'cerebro') startSeq(role);
    return () => { mq.removeEventListener('change', onMq); c.dispose(); io.current?.disconnect(); clearTimeout(statusTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disparador de visibilidad: la fila de controles de Preguntar, con threshold 0 (§4.3).
  const controlsRef = useCallback((el: HTMLDivElement | null) => {
    io.current?.disconnect();
    io.current = null;
    if (!el) { ctrl.current?.setVisible(false); return; }
    if (typeof IntersectionObserver === 'undefined') return;
    io.current = new IntersectionObserver((es) => { const e = es[es.length - 1]; if (e) getCtrl().setVisible(e.isIntersecting); }, { threshold: 0 });
    io.current.observe(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!focusNext.current) return;
    const el = root.current?.querySelector<HTMLElement>(`[data-focus="${focusNext.current}"]`);
    focusNext.current = null;
    el?.focus();
  });

  const announceStatus = (text: string) => {
    clearTimeout(statusTimer.current);
    setStatus('');
    statusTimer.current = setTimeout(() => setStatus(text), 120);
  };

  const goView = (v: ViewKey) => {
    getCtrl().cancel();
    setView(v);
    setAgentOpen(null);
    setConvo(null);
    if (v === 'cerebro') startSeq(role);
  };
  const chooseRole = (k: RoleKey) => {
    rotation.current = false;
    setRole(k);
    setConvo(null);
    if (view === 'cerebro') startSeq(k, { announce: copy.ask.announce(copy.roles[k]), completeIfPaused: true });
  };
  const openConvo = (i: number) => {
    const cv = copy.convos[i]!;
    setView('cerebro');
    setAgentOpen(null);
    setRole(cv.role);
    setConvo(i);
    getCtrl().showStatic(completeChat(cv.sources.length, cv.items.length), copy.ask.announce(answerOf(cv.role, i)));
  };
  const togglePause = () => { const p = !paused; setPaused(p); getCtrl().setPaused(p); };
  const setOcFrom = (next: ApprState, fromControl: boolean) => {
    setOc(next);
    announceStatus(copy.status.oc[next]);
    if (fromControl) focusNext.current = next === 'pending' ? 'oc-approve' : 'oc-undo';
  };
  const approveAgent = (k: AgentKey, next: ApprState) => {
    if (k === 'compras') return setOcFrom(next, false);
    setRuns((r) => ({ ...r, [k]: next }));
    announceStatus(copy.status.run[k][next === 'approved' ? 'approved' : 'pending']);
  };
  const closeAgent = () => { focusNext.current = 'agent-' + agentOpen; setAgentOpen(null); };

  const person = copy.people[role];
  const greeting = copy.hello(person.bot ? null : person.first);
  const ans = answerOf(role, convo);
  const shell = {
    view,
    convo,
    person,
    counts: { agentes: 3, control: oc === 'pending' ? 1 : 0, fuentes: 8 },
    onView: goView,
    onConvo: openConvo,
  };

  let main;
  switch (view) {
    case 'inicio': main = <Inicio greeting={greeting} oc={oc} activeAgents={activeAgents(oc)} />; break;
    case 'cerebro':
      main = (
        <Preguntar ans={ans} role={role} person={person} greeting={greeting} chat={chat} paused={paused}
          showChips={!roleDemo} showInlinePerms={!roleDemo} controlsRef={controlsRef} onRole={chooseRole} onPause={togglePause} />
      );
      break;
    case 'inteligencia': main = <Inteligencia drill={drill} onDrill={() => setDrill((d) => !d)} />; break;
    case 'agentes':
      main = (
        <Agentes open={agentOpen} states={{ ...runs, compras: oc }} contactHref={props.contactHref}
          onOpen={setAgentOpen} onClose={closeAgent} onApprove={approveAgent} />
      );
      break;
    case 'control': main = <Control oc={oc} run={runs.cobranzas} onOc={(s) => setOcFrom(s, true)} />; break;
    case 'fuentes': main = <Conexiones mode={conex} onMode={setConex} />; break;
    case 'permisos': main = <Permisos />; break;
  }

  const app = (
    <div className="nocti-app-cq">
      <div className="nocti-app">
        <Sidebar {...shell} />
        <NarrowBar {...shell} />
        <div className="na-main" data-view={view}>{main}</div>
      </div>
    </div>
  );

  return (
    <Ctx.Provider value={{ copy, fmt, mounted, reduced }}>
      <section ref={root} className={'nocti-root' + (roleDemo ? ' is-roledemo' : '')} aria-label={copy.rootLabel}>
        {roleDemo ? (
          <div className="na-rd">
            <div className="na-rd-sel" role="group" aria-label={copy.ask.viewAs}>
              {ROLE_ORDER.map((k) => (
                <button key={k} type="button" aria-pressed={role === k} disabled={!mounted} onClick={() => chooseRole(k)}>{copy.roleTabs[k]}</button>
              ))}
            </div>
            <div className={'na-rd-grid' + (view === 'cerebro' ? ' has-side' : '')}>
              {app}
              {view === 'cerebro' && <PermsPanel ans={ans} className="na-perms-side" />}
            </div>
          </div>
        ) : app}
        <div className="na-sr" aria-live="polite" aria-atomic="true">{live}</div>
        <div className="na-sr" role="status" aria-atomic="true">{status}</div>
      </section>
    </Ctx.Provider>
  );
}
