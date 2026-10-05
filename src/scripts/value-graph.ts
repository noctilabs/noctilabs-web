// Grafo de «El valor de una capa compartida» (spec 006 §3.3): 22 nodos que se encienden en 6 etapas, una por ítem del
// acordeón. Geometría y etapas del diseño (VN y VE de «NoctiLabs Web v3»), en unidades de un lienzo de 400 × 300.
// El SSR pinta la etapa 1 con graphState y el cliente repinta con paintGraph: una sola regla para los dos.

/** s = sistema, p = persona, a = agente, k = conocimiento. */
export type NodeKind = 's' | 'p' | 'a' | 'k';
export type NodeLabel =
  | 'erp' | 'crm' | 'drive' | 'whatsapp' | 'correo'
  | 'ventas' | 'finanzas' | 'operaciones' | 'compras'
  | 'agente' | 'politicas' | 'contratos';

export const NODES: readonly (readonly [x: number, y: number, kind: NodeKind, label?: NodeLabel])[] = [
  [70, 62, 's', 'erp'], [200, 40, 's', 'crm'], [330, 66, 's', 'drive'], [362, 178, 's', 'whatsapp'], [52, 196, 's', 'correo'],
  [140, 118, 'p', 'ventas'], [268, 128, 'p', 'finanzas'], [206, 222, 'p', 'operaciones'], [110, 252, 'p', 'compras'],
  [318, 240, 'a', 'agente'], [36, 128, 'k', 'politicas'], [376, 112, 'k', 'contratos'],
  [252, 78, 'k'], [164, 176, 'k'], [292, 186, 'k'], [118, 34, 'k'], [290, 24, 'k'], [24, 258, 'k'], [372, 258, 'k'],
  [172, 262, 'k'], [238, 164, 'k'], [92, 160, 'k'],
];

const STAGE_EDGES: readonly (readonly [stage: number, edges: readonly (readonly [number, number])[]])[] = [
  [1, [[0, 5], [1, 5], [2, 6]]],
  [2, [[0, 6], [10, 6], [11, 6], [1, 6]]],
  [3, [[9, 0], [9, 11], [9, 6], [7, 9]]],
  [4, [[7, 10], [8, 10], [8, 4], [5, 13], [13, 10], [7, 20]]],
  [5, [[9, 3], [9, 2], [3, 7], [4, 8], [14, 9], [14, 6]]],
  [6, [[15, 0], [15, 1], [16, 1], [16, 2], [17, 4], [17, 8], [18, 3], [18, 9], [19, 7], [19, 8], [20, 6], [20, 13], [21, 5], [21, 10], [12, 1], [12, 6], [12, 2], [13, 14], [21, 4], [20, 14], [5, 7]]],
];

export const EDGES = STAGE_EDGES.flatMap(([st, es]) => es.map(([a, b]) => ({ st, a, b })));
export const STAGES = STAGE_EDGES.length;

export type EdgeState = 'off' | 'past' | 'cur';

/** Etapa k (1..STAGES): las aristas de k resaltan y las anteriores quedan atenuadas; un nodo se enciende con su
 *  primera arista y brilla en las etapas en que se suma una arista suya. */
export function graphState(k: number): { edges: EdgeState[]; lit: boolean[]; hot: boolean[] } {
  const lit = NODES.map(() => false);
  const hot = NODES.map(() => false);
  const edges = EDGES.map(({ st, a, b }): EdgeState => {
    if (st <= k) lit[a] = lit[b] = true;
    if (st === k) hot[a] = hot[b] = true;
    return st < k ? 'past' : st === k ? 'cur' : 'off';
  });
  return { edges, lit, hot };
}

const pad = (n: number) => String(n).padStart(2, '0');
export const stageLabel = (k: number) => `${pad(k)} / ${pad(STAGES)}`;

/** Marcado: [data-edge] en el orden de EDGES, [data-node] en el orden de NODES y un [data-stage-label]. */
export function paintGraph(root: HTMLElement, k: number): void {
  const { edges, lit, hot } = graphState(k);
  root.querySelectorAll<SVGElement>('[data-edge]').forEach((e, i) => { e.dataset.s = edges[i]; });
  root.querySelectorAll<HTMLElement>('[data-node]').forEach((n, i) => {
    n.toggleAttribute('data-lit', lit[i]);
    n.toggleAttribute('data-hot', hot[i]);
  });
  root.querySelector('[data-stage-label]')!.textContent = stageLabel(k);
}
