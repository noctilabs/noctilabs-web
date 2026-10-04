// Vista Agentes (App L207–287): lista y detalle con flujo, aprobación por corrida y la OC-4471 (spec 003 §4.5, §4.8).
import { useEffect, useRef } from 'react';
import type { AgentKey, ApprState } from '../data/types';
import { Flow } from './Flow';
import { Kicker, Pill, ScrollRegion, useApp } from './ui';

export const AGENT_ORDER: AgentKey[] = ['cobranzas', 'comercial', 'compras'];
/** Cobranzas y Comercial siempre activos; Compras solo con la OC aprobada (§4.8). */
export const activeAgents = (oc: ApprState) => (oc === 'approved' ? 3 : 2);
const DOT: Record<ApprState, string> = { pending: '#9A6A0E', approved: '#2F7D52', rejected: '#AE1800' };

export interface AgentesProps {
  open: AgentKey | null;
  states: Record<AgentKey, ApprState>;
  contactHref: string;
  onOpen: (k: AgentKey) => void;
  onClose: () => void;
  onApprove: (k: AgentKey, next: ApprState) => void;
}

export function Agentes(p: AgentesProps) {
  const { copy, fmt, mounted } = useApp();
  const t = copy.agents;
  const title = useRef<HTMLHeadingElement>(null);
  const focusOnOpen = useRef(false);
  useEffect(() => {
    if (p.open && focusOnOpen.current) { focusOnOpen.current = false; title.current?.focus(); }
  }, [p.open]);

  if (!p.open) {
    const active = activeAgents(p.states.compras);
    return (
      <>
        <div className="na-vhead">
          <h3 className="na-vtitle">{t.title}</h3>
          <span className="na-vsub">{t.scope} · {t.head(active, AGENT_ORDER.length - active)}</span>
        </div>
        <ul className="na-agents">
          {AGENT_ORDER.map((k) => {
            const a = t.agents[k], s = p.states[k];
            return (
              <li key={k} className="na-acard">
                <div className="na-acard-top"><h4 className="na-acard-n">{a.name}</h4><Pill tag={a.list.tag[s]}>{a.list.status[s]}</Pill></div>
                <dl className="na-acard-rows">
                  {a.list.rows(s).map((r) => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
                </dl>
                <span className="na-small na-muted">{a.list.foot[s]}</span>
                <button type="button" className="na-acard-open" data-focus={'agent-' + k} disabled={!mounted} onClick={() => { focusOnOpen.current = true; p.onOpen(k); }}>
                  {t.see}<span className="sr-only">: {a.name}</span><span aria-hidden="true"> →</span>
                </button>
              </li>
            );
          })}
          <li className="na-acard na-acard-new">
            <a href={p.contactHref}>
              <span className="na-acard-n">{t.create.t}</span>
              <span className="na-small na-muted">{t.create.d}</span>
              <span className="na-acard-cta">{t.create.cta}</span>
            </a>
          </li>
        </ul>
        <div className="na-colstack">
          <Kicker as="h4" className="na-sec">{t.logTitle}</Kicker>
          <ul className="na-rows">
            {t.log(p.states.cobranzas).map((r) => (
              <li key={r.t} className="na-act"><span className="na-act-t">{r.t}</span><span className="na-grow">{r.text}</span><span className="na-muted">{r.s}</span></li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  const k = p.open;
  const a = t.agents[k];
  const s = p.states[k];
  const isOc = k === 'compras';
  const primary = s === 'pending'
    ? { label: a.approve, next: 'approved' as const, cls: 'na-btn-blue' }
    : s === 'approved'
      ? { label: t.undo, next: 'pending' as const, cls: 'na-btn-out' }
      : { label: t.rejectedBtn, next: null, cls: 'na-btn-out' };
  return (
    <>
      <div className="na-ahead">
        <button type="button" className="na-back" disabled={!mounted} onClick={p.onClose}>{t.back}</button>
        <div className="na-ahead-row">
          <div className="na-ahead-t">
            <h3 className="na-atitle" tabIndex={-1} ref={title}>{a.name}</h3>
            <p className="na-adesc">{a.desc}</p>
          </div>
          <span className="na-spill"><span className="na-dot" style={{ background: DOT[s] }} aria-hidden="true" />{a.pill[s]}</span>
        </div>
      </div>
      <Flow agent={a} state={s} />
      <div className="na-abottom">
        <div className="na-appr" data-state={s}>
          <span className="na-appr-t"><span className="na-dot" style={{ background: DOT[s] }} aria-hidden="true" />{t.apprTitle[s]}</span>
          <p className="na-appr-s">{a.summary}</p>
          <ScrollRegion label={t.tableLabel} className="na-appr-scroll">
            <table className="na-atable">
              <thead><tr><th scope="col">{t.action}</th><th scope="col">{a.unit}</th><th scope="col">{t.amount}</th></tr></thead>
              <tbody>
                {a.rows.map((r) => <tr key={r.a}><td>{r.a}</td><td>{r.n}</td><td>{fmt.num(r.m)}</td></tr>)}
              </tbody>
            </table>
          </ScrollRegion>
          <p className="na-small na-muted">{a.note[s]}</p>
          <div className="na-btnrow">
            {s === 'approved' && <span className="na-okchip">{t.approved}</span>}
            <button
              type="button"
              className={'na-btn na-btn-sq ' + primary.cls}
              data-focus={isOc ? 'flow-oc' : 'flow-run'}
              disabled={!mounted || primary.next == null}
              onClick={() => primary.next && p.onApprove(k, primary.next)}
            >
              {primary.label}
            </button>
            <span className="na-fake na-fake-sq">{a.btn2}</span>
          </div>
        </div>
        <div className="na-result">
          <Kicker as="h4">{t.result}</Kicker>
          <div className="na-stats">
            {a.stats(s).map((x) => (
              <div key={x.k} className="na-stat" data-tone={x.tone}><span className="na-stat-v">{x.v}</span><span className="na-stat-k">{x.k}</span></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
