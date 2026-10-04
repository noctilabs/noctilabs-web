// Vista Conexiones (App L315–359): Lista y Centro derivados del catálogo único de fuentes (spec 003 §4.7 n.º 9).
import { CENTER_ORDER, SOURCES } from '../data/facts';
import { LOGOS, SOURCE_ICON } from '../icons';
import { Icon, Pill, ScrollRegion, useApp } from './ui';

export type ConexMode = 'list' | 'center';

export function Conexiones({ mode, onMode }: { mode: ConexMode; onMode: (m: ConexMode) => void }) {
  const { copy, fmt, mounted, reduced } = useApp();
  const t = copy.conex;
  const recs = (n: number) => (n >= 1_000_000 ? fmt.millPlain(n) : fmt.num(n));
  const center = CENTER_ORDER.map((id) => ({ id, s: t.sources[id], src: SOURCES.find((x) => x.id === id)! }));
  // Curvas en el sistema 0–100 del diseño (App L599–600).
  const hub = center.map((_, i) => { const y = (((i + 0.5) / 6) * 100).toFixed(2); return { d: `M36 ${y} C39.5 ${y} 38.5 50 42 50`, op: 0.75, dur: (1 + i * 0.12).toFixed(2) + 's' }; })
    .concat(t.uses.map((_, j) => { const y = (((j + 0.5) / 4) * 100).toFixed(2); return { d: `M58 50 C61.5 50 62.5 ${y} 66 ${y}`, op: 0.6, dur: (1.2 + j * 0.1).toFixed(2) + 's' }; }));
  const desc = t.centerDesc(
    copy.agents.list(center.map((c) => `${c.s.name} (${recs(c.src.records)})`)),
    copy.agents.list(t.uses.map((u) => `${u.n} (${u.d})`)),
  );
  return (
    <>
      <div className="na-vhead">
        <h3 className="na-vtitle">{t.title}</h3>
        <div className="na-vtools">
          <div className="na-seg" role="group" aria-label={t.layout}>
            <button type="button" aria-pressed={mode === 'list'} disabled={!mounted} onClick={() => onMode('list')}>{t.list}</button>
            <button type="button" aria-pressed={mode === 'center'} disabled={!mounted} onClick={() => onMode('center')}>{t.center}</button>
          </div>
          <span className="na-fake na-fake-dark na-fake-sm">{t.connect}</span>
        </div>
      </div>
      {mode === 'list' ? (
        <ScrollRegion label={t.tableLabel}>
          <table className="na-table">
            <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>
              {SOURCES.map((x) => {
                const s = t.sources[x.id];
                return (
                  <tr key={x.id}>
                    <td className="na-strong"><span className="na-src"><span className="na-src-i"><Icon d={SOURCE_ICON[x.id]} size={14} width={1.6} /></span>{s.name}</span></td>
                    <td>{s.type}</td>
                    <td className="na-tnum">{recs(x.records)}</td>
                    <td>{s.sync}</td>
                    <td><Pill tag={s.status === t.sources.documentos.status ? 'warn' : 'success'}>{s.status}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollRegion>
      ) : (
        <>
          <ScrollRegion label={copy.regionLabels.center}>
            <div className="na-hubv" aria-hidden="true">
              <span className="na-hub-h" style={{ left: 18 }}>{t.leftHead}</span>
              <span className="na-hub-h" style={{ left: '50%', transform: 'translateX(-50%)' }}>{t.ctxHead}</span>
              <span className="na-hub-h" style={{ left: 'calc(66% + 6px)' }}>{t.usesHead}</span>
              <div className="na-hub-in">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="na-hub-svg">
                  {hub.map((l, i) => (
                    <path key={i} d={l.d} fill="none" stroke="#3D7BFF" strokeOpacity={l.op} strokeWidth="1.3" strokeDasharray="3 4" vectorEffect="non-scaling-stroke">
                      {!reduced && <animate attributeName="stroke-dashoffset" values="14;0" dur={l.dur} repeatCount="3" />}
                    </path>
                  ))}
                </svg>
                <div className="na-hub-left">
                  {center.map((c) => (
                    <div key={c.id} className="na-hub-src">
                      <span className="na-hub-logo">{c.src.logo && <svg viewBox="0 0 24 24" width="16" height="16"><path d={LOGOS[c.src.logo].path} fill={'#' + LOGOS[c.src.logo].hex} /></svg>}</span>
                      <span className="na-hub-txt"><span className="na-hub-n">{c.s.name}</span><span className="na-hub-d">{c.s.desc}</span></span>
                      <span className="na-hub-r">✓ {recs(c.src.records)}</span>
                    </div>
                  ))}
                </div>
                <div className="na-hub-core"><div><span>{t.hub[0]}</span><span className="na-hub-core-m">{t.hub[1]}<br />{t.hub[2]}</span></div></div>
                <div className="na-hub-right">
                  {t.uses.map((u) => <div key={u.n} className="na-hub-use"><span className="na-hub-n">{u.n}</span><span className="na-hub-d">{u.d}</span></div>)}
                </div>
              </div>
            </div>
          </ScrollRegion>
          <p className="sr-only">{desc}</p>
        </>
      )}
    </>
  );
}
