// Sidebar ancho (App L16–42) y barra compacta (App L43–49, más conversaciones y usuario: spec 003 §4.1).
import { useId, useState } from 'react';
import type { Convo, Person, ViewKey } from '../data/types';
import { ICONS } from '../icons';
import { Icon, useApp, useScrollRow } from '../views/ui';
import { Mark } from './Mark';
import { User } from './User';

export const VIEW_ORDER: ViewKey[] = ['inicio', 'cerebro', 'inteligencia', 'agentes', 'control', 'fuentes', 'permisos'];

export interface ShellProps {
  view: ViewKey;
  counts: Partial<Record<ViewKey, number>>;
  convo: number | null;
  person: Person;
  onView: (v: ViewKey) => void;
  onConvo: (i: number) => void;
}

const CHAT = 'M3 4h12v8H8l-5 4zM9 16h7l5 4V8h-6';

function ConvoList({ convo, view, onConvo }: Pick<ShellProps, 'convo' | 'view' | 'onConvo'>) {
  const { copy, fmt, mounted } = useApp();
  const groups: [string, { c: Convo; i: number }[]][] = [
    [copy.groups[0], copy.convos.map((c, i) => ({ c, i })).filter((x) => x.c.pinned)],
    [copy.groups[1], copy.convos.map((c, i) => ({ c, i })).filter((x) => !x.c.pinned)],
  ];
  return (
    <>
      {groups.map(([title, items]) => (
        <div className="na-cgroup" key={title}>
          <span className="na-cgroup-t">{title}</span>
          <ul>
            {items.map(({ c, i }) => {
              const on = convo === i && view === 'cerebro';
              return (
                <li key={i}>
                  <button type="button" className="na-convo" aria-current={on ? 'true' : undefined} disabled={!mounted} onClick={() => onConvo(i)}>
                    <Icon d={CHAT} size={15} width={1.7} />
                    <span className="na-convo-t">{c.t}</span>
                    <span className="na-convo-d">{fmt.date(c.date)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function Sidebar(p: ShellProps) {
  const { copy, mounted } = useApp();
  return (
    <div className="na-side">
      <div className="na-brand"><Mark size={22} /><span translate="no">Nocti</span></div>
      <div className="na-company"><span className="na-company-sq" aria-hidden="true" /><span>{copy.company}</span></div>
      <nav aria-label={copy.viewsNav} className="na-nav">
        <ul>
          {VIEW_ORDER.map((k) => (
            <li key={k}>
              <button type="button" className="na-nav-btn" aria-current={k === p.view ? 'page' : undefined} disabled={!mounted} onClick={() => p.onView(k)}>
                <Icon d={ICONS[k]} transform={k === 'fuentes' ? 'rotate(45 12 12)' : undefined} />
                <span className="na-nav-l">{copy.views[k]}</span>
                {p.counts[k] ? <span className="na-nav-n">{p.counts[k]}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <ConvoList convo={p.convo} view={p.view} onConvo={p.onConvo} />
      <User p={p.person} />
    </div>
  );
}

export function NarrowBar(p: ShellProps) {
  const { copy, mounted } = useApp();
  const [open, setOpen] = useState(false);
  const id = useId();
  const row = useScrollRow<HTMLUListElement>(p.view);
  return (
    <div className="na-narrow">
      <nav aria-label={copy.viewsNav} className="na-tabs">
        <ul ref={row}>
          {VIEW_ORDER.map((k) => (
            <li key={k}>
              <button type="button" aria-current={k === p.view ? 'page' : undefined} disabled={!mounted} onClick={() => p.onView(k)}>{copy.views[k]}</button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="na-narrow-row">
        <button type="button" className="na-disclosure" aria-expanded={open} aria-controls={id} disabled={!mounted} onClick={() => setOpen((o) => !o)}>
          <Icon d={CHAT} size={15} width={1.7} />
          <span>{copy.convosBtn}</span>
          <Icon d="M6 9l6 6 6-6" size={14} width={1.8} className={'na-chev' + (open ? ' is-open' : '')} />
        </button>
        <User p={p.person} compact />
      </div>
      <div id={id} className="na-narrow-convos" hidden={!open}>
        <ConvoList convo={p.convo} view={p.view} onConvo={p.onConvo} />
      </div>
    </div>
  );
}
