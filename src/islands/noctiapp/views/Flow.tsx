// Lienzo de flujo del detalle de agente (spec 003 §4.5): 5 columnas como pilas centradas, alto según el contenido,
// curvas medidas desde las tarjetas reales; lista ordenada como descripción textual y presentación angosta.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AgentCopy, ApprState, FlowCard } from '../data/types';
import { FICON, LOGOS } from '../icons';
import { Icon, ScrollRegion, useApp } from './ui';

const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type CardSt = 'done' | 'appr' | 'wait' | 'okA' | 'run' | 'rej';
const LINE = { done: '#6FAE88', appr: '#C9A13B', wait: '#BDBDB8', rej: '#D98C7E' } as const;

export function cardState(c: FlowCard, s: ApprState): CardSt {
  if (c.st === 'done') return 'done';
  if (s === 'approved') return c.st === 'appr' ? 'okA' : 'run';
  if (s === 'rejected' && c.st === 'appr') return 'rej';
  return c.st;
}

interface Link { a: number; b: number; kind: keyof typeof LINE }

function links(cards: FlowCard[], s: ApprState): Link[] {
  const idx = (col: number) => cards.map((c, i) => ({ c, i })).filter((x) => x.c.col === col);
  const out: Link[] = [];
  const t0 = idx(0)[0]!, comp = idx(2)[0]!;
  const ok = s === 'approved';
  idx(1).forEach((x) => out.push({ a: t0.i, b: x.i, kind: 'done' }));
  idx(1).forEach((x) => out.push({ a: x.i, b: comp.i, kind: 'done' }));
  idx(3).forEach((x) => out.push({ a: comp.i, b: x.i, kind: ok ? 'done' : x.c.st === 'appr' ? (s === 'rejected' ? 'rej' : 'appr') : 'done' }));
  const ap = idx(3).find((x) => x.c.st === 'appr') ?? idx(3)[0]!;
  idx(4).forEach((x) => out.push({ a: ap.i, b: x.i, kind: ok ? 'done' : 'wait' }));
  return out;
}

function Card({ c, st, label }: { c: FlowCard; st: CardSt; label: string }) {
  return (
    <div className="na-fcard" data-st={st}>
      <div className="na-fcard-k">
        <span className="na-fcard-i">
          {c.logo
            ? <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false"><path d={LOGOS[c.logo].path} fill={'#' + LOGOS[c.logo].hex} /></svg>
            : <Icon d={FICON[c.icon ?? 'bot']} size={12} width={2} />}
        </span>
        <span className="na-fcard-kick">{c.kick}</span>
      </div>
      <span className="na-fcard-t">{c.title}</span>
      <span className="na-fcard-p">{label}</span>
      <span className="na-fcard-m">{c.meta}</span>
      {c.rule && <span className="na-fcard-r">{c.rule}</span>}
    </div>
  );
}

export function Flow({ agent, state }: { agent: AgentCopy; state: ApprState }) {
  const { copy, fmt, reduced } = useApp();
  const t = copy.agents;
  const cards = agent.cards;
  const label = (c: FlowCard) => { const st = cardState(c, state); return st === 'done' && c.time != null ? `${t.cardSt.done} · ${fmt.secs(c.time)}` : t.cardSt[st]; };
  const ls = links(cards, state);
  const inner = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string[] } | null>(null);

  const measure = useCallback(() => {
    const box = inner.current;
    if (!box) return;
    const r0 = box.getBoundingClientRect();
    if (!r0.width) { setGeo(null); return; }
    const rect = (i: number) => refs.current[i]!.getBoundingClientRect();
    const d = ls.map(({ a, b }) => {
      const ra = rect(a), rb = rect(b);
      const xa = ra.right - r0.left, ya = ra.top + ra.height / 2 - r0.top;
      const xb = rb.left - r0.left, yb = rb.top + rb.height / 2 - r0.top;
      const xm = (xa + xb) / 2;
      const n = (v: number) => v.toFixed(1);
      return `M${n(xa)} ${n(ya)} C${n(xm)} ${n(ya)} ${n(xm)} ${n(yb)} ${n(xb)} ${n(yb)}`;
    });
    setGeo({ w: r0.width, h: r0.height, d });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, state, copy]);

  useIsoLayout(() => { measure(); }, [measure]);
  useEffect(() => {
    const box = inner.current;
    if (!box) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(box);
    return () => ro.disconnect();
  }, [measure]);

  const cols = [0, 1, 2, 3, 4].map((col) => cards.map((c, i) => ({ c, i })).filter((x) => x.c.col === col));
  const ap = cards.find((c) => c.col === 3 && c.st === 'appr')!;
  const nouns = (col: number) => t.list(cards.filter((c) => c.col === col).map((c) => c.noun));
  const dep = (c: FlowCard) => {
    if (c.col === 0) return t.deps.trigger(c.title, nouns(1));
    if (c.col === 1) return t.deps.feeds(nouns(2), 1);
    if (c.col === 2) return `${t.deps.uses(c.title, nouns(1))} ${t.deps.feeds(nouns(3), 2)}`;
    if (c.col === 3) return c.st === 'appr' ? t.deps.feeds(nouns(4), 3) : '';
    return t.deps.awaits(ap.title);
  };

  return (
    <div className="na-flow-cq">
      <ScrollRegion label={t.flowLabel} className="na-flow-scroll">
        <div className="na-flow" aria-hidden="true">
          <div className="na-flow-in" ref={inner}>
            {geo && (
              <svg key={agent.key + state} className="na-flow-svg" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
                {geo.d.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke={LINE[ls[i]!.kind]} strokeWidth="1.4" strokeDasharray="2 4">
                    {!reduced && <animate attributeName="stroke-dashoffset" values="12;0" dur={(1 + (i % 4) * 0.15).toFixed(2) + 's'} repeatCount="3" />}
                  </path>
                ))}
              </svg>
            )}
            {cols.map((col, ci) => (
              <div key={ci} className="na-fcol" data-col={ci}>
                {col.map(({ c, i }) => (
                  <div key={i} ref={(el) => { refs.current[i] = el; }} className="na-fslot"><Card c={c} st={cardState(c, state)} label={label(c)} /></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </ScrollRegion>
      <ol className="na-flow-list" aria-label={t.flowDesc}>
        {cards.map((c, i) => (
          <li key={i}>
            <Card c={c} st={cardState(c, state)} label={label(c)} />
            {dep(c) && <span className="na-fdep">{dep(c)}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
