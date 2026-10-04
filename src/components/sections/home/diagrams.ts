// Geometría de los diagramas de la Opción 1 (Inv §9.10 y §9.12, `diagramsOld(con)` L601–628; dueño, 2026-10-04).
// Posiciones en % del lienzo. A diferencia de la Opción 2, acá los nodos se desplazan y rotan entre «sin» y «con».
import type { BaState, DiagramLabels } from '../../../content/pages/home';

/** `core` = OLD_CORE. */
export type NodeKind = 'src' | 'agent' | 'dark' | 'core';

/** Lugar del nodo en un estado: `[x, y, rotación en grados, escala, opacidad]`. */
export type Place = [x: number, y: number, r?: number, s?: number, o?: number];

export interface DiagramNode {
  label: keyof DiagramLabels;
  /** Etiqueta distinta en «sin» (el nodo de la IA del diagrama 2). */
  labelSin?: keyof DiagramLabels;
  kind: NodeKind;
  /** Estilo en «sin» cuando cambia: `faded` = OLD_FADED, `dark` = el nodo «IA genérica». */
  sinKind?: 'faded' | 'dark';
  at: Record<BaState, Place>;
  wd?: Partial<Record<BaState, string>>;
}

export type Segment = [x1: number, y1: number, x2: number, y2: number];

export interface DiagramGeometry { nodes: DiagramNode[]; lines: Segment[] }

type Key = keyof DiagramLabels;

// Diagrama 1: siete fuentes que pasan de dispersas a un anillo de radio 33 alrededor de «Tu empresa».
const src: Key[] = ['erp', 'crm', 'planillas', 'whatsapp', 'mails', 'documentos', 'personas'];
const scat: Place[] = [[24, 18, -6], [72, 14, 5], [80, 42, 9], [24, 50, -4], [66, 82, -8], [24, 84, 6], [54, 48, 3]];
const ring: Place[] = src.map((_, i) => {
  const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
  return [50 + 33 * Math.cos(a), 50 + 33 * Math.sin(a)];
});

// Diagrama 2: conocimiento suelto y apagado → columna bajo «IA + Nocti».
const kn: Key[] = ['procesos', 'reglas', 'clientes', 'precios', 'excepciones'];
const knScat: Place[] = [[20, 64, -5], [52, 76, 4], [80, 60, 7], [28, 90, 3], [74, 90, -4]];

// Diagrama 3: personas y agentes dispersos → filas sobre el contexto compartido.
const ppl: Key[] = ['ventas', 'finanzas', 'operaciones'];
const ag: Key[] = ['agComercial', 'agCobranzas'];
const pScat: Place[] = [[22, 18, -4], [78, 22, 5], [24, 70, 3]];
const pRow: [number, number][] = [[19, 22], [50, 22], [81, 22]];
const aScat: Place[] = [[72, 78, -6], [56, 46, 4]];
const aRow: [number, number][] = [[30, 48], [70, 48]];

export const DIAGRAMS: [DiagramGeometry, DiagramGeometry, DiagramGeometry] = [
  {
    nodes: [
      ...src.map((label, i): DiagramNode => ({ label, kind: 'src', at: { sin: scat[i]!, con: ring[i]! } })),
      { label: 'empresa', kind: 'core', at: { sin: [50, 50, 0, 0.4, 0], con: [50, 50] } },
    ],
    lines: ring.map(([x, y]): Segment => [50, 50, x, y]),
  },
  {
    nodes: [
      ...kn.map((label, i): DiagramNode => ({ label, kind: 'src', sinKind: 'faded', at: { sin: knScat[i]!, con: [50, 40 + i * 11] }, wd: { con: '52%' } })),
      { label: 'iaNocti', labelSin: 'iaGenerica', kind: 'core', sinKind: 'dark', at: { sin: [50, 18], con: [50, 18] }, wd: { con: '52%' } },
    ],
    lines: [[50, 18, 50, 84]],
  },
  {
    nodes: [
      ...ppl.map((label, i): DiagramNode => ({ label, kind: 'src', at: { sin: pScat[i]!, con: pRow[i]! } })),
      ...ag.map((label, i): DiagramNode => ({ label, kind: 'agent', at: { sin: aScat[i]!, con: aRow[i]! } })),
      { label: 'compartido', kind: 'core', at: { sin: [50, 80, 0, 0.6, 0], con: [50, 80] }, wd: { sin: '86%', con: '86%' } },
    ],
    lines: [...pRow, ...aRow].map(([x, y]): Segment => [x, y, x, 80]),
  },
];
