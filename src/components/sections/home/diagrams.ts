// Geometría de los diagramas de la Opción 2 (Inv §9.10–9.11, `diagrams(con)` L571–600). Posiciones en % del lienzo.
import type { DiagramLabels } from '../../../content/pages/home';

export type NodeKind = 'src' | 'srcSm' | 'chip' | 'dark' | 'agent' | 'layer' | 'block' | 'tag' | 'badge';

export interface DiagramNode {
  /** Clave de la etiqueta en DiagramLabels; null = «✓». */
  label: keyof DiagramLabels | null;
  x: number;
  y: number;
  kind: NodeKind;
  /** Escala con «sin» para los nodos que aparecen con «con» (`show(con, sc)`); ausente = siempre visible. */
  off?: number;
  wd?: string;
  ht?: string;
}

export type Segment = [x1: number, y1: number, x2: number, y2: number];

export interface DiagramGeometry { nodes: DiagramNode[]; lines: Segment[] }

const n = (label: DiagramNode['label'], x: number, y: number, kind: NodeKind, extra: Partial<DiagramNode> = {}): DiagramNode =>
  ({ label, x, y, kind, ...extra });

const top: [keyof DiagramLabels, number, number][] = [['erp', 18, 16], ['crm', 50, 13], ['planillas', 82, 16], ['personas', 34, 33]];
const bot: [keyof DiagramLabels, number, number][] = [['mails', 18, 84], ['whatsapp', 50, 87], ['documentos', 82, 84]];
const srcs: [keyof DiagramLabels, number][] = [['erp', 15], ['crm', 37], ['documentos', 61], ['personas', 85]];

export const DIAGRAMS: [DiagramGeometry, DiagramGeometry, DiagramGeometry] = [
  {
    nodes: [
      n('capa', 50, 58, 'layer', { wd: '88%', ht: '12%', off: 0.92 }),
      ...[...top, ...bot].map(([l, x, y]) => n(l, x, y, 'src')),
    ],
    lines: [
      ...top.map(([, x, y]): Segment => [x, y + 4.5, x, 52]),
      ...bot.map(([, x, y]): Segment => [x, y - 4.5, x, 64]),
    ],
  },
  {
    nodes: [
      n('contexto', 50, 52, 'block', { wd: '84%', ht: '38%', off: 0.96 }),
      n('procesos', 31, 50, 'chip'), n('reglas', 69, 50, 'chip'), n('relaciones', 31, 61, 'chip'), n('excepciones', 69, 61, 'chip'),
      ...srcs.map(([l, x]) => n(l, x, 87, 'srcSm')),
      n('ia', 50, 14, 'dark'),
      n('construido', 70, 71, 'tag', { off: 0.8 }),
    ],
    lines: [...srcs.map(([, x]): Segment => [x, 83, x, 71]), [50, 18.5, 50, 33]],
  },
  {
    nodes: [
      n('compartido', 50, 84, 'layer', { wd: '88%', ht: '12%', off: 0.92 }),
      n('ventas', 19, 16, 'src'), n('finanzas', 50, 16, 'src'), n('operaciones', 81, 16, 'src'),
      n('agComercial', 27, 42, 'agent'), n('agCobranzas', 72, 42, 'agent'), n('aplicaciones', 50, 60, 'src'),
      n(null, 19, 50, 'badge', { off: 0.5 }), n(null, 72, 63, 'badge', { off: 0.5 }), n(null, 50, 71, 'badge', { off: 0.5 }),
    ],
    lines: [[19, 20.5, 19, 78], [50, 20.5, 50, 55.5], [81, 20.5, 81, 78], [27, 46.5, 27, 78], [72, 46.5, 72, 78], [50, 64.5, 50, 78]],
  },
];
