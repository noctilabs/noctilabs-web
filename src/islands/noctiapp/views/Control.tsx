// Vista Operaciones / Control (App L289–313): la OC-4471 con su estado único y la trazabilidad derivada (spec 003 §4.8).
import type { ApprState } from '../data/types';
import { Pill, RefChip, ScrollRegion, useApp } from './ui';

function Approval({ oc, onOc }: { oc: ApprState; onOc: (s: ApprState) => void }) {
  const { copy, mounted } = useApp();
  const t = copy.control;
  return (
    <div className="na-oc">
      <div className="na-oc-banner" data-state={oc}><span>{t.banner[oc]}</span><span>{t.agent}</span></div>
      <div className="na-oc-body">
        <p className="na-oc-title">{t.order}</p>
        <p className="na-oc-rule">{t.rule}<strong>{t.ruleStrong}</strong></p>
        <div className="na-refs">{t.refs.map((r, i) => <RefChip key={i} r={r} />)}</div>
        {oc === 'pending' ? (
          <div className="na-btnrow">
            <button type="button" className="na-btn na-btn-dark" data-focus="oc-approve" disabled={!mounted} onClick={() => onOc('approved')}>{t.approve}</button>
            <button type="button" className="na-btn" disabled={!mounted} onClick={() => onOc('rejected')}>{t.reject}</button>
          </div>
        ) : (
          <div className="na-oc-done">
            <span>{t.msg[oc]}</span>
            <button type="button" className="na-link" data-focus="oc-undo" disabled={!mounted} onClick={() => onOc('pending')}>{t.undo}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Log({ oc, run }: { oc: ApprState; run: ApprState }) {
  const { copy } = useApp();
  const t = copy.control;
  const rows = t.trace(oc, run);
  return (
    <ScrollRegion label={t.tableLabel}>
      <table className="na-table">
        <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.t + x.x}><td className="na-tnum">{x.t}</td><td>{x.a}</td><td>{x.x}</td><td><Pill tag={x.tag}>{x.s}</Pill></td></tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

export function Control({ oc, run, onOc }: { oc: ApprState; run: ApprState; onOc: (s: ApprState) => void }) {
  const { copy } = useApp();
  const t = copy.control;
  return (
    <>
      <div className="na-vhead">
        <h3 className="na-vtitle">{t.title}</h3>
        <span className="na-vsub">{`${t.scope} · ${t.head(oc === 'pending' ? 1 : 0)}`}</span>
      </div>
      <Approval oc={oc} onOc={onOc} />
      <Log oc={oc} run={run} />
    </>
  );
}
