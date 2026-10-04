// Vista Inteligencia (App L169–205): gráfico con su tabla alternativa, causas y transacciones (spec 003 §4.9).
import { BARS } from '../data/facts';
import { Kicker, Pill, RefChip, ScrollRegion, useApp } from './ui';

const MIN = 26, MAX = 32;

export function Inteligencia({ drill, onDrill }: { drill: boolean; onDrill: () => void }) {
  const { copy, fmt, mounted } = useApp();
  const t = copy.intel;
  return (
    <>
      <div className="na-vhead">
        <h3 className="na-vtitle">{t.title}</h3>
        <span className="na-vsub">{t.scope} · {t.sub}</span>
      </div>
      <p className="na-bubble na-bubble-end">{t.q}</p>
      <div className="na-intel">
        <div className="na-chart">
          <div className="na-chart-h"><Kicker>{t.chartTitle}</Kicker><span className="na-small">{t.chartSub}</span></div>
          <div className="na-chart-v"><span className="na-big">{t.value}</span><span className="na-neg">{t.delta}</span></div>
          <div className="na-bars" aria-hidden="true">
            {BARS.map(([w, v], i) => (
              <div key={w} className="na-bar">
                <span>{fmt.dec(v, 1)}</span>
                <div style={{ height: Math.round(((v - MIN) / (MAX - MIN)) * 100) + '%' }} className={i === BARS.length - 1 ? 'is-hl' : undefined} />
              </div>
            ))}
          </div>
          <div className="na-bars-x" aria-hidden="true">{BARS.map(([w]) => <span key={w}>{w}</span>)}</div>
          <div className="sr-only">
          <table>
            <caption>{t.chartTable.caption}. {t.chartTable.highlight}</caption>
            <thead><tr><th scope="col">{t.chartTable.week}</th><th scope="col">{t.chartTable.margin}</th></tr></thead>
            <tbody>{BARS.map(([w, v]) => <tr key={w}><th scope="row">{w}</th><td>{fmt.pct(v, 1)}</td></tr>)}</tbody>
          </table>
          </div>
        </div>
        <div className="na-colstack na-gap8">
          <p className="na-lead">{t.lead}</p>
          <ul className="na-causes">
            {t.causes.map((c) => (
              <li key={c.t}><span><strong>{c.t}</strong><span className="na-cause-d">{c.d}</span></span><span className="na-num">{c.pp}</span></li>
            ))}
          </ul>
          <div className="na-refs"><span className="na-refs-l">{t.segments}</span>{t.segs.map((s) => <Pill key={s} tag="neutral">{s}</Pill>)}</div>
          <div className="na-refs"><span className="na-refs-l">{copy.ask.conexiones}</span>{t.refs.map((r, i) => <RefChip key={i} r={r} />)}</div>
          <div className="na-btnrow">
            <button type="button" className="na-btn na-btn-dark" aria-expanded={drill} disabled={!mounted} onClick={onDrill}>{drill ? t.hide : t.show}</button>
            <span className="na-fake">{t.alert}</span>
          </div>
        </div>
      </div>
      {drill && (
        <ScrollRegion label={t.tableLabel}>
          <table className="na-table">
            <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>
              {t.txns.map((x) => (
                <tr key={x.id}><td>{x.id}</td><td>{x.c}</td><td>{x.p}</td><td>{x.d}</td><td className="na-strong">{x.m}</td></tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      )}
    </>
  );
}
