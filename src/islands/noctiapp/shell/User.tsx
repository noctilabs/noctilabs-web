// Avatar de iniciales (spec 003 §4.10) y usuario como disclosure (§4.6): Esc devuelve el foco al botón; click fuera cierra.
import { useEffect, useId, useRef, useState } from 'react';
import type { Person } from '../data/types';
import { BOT } from '../icons';
import { Icon, useApp } from '../views/ui';

export function Avatar({ p, size = 30 }: { p: Person; size?: number }) {
  return (
    <span className="na-avatar" style={{ width: size, height: size, background: p.bg, fontSize: Math.round(size * 0.37) }} aria-hidden="true">
      {p.bot ? <Icon d={BOT} size={Math.round(size * 0.57)} width={2} /> : p.initials}
    </span>
  );
}

export function User({ p, compact = false }: { p: Person; compact?: boolean }) {
  const { copy, mounted } = useApp();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div ref={wrap} className={'na-user' + (compact ? ' is-compact' : '')}>
      {open && (
        <div id={id} className="na-user-panel">
          <span className="na-user-name">{p.name}</span>
          <span className="na-user-meta">{copy.user.role}: {p.puesto}</span>
          <span className="na-user-meta">{copy.company}</span>
          <span className="na-user-meta">{copy.user.lang}: {copy.user.langValue}</span>
        </div>
      )}
      <button type="button" ref={btn} className="na-user-btn" aria-expanded={open} aria-controls={open ? id : undefined} disabled={!mounted} onClick={() => setOpen((o) => !o)}>
        <Avatar p={p} />
        <span className="na-user-txt">
          <span className="na-user-btn-name">{p.name}</span>
          {!compact && <span className="na-user-co">{copy.company}</span>}
        </span>
        <Icon d="M7 15l5 5 5-5M7 9l5-5 5 5" size={14} width={1.8} className="na-user-chev" />
      </button>
    </div>
  );
}
