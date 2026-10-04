// Vista Permisos (App L382–392).
import { ScrollRegion, useApp } from './ui';

export function Permisos() {
  const { copy } = useApp();
  const t = copy.perms;
  return (
    <>
      <div className="na-vhead">
        <h3 className="na-vtitle">{t.title}</h3>
        <span className="na-vsub">{t.sub}</span>
      </div>
      <ScrollRegion label={t.tableLabel}>
        <table className="na-table na-table-w">
          <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            {t.rows.map((x) => (
              <tr key={x.r}><th scope="row" className="na-strong">{x.r}</th><td>{x.v}</td><td>{x.c}</td><td>{x.e}</td><td>{x.a}</td></tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </>
  );
}
