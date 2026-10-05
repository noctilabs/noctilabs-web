// Vista Operaciones / Control (App L289–313): la OC-4471 con su estado único y la trazabilidad derivada (spec 003 §4.8).
// Sub-vistas de la sección «Control y gobernanza» por `tab` (spec 006 §3.4, App v2 L289–375): 0 aprobación + registro
// (la de siempre), 1 permisos, 2 aprobación, 3 ficha del agente, 4 trazabilidad, 5 observabilidad, 6 auditoría.
// Todas leen el mismo `oc`: el estado de la OC no se duplica.
import { OC, PURCHASE_LIMIT } from '../data/facts';
import type { ApprState } from '../data/types';
import { Icon, Pill, RefChip, ScrollRegion, useApp } from './ui';

export type ControlTab = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const CHECK = 'M20 6L9 17l-5-5';
const CROSS = 'M18 6L6 18M6 6l12 12';
const BOT = 'M12 8V4H8M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM2 14h2M20 14h2M9 13v2M15 13v2';
const CHEV = 'M6 9l6 6 6-6';
const DOWNLOAD = 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3';

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

function Log({ oc, run, change }: { oc: ApprState; run: ApprState; change?: boolean }) {
  const { copy } = useApp();
  const t = copy.control;
  const rows = t.trace(oc, run).map((x) => ({ ...x, hl: false }));
  // La fila de auditoría va en su lugar cronológico: antes del último registro, el de ayer.
  if (change) rows.splice(rows.length - 1, 0, { ...copy.ctl.audit.change, tag: 'change' as const, hl: true });
  return (
    <ScrollRegion label={t.tableLabel}>
      <table className="na-table">
        <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.t + x.x} className={x.hl ? 'na-row-hl' : undefined}><td className="na-tnum">{x.t}</td><td>{x.a}</td><td>{x.x}</td><td><Pill tag={x.tag}>{x.s}</Pill></td></tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

function Perm() {
  const { copy } = useApp();
  const t = copy.ctl.perm;
  return (
    <>
      <ScrollRegion label={t.tableLabel} className="na-card na-pmatrix">
        <table className="na-table na-ptable">
          <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            {t.rows.map((x) => (
              <tr key={x.r} className={x.agent ? 'na-row-agent' : undefined}>
                <th scope="row"><span className="na-prole">{x.r}{x.agent && <span className="na-ref">{t.badge}</span>}</span></th>
                <td>{x.v}</td><td>{x.c}</td><td>{x.e}</td><td className={x.a === '—' ? 'na-muted' : 'na-warn'}>{x.a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      <p className="na-note"><span className="na-dot na-dot-blue" aria-hidden="true" />{t.note}</p>
    </>
  );
}

function AgentCard({ oc }: { oc: ApprState }) {
  const { copy } = useApp();
  const t = copy.ctl.agent;
  const [st, tag] = t.status[oc];
  // La parte automática de la barra es el límite sobre el monto de la OC: 10 M / 18,4 M.
  const share = Math.round((PURCHASE_LIMIT / OC.amount) * 100);
  return (
    <div className="na-card na-agcard">
      <div className="na-aghead">
        <div className="na-agid">
          <span className="na-agicon" aria-hidden="true"><Icon d={BOT} size={17} width={2} /></span>
          <div className="na-colstack"><span className="na-agname">{t.name}</span><span className="na-agsub">{t.sub}</span></div>
        </div>
        <Pill tag={tag}>{st}</Pill>
      </div>
      <div className="na-aggrid">
        {([[t.allowH, t.allow, true], [t.denyH, t.deny, false]] as const).map(([h, xs, ok]) => (
          <div key={h} className="na-agbox">
            <h4 className="na-kicker">{h}</h4>
            <ul>
              {xs.map((x) => (
                <li key={x.t}>
                  <Icon d={ok ? CHECK : CROSS} size={14} width={2.4} className={ok ? 'na-ok' : 'na-no'} />
                  <span className="na-colstack"><span className="na-strong">{x.t}</span><span className="na-agd">{x.d}</span></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="na-aglimit">
        <div className="na-aglimit-h"><span className="na-kicker">{t.limitH}</span><span className="na-aglimit-v">{t.limitV}</span></div>
        <div className="na-agbar" aria-hidden="true"><span style={{ flexBasis: share + '%' }} /><span /></div>
        <div className="na-aglimit-f"><span>{t.auto}</span><span className="na-warn">{t.above}</span></div>
      </div>
    </div>
  );
}

function Trace({ oc }: { oc: ApprState }) {
  const { copy } = useApp();
  const t = copy.ctl.trace;
  const [st, tag] = t.status[oc];
  const steps = t.steps(oc);
  return (
    <div className="na-card na-trace">
      <div className="na-trace-h"><span className="na-strong">{t.order}</span><Pill tag={tag}>{st}</Pill></div>
      <ol aria-label={t.listLabel}>
        {steps.map((s, i) => (
          <li key={s.t + s.x} className={i === steps.length - 1 ? 'is-last' : undefined}>
            <span className="na-trace-t">{s.t}</span>
            <span className="na-trace-rail" aria-hidden="true"><span className="na-trace-dot" data-tone={s.tone} /></span>
            <span className="na-trace-b"><span className="na-trace-x">{s.x}</span><span className="na-ref">{s.src}</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Obs({ oc, run }: { oc: ApprState; run: ApprState }) {
  const { copy, fmt } = useApp();
  const t = copy.ctl.obs;
  return (
    <>
      <ul className="na-obs">
        {t.agents(oc, run).map((a) => (
          <li key={a.n} className="na-card">
            <div className="na-obs-h"><span className="na-strong">{a.n}</span><Pill tag={a.s[1]}>{a.s[0]}</Pill></div>
            <dl>
              {a.rows.map((r) => (
                <div key={r.k}><dt>{r.k}</dt><dd className={r.v && r.tone ? 'na-tone-' + r.tone : undefined}>{fmt.num(r.v)}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      {run === 'pending' && (
        <div className="na-oc">
          <div className="na-oc-banner" data-state="pending"><span>{t.exc.banner}</span><span>{t.exc.agent}</span></div>
          <div className="na-exc">
            <div className="na-colstack"><span className="na-exc-t">{t.exc.title}</span><span className="na-muted">{t.exc.text}</span></div>
            <span className="na-fake na-fake-dark na-fake-sm">{t.exc.cta}</span>
          </div>
        </div>
      )}
    </>
  );
}

function AuditBar() {
  const { copy } = useApp();
  const t = copy.ctl.audit;
  return (
    <div className="na-audit">
      <ul className="na-audit-f" aria-label={t.filtersLabel}>
        {t.filters.map((x) => (
          <li key={x.k} className="na-fake na-fake-sm na-fake-out"><span className="na-muted">{x.k}</span>{x.v}<Icon d={CHEV} size={11} width={2.2} /></li>
        ))}
      </ul>
      <span className="na-fake na-fake-dark na-fake-sm"><Icon d={DOWNLOAD} size={13} width={2} />{t.exportLabel}</span>
    </div>
  );
}

export function Control({ oc, run, tab = 0, onOc }: { oc: ApprState; run: ApprState; tab?: ControlTab; onOc: (s: ApprState) => void }) {
  const { copy } = useApp();
  const t = copy.control;
  const head = tab === 0 || tab === 2 ? null : copy.ctl.heads[tab];
  return (
    <>
      <div className="na-vhead">
        <h3 className="na-vtitle">{head ? head[0] : t.title}</h3>
        <span className="na-vsub">{head ? head[1] : `${t.scope} · ${t.head(oc === 'pending' ? 1 : 0)}`}</span>
      </div>
      {tab === 1 && <Perm />}
      {tab === 3 && <AgentCard oc={oc} />}
      {tab === 4 && <Trace oc={oc} />}
      {tab === 5 && <Obs oc={oc} run={run} />}
      {tab === 6 && <AuditBar />}
      {(tab === 0 || tab === 2) && <Approval oc={oc} onOc={onOc} />}
      {(tab === 0 || tab === 6) && <Log oc={oc} run={run} change={tab === 6} />}
    </>
  );
}
