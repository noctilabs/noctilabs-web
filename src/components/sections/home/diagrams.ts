// Geometría de los 3 diagramas de «Por qué Nocti» con el estilo de la Nocti App (spec 005 §6, demo aprobada por el dueño).
// Posiciones del centro de cada tarjeta en % del lienzo, una por estado. El lienzo es cuadrado en escritorio y 4:5 en el
// lienzo angosto (carrusel mobile y columnas de 1000 a 1200 px); los lugares están elegidos para que las tarjetas no se pisen
// en ninguno de los dos, con las tarjetas completas o con las compactas (< 340 px). Las rotaciones de «sin» no pasan de 4°.
import { siGmail, siGoogledrive, siGooglesheets, siHubspot, siSap, siWhatsapp } from 'simple-icons';
import type { BaState, DiagramLabels } from '../../../content/pages/home';

type Key = keyof DiagramLabels;

/** Lugar en un estado: `[x, y, rotación en grados, opacidad]`. Con opacidad 0 la tarjeta además queda oculta. */
export type Place = [x: number, y: number, r?: number, o?: number];

/** Logos de simple-icons (CC0), renderizados en build como SVG estático. */
export const LOGOS = {
  sap: { name: 'SAP', icon: siSap },
  hubspot: { name: 'HubSpot', icon: siHubspot },
  sheets: { name: 'Sheets', icon: siGooglesheets },
  whatsapp: { name: 'WhatsApp', icon: siWhatsapp },
  gmail: { name: 'Gmail', icon: siGmail },
  drive: { name: 'Drive', icon: siGoogledrive },
} as const;
export type Logo = keyof typeof LOGOS;

export type DiagramNode = { at: Record<BaState, Place> } & (
  /** Fuente con logo y etiqueta mono (`.na-fcard`). */
  | { kind: 'source'; logo: Logo; kicker: Key }
  /** «Personas»: como una fuente, con el ícono de equipo. */
  | { kind: 'team' }
  /** «Tu empresa» con la marca y la píldora «Contexto unificado». */
  | { kind: 'core' }
  /** «IA genérica» en «sin», «IA + Nocti» en «con». */
  | { kind: 'ia' }
  /** Tarjeta-lista «Conocimiento de la empresa» con cada ítem «Aplicado». */
  | { kind: 'list'; items: Key[] }
  /** Conocimiento suelto (sólo en «sin»). */
  | { kind: 'chip'; label: Key }
  /** Persona con avatar de iniciales; `tone` = color del avatar. */
  | { kind: 'person'; label: Key; tone: 'blue' | 'green' | 'amber' }
  /** Agente con su estado: `run` = «En ejecución», `appr` = «Necesita aprobación». */
  | { kind: 'agent'; label: Key; st: 'run' | 'appr' }
  /** Barra «Contexto compartido · Nocti». */
  | { kind: 'bar' }
);

export interface DiagramGeometry {
  nodes: DiagramNode[];
  /** Curvas punteadas (atributo `d` en un viewBox de 100 × 100), visibles sólo en «con». */
  curves: string[];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
/** Curva cuadrática del centro hacia un nodo, combada hacia un lado. */
const radial = (x1: number, y1: number, x2: number, y2: number) =>
  `M${x1} ${y1} Q ${r1((x1 + x2) / 2 + (y2 - y1) * 0.12)} ${r1((y1 + y2) / 2 - (x2 - x1) * 0.12)}, ${x2} ${y2}`;
/** Curva vertical en S entre dos puntos. */
const drop = (x1: number, y1: number, x2: number, y2: number) => {
  const my = r1((y1 + y2) / 2);
  return `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
};

// Diagrama 1: seis fuentes y el equipo, sueltos y apagados → alrededor de «Tu empresa».
const sources: [Logo, Key][] = [['sap', 'erp'], ['hubspot', 'crm'], ['sheets', 'planillas'], ['whatsapp', 'mensajes'], ['gmail', 'correo'], ['drive', 'documentos']];
const srcSin: Place[] = [[24, 14, -4], [74, 13, 4], [78, 44, 2], [24, 52, -3], [72, 86, -4], [28, 84, 2]];
const srcCon: Place[] = [[50, 12], [76, 30], [80, 69], [69, 87], [31, 87], [20, 69]];
const teamSin: Place = [56, 68, 3];
const teamCon: Place = [24, 30];

// Diagrama 2: conocimiento suelto → la tarjeta-lista bajo «IA + Nocti».
const knowledge: Key[] = ['procesos', 'reglas', 'clientes', 'precios', 'excepciones'];
const chipSin: Place[] = [[24, 62, -4], [70, 56, 4], [44, 80, 3], [78, 84, -4], [24, 92, 3]];
const LIST: Place = [50, 66];

// Diagrama 3: personas y agentes dispersos → escalonados sobre la barra del contexto compartido.
const people: [Key, 'blue' | 'green' | 'amber'][] = [['ventas', 'blue'], ['finanzas', 'green'], ['operaciones', 'amber']];
const pSin: Place[] = [[24, 14, -4], [74, 24, 4], [30, 64, 3]];
const pCon: Place[] = [[25, 10], [75, 10], [50, 25]];
const agents: [Key, 'run' | 'appr'][] = [['agComercial', 'run'], ['agCobranzas', 'appr']];
const aSin: Place[] = [[64, 84, -4], [56, 44, 3]];
const aCon: Place[] = [[35, 46], [63, 67]];
const BAR_Y = 89;
/** Punto de la barra al que baja cada tarjeta del diagrama 3 (personas y agentes, en orden). */
const barAnchor = [20, 80, 50, 35, 63];

// «Sin»: la tarjeta se apaga con fondo, borde e ícono (CSS), no con opacidad: el texto queda opaco por contraste (≥ 4,5:1).
const faded = ([x, y, r]: Place): Place => [x, y, r];
const hidden = ([x, y]: Place): Place => [x, y, 0, 0];

export const DIAGRAMS: [DiagramGeometry, DiagramGeometry, DiagramGeometry] = [
  {
    nodes: [
      ...sources.map(([logo, kicker], i): DiagramNode => ({ kind: 'source', logo, kicker, at: { sin: faded(srcSin[i]!), con: srcCon[i]! } })),
      { kind: 'team', at: { sin: faded(teamSin), con: teamCon } },
      { kind: 'core', at: { sin: hidden([50, 50]), con: [50, 50] } },
    ],
    curves: [...srcCon, teamCon].map(([x, y]) => radial(50, 50, x, y)),
  },
  {
    nodes: [
      { kind: 'ia', at: { sin: [50, 22], con: [50, 18] } },
      { kind: 'list', items: knowledge, at: { sin: hidden([50, 72]), con: LIST } },
      ...knowledge.map((label, i): DiagramNode => ({ kind: 'chip', label, at: { sin: faded(chipSin[i]!), con: hidden(LIST) } })),
    ],
    curves: [drop(50, 26, 50, 44)],
  },
  {
    nodes: [
      ...people.map(([label, tone], i): DiagramNode => ({ kind: 'person', label, tone, at: { sin: faded(pSin[i]!), con: pCon[i]! } })),
      ...agents.map(([label, st], i): DiagramNode => ({ kind: 'agent', label, st, at: { sin: faded(aSin[i]!), con: aCon[i]! } })),
      { kind: 'bar', at: { sin: hidden([50, BAR_Y]), con: [50, BAR_Y] } },
    ],
    curves: [...pCon, ...aCon].map(([x, y], i) => drop(x, y, barAnchor[i]!, BAR_Y)),
  },
];
