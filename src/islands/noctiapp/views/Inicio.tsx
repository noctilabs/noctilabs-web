// Vista Inicio (App L53–81) con KPIs y «Requiere tu atención» derivados de la OC (spec 003 §4.7 n.º 3 y 8c, §4.8).
import type { ApprState } from '../data/types';
import { Kicker, Pill, useApp } from './ui';

export function Inicio({ greeting, oc, activeAgents }: { greeting: string; oc: ApprState; activeAgents: number }) {
  const { copy, fmt } = useApp();
  const t = copy.inicio;
  const kpis = [3, 5, activeAgents, oc === 'pending' ? 1 : 0];
  return (
    <>
      <div className="na-hello">
        <h3 className="na-hello-h">{greeting}</h3>
        <span className="na-muted">{t.sub}</span>
      </div>
      <dl className="na-kpis">
        {t.kpis.map((label, i) => (
          <div key={label} className="na-kpi">
            <dt>{label}</dt>
            <dd>{fmt.num(kpis[i]!)}</dd>
          </div>
        ))}
      </dl>
      <div className="na-cols2">
        <div className="na-colstack">
          <Kicker as="h4" className="na-sec">{t.attentionTitle}</Kicker>
          <ul className="na-rows">
            {t.attention(oc).map((a) => (
              <li key={a.kind} className="na-att"><Pill tag={a.tag} className="na-att-k">{a.kind}</Pill><span>{a.text}</span></li>
            ))}
          </ul>
        </div>
        <div className="na-colstack">
          <Kicker as="h4" className="na-sec">{t.suggestedTitle}</Kicker>
          <ul className="na-rows">
            {t.suggested.map((q) => (
              <li key={q} className="na-sug"><span>{q}</span><span className="na-arrow" aria-hidden="true">→</span></li>
            ))}
          </ul>
          <Kicker as="h4" className="na-sec na-sec-gap">{t.activityTitle}</Kicker>
          <ul className="na-rows">
            {t.activity.map((r) => (
              <li key={r.text} className="na-act"><span className="na-act-t">{r.t}</span><span>{r.text}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
