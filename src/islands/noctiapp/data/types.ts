// Tipos de los datos de la app (spec 003 §3.2). Los números y fechas viven en facts.ts y se formatean por idioma.
export type Locale = 'es' | 'en';
export type ViewKey = 'inicio' | 'cerebro' | 'inteligencia' | 'agentes' | 'control' | 'fuentes' | 'permisos';
export type RoleKey = 'ceo' | 'comercial' | 'operaciones' | 'agentes';
export type SourceId = 'erp' | 'crm' | 'drive' | 'planillas' | 'whatsapp' | 'correo' | 'documentos' | 'conocimiento';
export type Tag = 'warn' | 'danger' | 'info' | 'success' | 'neutral' | 'change';
export type AgentKey = 'cobranzas' | 'comercial' | 'compras';
/** Estado de la OC-4471 (§4.8). Las corridas usan solo `pending | approved`. */
export type ApprState = 'pending' | 'approved' | 'rejected';
export type Logo = 'sap' | 'hubspot' | 'whatsapp' | 'gmail' | 'googlesheets' | 'googledrive';
export type CardIcon = 'clock' | 'comp' | 'bot';

/** Referencia específica a una de las 8 fuentes, con su etiqueta (§4.7 n.º 9). */
export interface Ref { sourceId: SourceId; label: string }
export interface Item { title: string; text: string }
export interface Answer { q: string; lead: string; items: Item[]; sources: Ref[]; action: string }
export interface RoleAnswer extends Answer { label: string; sees: string; hidden: string }
export interface Convo extends Answer { pinned: boolean; t: string; role: RoleKey; date: string }
export interface Person { name: string; first: string; initials: string; puesto: string; bg: string; bot?: boolean }

export interface SourceCopy { name: string; short: string; desc: string; type: string; sync: string; status: string }

export interface FlowCard {
  col: 0 | 1 | 2 | 3 | 4;
  kick: string;
  icon?: CardIcon;
  logo?: Logo;
  title: string;
  st: 'done' | 'appr' | 'wait';
  time?: number;
  meta: string;
  rule?: string;
  /** Sustantivo corto para la descripción textual del flujo («facturas», «historial»…). */
  noun: string;
}

export interface Stat { v: string; k: string; tone?: 'g' | 'w' | 'd' }

export interface AgentCopy {
  key: AgentKey;
  name: string;
  desc: string;
  unit: string;
  cards: FlowCard[];
  summary: string;
  rows: { a: string; n: number; m: number }[];
  approve: string;
  btn2: string;
  pill: Record<ApprState, string>;
  note: Record<ApprState, string>;
  stats: (s: ApprState) => Stat[];
  list: {
    status: Record<ApprState, string>;
    tag: Record<ApprState, Tag>;
    rows: (s: ApprState) => { k: string; v: string }[];
    foot: Record<ApprState, string>;
  };
}

export interface Copy {
  locale: Locale;
  rootLabel: string;
  company: string;
  views: Record<ViewKey, string>;
  viewsNav: string;
  convosBtn: string;
  groups: [string, string];
  user: { role: string; lang: string; langValue: string; open: string };
  people: Record<RoleKey, Person>;
  roleTabs: Record<RoleKey, string>;
  roles: Record<RoleKey, RoleAnswer>;
  convos: Convo[];
  hello: (first: string | null) => string;
  inicio: {
    sub: string;
    kpis: [string, string, string, string];
    attentionTitle: string;
    suggestedTitle: string;
    activityTitle: string;
    suggested: string[];
    activity: { t: string; text: string }[];
    attention: (oc: ApprState) => { kind: string; tag: Tag; text: string }[];
  };
  ask: {
    viewAs: string;
    conexiones: string;
    heroSub: string;
    placeholder: string;
    area: string;
    period: string;
    thinking: string;
    analysis: string;
    permsTitle: string;
    ctxTitle: string;
    pause: string;
    resume: string;
    controls: string;
    log: string;
    sugg: { k: string; q: string }[];
    brainMap: { k: string; v: string }[];
    systemsKey: string;
    sees: string;
    hidden: string;
    announce: (a: Answer) => string;
  };
  intel: {
    title: string;
    scope: string;
    sub: string;
    q: string;
    chartTitle: string;
    chartSub: string;
    value: string;
    delta: string;
    lead: string;
    causes: { t: string; d: string; pp: string }[];
    segments: string;
    segs: string[];
    refs: Ref[];
    show: string;
    hide: string;
    alert: string;
    tableLabel: string;
    cols: [string, string, string, string, string];
    txns: { id: string; c: string; p: string; d: string; m: string }[];
    chartTable: { caption: string; week: string; margin: string; highlight: string };
  };
  agents: {
    title: string;
    scope: string;
    head: (active: number, paused: number) => string;
    see: string;
    create: { t: string; d: string; cta: string };
    logTitle: string;
    log: (run: ApprState) => { t: string; text: string; s: string }[];
    back: string;
    cardSt: Record<'done' | 'appr' | 'wait' | 'okA' | 'run' | 'rej', string>;
    apprTitle: Record<ApprState, string>;
    undo: string;
    approved: string;
    rejectedBtn: string;
    action: string;
    amount: string;
    result: string;
    flowLabel: string;
    flowDesc: string;
    tableLabel: string;
    deps: { trigger: (t: string, outs: string) => string; uses: (t: string, ins: string) => string; feeds: (outs: string, n: number) => string; awaits: (t: string) => string };
    list: (xs: string[]) => string;
    agents: Record<AgentKey, AgentCopy>;
  };
  control: {
    title: string;
    scope: string;
    head: (n: number) => string;
    banner: Record<ApprState, string>;
    agent: string;
    order: string;
    rule: string;
    ruleStrong: string;
    refs: Ref[];
    approve: string;
    reject: string;
    undo: string;
    msg: Record<'approved' | 'rejected', string>;
    tableLabel: string;
    cols: [string, string, string, string];
    trace: (oc: ApprState, run: ApprState) => { t: string; a: string; x: string; s: string; tag: Tag }[];
  };
  /** Sub-vistas de Control de la sección «Control y gobernanza» (spec 006 §3.4), por `controlTab`. */
  ctl: {
    /** Título y bajada de las sub-vistas 1 y 3–6 (la 0 y la 2 usan los de `control`). */
    heads: Record<1 | 3 | 4 | 5 | 6, [string, string]>;
    perm: { tableLabel: string; cols: [string, string, string, string, string]; badge: string; rows: { r: string; v: string; c: string; e: string; a: string; agent?: boolean }[]; note: string };
    agent: {
      name: string; sub: string; status: Record<ApprState, [string, Tag]>;
      allowH: string; allow: { t: string; d: string }[]; denyH: string; deny: { t: string; d: string }[];
      limitH: string; limitV: string; auto: string; above: string;
    };
    trace: { order: string; status: Record<ApprState, [string, Tag]>; listLabel: string; steps: (oc: ApprState) => { t: string; x: string; src: string; tone: 'blue' | ApprState }[] };
    obs: {
      agents: (oc: ApprState, run: ApprState) => { n: string; s: [string, Tag]; rows: { k: string; v: number; tone?: 'w' | 'd' }[] }[];
      exc: { banner: string; agent: string; title: string; text: string; cta: string };
    };
    audit: { filtersLabel: string; filters: { k: string; v: string }[]; exportLabel: string; change: { t: string; a: string; x: string; s: string } };
  };
  conex: {
    title: string;
    layout: string;
    list: string;
    center: string;
    connect: string;
    tableLabel: string;
    cols: [string, string, string, string, string];
    sources: Record<SourceId, SourceCopy>;
    leftHead: string;
    ctxHead: string;
    usesHead: string;
    hub: [string, string, string];
    uses: { n: string; d: string }[];
    centerDesc: (systems: string, uses: string) => string;
  };
  perms: {
    title: string;
    sub: string;
    tableLabel: string;
    cols: [string, string, string, string, string];
    rows: { r: string; v: string; c: string; e: string; a: string }[];
  };
  status: {
    oc: Record<ApprState, string>;
    run: Record<'cobranzas' | 'comercial', Record<'pending' | 'approved', string>>;
  };
  regionLabels: { flow: string; center: string };
}
