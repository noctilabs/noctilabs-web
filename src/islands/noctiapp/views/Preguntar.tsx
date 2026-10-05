// Vista Preguntar (App L83–167): fila de controles observada, chat animado por el controlador y panel de permisos (spec 003 §4.3–4.4).
import { useId, useState, type Ref as RRef } from 'react';
import type { ChatState } from '../controller';
import type { Person, RoleAnswer, RoleKey, SourceId } from '../data/types';
import { Mark } from '../shell/Mark';
import { Avatar } from '../shell/User';
import { Icon, Kicker, RefChip, useApp } from './ui';

export const ROLE_ORDER: RoleKey[] = ['ceo', 'comercial', 'operaciones', 'agentes'];

/** Sistemas del «Contexto consultado»: las fuentes de la respuesta, sin repetir (§4.7 n.º 9). */
export function useSystems(ans: RoleAnswer) {
  const { copy } = useApp();
  const ids = [...new Set(ans.sources.map((s) => s.sourceId))] as SourceId[];
  return ids.map((id) => copy.conex.sources[id].short).join(' · ');
}

/**
 * `collapsible` (role-demo, spec 005 §3.3): por debajo de 1000 px el «Contexto consultado» es un disclosure cerrado; el CSS
 * muestra el encabezado con botón solo ahí y el encabezado fijo en escritorio, donde la lista se ve siempre.
 */
export function PermsPanel({ ans, className, collapsible = false }: { ans: RoleAnswer; className?: string; collapsible?: boolean }) {
  const { copy, mounted } = useApp();
  const systems = useSystems(ans);
  const [open, setOpen] = useState(false);
  // Sin JS (antes de hidratar) el contexto queda visible: se pliega recién cuando el botón puede abrirlo.
  const shown = open || !mounted;
  const id = useId();
  return (
    <div className={'na-perms' + (className ? ' ' + className : '')}>
      <div className="na-perms-a">
        <Kicker as="h4">{copy.ask.permsTitle}</Kicker>
        <p className="na-perm"><span className="na-perm-i is-ok" aria-hidden="true">✓</span><span><span className="sr-only">{copy.ask.sees}: </span>{ans.sees}</span></p>
        <p className="na-perm is-no"><span className="na-perm-i" aria-hidden="true">✕</span><span><span className="sr-only">{copy.ask.hidden}: </span>{ans.hidden}</span></p>
      </div>
      <div className={'na-perms-b' + (collapsible ? ' is-collapsible' + (shown ? ' is-open' : '') : '')}>
        <Kicker as="h4" className={collapsible ? 'na-ctx-static' : undefined}>{copy.ask.ctxTitle}</Kicker>
        {collapsible && (
          <h4 className="na-ctx-h">
            <button type="button" className="na-ctx-btn" aria-expanded={shown} aria-controls={id} disabled={!mounted} onClick={() => setOpen((o) => !o)}>
              <span className="na-kicker">{copy.ask.ctxTitle}</span>
              <Icon d="M6 9l6 6 6-6" size={14} width={1.8} className={'na-chev' + (shown ? ' is-open' : '')} />
            </button>
          </h4>
        )}
        <dl id={collapsible ? id : undefined}>
          {copy.ask.brainMap.map((b) => (
            <div key={b.k}><dt>{b.k}</dt><dd>{b.k === copy.ask.systemsKey ? systems : b.v}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export interface PreguntarProps {
  ans: RoleAnswer;
  role: RoleKey;
  person: Person;
  greeting: string;
  chat: ChatState;
  paused: boolean;
  showChips: boolean;
  showInlinePerms: boolean;
  controlsRef: RRef<HTMLDivElement>;
  onRole: (k: RoleKey) => void;
  onPause: () => void;
}

export function Preguntar(p: PreguntarProps) {
  const { copy, mounted } = useApp();
  const { chat, ans } = p;
  const typing = chat.typed > 0;
  const hero = !chat.showQ;
  return (
    <>
      <div className="na-ask-top" ref={p.controlsRef}>
        {p.showChips && (
          <div className="na-chips" role="group" aria-label={copy.ask.viewAs}>
            <span className="na-chips-l" aria-hidden="true">{copy.ask.viewAs}</span>
            {ROLE_ORDER.map((k) => (
              <button key={k} type="button" className="na-chip" aria-pressed={p.role === k} disabled={!mounted} onClick={() => p.onRole(k)}>{copy.roles[k].label}</button>
            ))}
          </div>
        )}
        <div className="na-ask-tags">
          <span className="na-tagpill"><span className="na-dot-g" aria-hidden="true" />{p.person.name} · {p.person.puesto}</span>
          <span className="na-tagpill">{copy.ask.conexiones}</span>
          <button type="button" className="na-pause" disabled={!mounted} onClick={p.onPause}>{p.paused ? copy.ask.resume : copy.ask.pause}</button>
        </div>
      </div>
      <div className={'na-ask-grid' + (p.showInlinePerms ? ' has-perms' : '')}>
        <div className={'na-chat' + (hero ? ' is-hero' : ' is-convo')}>
          {hero && (
            <div className="na-hero">
              <h3 className="na-hero-h">{p.greeting}</h3>
              <span className="na-hero-sub">{copy.ask.heroSub}</span>
            </div>
          )}
          <div className="na-log" role="log" aria-live="off" aria-label={copy.ask.log}>
            {chat.showQ && (
              <div className="na-q">
                <div className="na-q-who"><span className="na-q-name">{p.person.name}</span><Avatar p={p.person} size={26} /></div>
                <p className="na-bubble">{ans.q}</p>
              </div>
            )}
            {chat.thinking && (
              <div className="na-think">
                <span className="na-think-h"><span className="na-pulse" style={{ opacity: chat.pulse ? 1 : 0.25 }} aria-hidden="true" />{copy.ask.thinking} · {ans.label}</span>
                <div className="na-refs">{ans.sources.slice(0, chat.src).map((s, i) => <RefChip key={i} r={s} />)}</div>
              </div>
            )}
            {chat.showA && (
              <>
                <div className="na-a-who"><Mark size={22} /><span translate="no">Nocti</span></div>
                <div className="na-answer">
                  <p className="na-lead">{ans.lead}</p>
                  <ol className="na-items">
                    {ans.items.slice(0, chat.items).map((it, i) => (
                      <li key={i}><span className="na-items-n" aria-hidden="true">{i + 1}</span><span><strong>{it.title}</strong> {it.text}</span></li>
                    ))}
                  </ol>
                  {chat.foot && (
                    <>
                      <div className="na-refs"><span className="na-refs-l">{copy.ask.conexiones}</span>{ans.sources.map((s, i) => <RefChip key={i} r={s} />)}</div>
                      <div className="na-btnrow">
                        <span className="na-fake na-fake-dark">{ans.action} →</span>
                        <span className="na-fake">{copy.ask.analysis}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <div className={'na-composer' + (typing ? ' is-typing' : '')}>
            <span className="na-comp-text">{typing ? ans.q.slice(0, chat.typed) : copy.ask.placeholder}<span className="na-caret" aria-hidden="true" /></span>
            <div className="na-comp-row">
              <span className="na-tagpill">{copy.ask.area}</span>
              <span className="na-tagpill">{copy.ask.period}</span>
              <span className="na-send" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></span>
            </div>
          </div>
          {hero && (
            <ul className="na-sugg">
              {copy.ask.sugg.map((s) => (
                <li key={s.k}><span className="na-sugg-k">{s.k}</span><span>{s.q}</span></li>
              ))}
            </ul>
          )}
        </div>
        {p.showInlinePerms && <PermsPanel ans={ans} className="na-perms-inline" />}
      </div>
    </>
  );
}
