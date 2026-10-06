// Íconos animados de la v4 (NIcon / icDef del diseño, L1090–1174): Valor (b*) y los seis controles (c*).
// Una sola definición para el SSR (iconMarkup) y para el cliente (playIcon): el marcado sale en su estado final, así sin
// JavaScript o con reduced motion se ven completos; la animación (Web Animations, ≤ 1,2 s) arranca desde ese marcado.
//
// Colores: el trazo principal es currentColor y el acento la variable CSS --ac del <svg>. Los keyframes que cambian de
// color usan los marcadores FG / AC, que playIcon resuelve con los colores computados del <svg>.

export type IconKey = 'b1' | 'b2' | 'b3' | 'b5' | 'b6' | 'b7' | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';
type Color = 'FG' | 'AC';
type Kf = Record<string, string | number>;
type Anim = [id: string, keyframes: Kf[], opts: KeyframeAnimationOptions];
interface El { tag: 'line' | 'circle' | 'rect' | 'path'; id: string; a: Record<string, string | number>; s: Record<string, string> }

const SW = { 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke', fill: 'none' };
const DASH = { 'stroke-dasharray': '1', 'stroke-dashoffset': '0' };
const org = (x: number, y: number) => ({ 'transform-box': 'view-box', 'transform-origin': `${x}px ${y}px` });
const drawKf: Kf[] = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
const r2 = (n: number) => +n.toFixed(3);

function def(k: IconKey): { els: El[]; an: Anim[] } {
  const els: El[] = [];
  const an: Anim[] = [];
  // El color va como atributo (currentColor) o como estilo (var(--ac)), para que el CSS del componente lo cambie.
  const paint = (prop: 'stroke' | 'fill', c: Color, a: El['a'], s: El['s']) => { if (c === 'FG') a[prop] = 'currentColor'; else s[prop] = 'var(--ac)'; };
  const add = (tag: El['tag'], id: string, a: El['a'], s: El['s'] = {}) => els.push({ tag, id, a, s });
  const L = (id: string, x1: number, y1: number, x2: number, y2: number, c: Color = 'FG', s: El['s'] = {}) => {
    const a: El['a'] = { x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), ...SW };
    paint('stroke', c, a, s); add('line', id, a, s);
  };
  const Ld = (id: string, x1: number, y1: number, x2: number, y2: number, c: Color) => {
    const a: El['a'] = { x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), ...SW, pathLength: 1 };
    const s: El['s'] = { ...DASH };
    paint('stroke', c, a, s); add('line', id, a, s);
  };
  const D = (id: string, cx: number, cy: number, r: number, c: Color, s: El['s'] = {}) => {
    const a: El['a'] = { cx: r2(cx), cy: r2(cy), r };
    paint('fill', c, a, s); add('circle', id, a, s);
  };
  const stroked = (tag: El['tag'], id: string, a: El['a'], c: Color = 'FG', s: El['s'] = {}) => {
    const at: El['a'] = { ...a, ...SW };
    paint('stroke', c, at, s); add(tag, id, at, s);
  };

  if (k === 'b1') {
    stroked('circle', 'ring', { cx: 10, cy: 10, r: 6, pathLength: 1 }, 'FG', { ...DASH });
    L('hd', 14.6, 14.6, 20, 20);
    an.push(['ring', [{ opacity: 0, strokeDashoffset: 1 }, { opacity: 0, strokeDashoffset: 1, offset: .5 }, { opacity: 1, strokeDashoffset: 0 }], { duration: 1000 }]);
    for (let i = 0; i < 8; i++) {
      const t = i / 8 * Math.PI * 2, dx = (Math.cos(t) * 3.2).toFixed(2), dy = (Math.sin(t) * 3.2).toFixed(2), tr = `translate(${dx}px,${dy}px)`;
      D('d' + i, 10 + 6 * Math.cos(t), 10 + 6 * Math.sin(t), 1, 'AC', { opacity: '0' });
      an.push(['d' + i, [{ opacity: 0, transform: tr }, { opacity: 1, transform: tr, offset: .15 }, { opacity: 1, transform: 'translate(0px,0px)', offset: .6 }, { opacity: 0, transform: 'translate(0px,0px)' }], { duration: 1000 }]);
    }
  } else if (k === 'b2') {
    ([[4.5, 4.5], [19.5, 4.5], [19.5, 19.5], [4.5, 19.5]] as const).forEach(([x, y], i) => {
      const n = Math.SQRT1_2, sx = x < 12 ? 1 : -1, sy = y < 12 ? 1 : -1;
      Ld('l' + i, x + sx * n * 2.4, y + sy * n * 2.4, 12 - sx * n * 3.6, 12 - sy * n * 3.6, 'FG');
      D('o' + i, x, y, 1.6, 'FG');
      an.push(['l' + i, drawKf, { duration: 380, delay: i * 130 }]);
    });
    D('c', 12, 12, 2.2, 'AC', org(12, 12));
    an.push(['c', [{ transform: 'scale(.45)' }, { transform: 'scale(.45)', offset: .72 }, { transform: 'scale(1.3)', offset: .86 }, { transform: 'scale(1)' }], { duration: 1000 }]);
  } else if (k === 'b3') {
    stroked('rect', 'a', { x: 6, y: 6, width: 12, height: 12, rx: 2.5 });
    stroked('rect', 'b', { x: 6, y: 6, width: 12, height: 12, rx: 2.5 }, 'AC', { opacity: '0' });
    an.push(['a', [{ transform: 'translate(-3.5px,-3.5px)' }, { transform: 'translate(0px,0px)' }], { duration: 800 }]);
    an.push(['b', [{ transform: 'translate(3.5px,3.5px)', opacity: 1 }, { transform: 'translate(0px,0px)', opacity: 1, offset: .75 }, { transform: 'translate(0px,0px)', opacity: 0 }], { duration: 1000 }]);
  } else if (k === 'b5') {
    const A = [4, 17] as const, B = [9.5, 6.5] as const, C = [15, 16.5] as const, N = [20.5, 7.5] as const;
    L('ab', A[0], A[1], B[0], B[1]); L('bc', B[0], B[1], C[0], C[1]); L('ca', C[0], C[1], A[0], A[1]);
    Ld('nl', C[0], C[1], N[0], N[1], 'AC');
    [A, B, C].forEach((p, i) => D('p' + i, p[0], p[1], 1.7, 'FG'));
    D('n', N[0], N[1], 2.1, 'AC', org(N[0], N[1]));
    an.push(['n', [{ transform: 'scale(0)' }, { transform: 'scale(1.4)', offset: .6 }, { transform: 'scale(1)' }], { duration: 320 }]);
    an.push(['nl', drawKf, { duration: 240, delay: 200, easing: 'ease-out' }]);
  } else if (k === 'b6') {
    [18, 12, 6].forEach((y, i) => {
      L('L' + i, 7, y, 20.5, y);
      D('D' + i, 3.5, y, 1.5, i === 2 ? 'AC' : 'FG', org(3.5, y));
      an.push(['L' + i, [{ opacity: 0, transform: 'translateY(-5px)', stroke: 'AC' }, { opacity: 1, transform: 'translateY(0px)', stroke: 'AC', offset: .6 }, { opacity: 1, transform: 'translateY(0px)', stroke: 'FG' }], { duration: 520, delay: i * 260 }]);
      an.push(['D' + i, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 220, delay: i * 260 + 300 }]);
    });
  } else if (k === 'b7') {
    const P = [[3.5, 18], [9, 13.5], [14, 15.5], [20, 7]] as const;
    L('ax', 3, 21, 21, 21);
    for (let i = 0; i < 3; i++) {
      Ld('s' + i, P[i]![0], P[i]![1], P[i + 1]![0], P[i + 1]![1], i === 2 ? 'AC' : 'FG');
      an.push(['s' + i, drawKf, { duration: 260, delay: 120 + i * 230, easing: 'linear' }]);
    }
    P.forEach(([x, y], i) => {
      D('p' + i, x, y, i === 3 ? 2.1 : 1.6, i === 3 ? 'AC' : 'FG', org(x, y));
      an.push(['p' + i, [{ transform: 'scale(0)' }, { transform: i === 3 ? 'scale(1.35)' : 'scale(1)', offset: .7 }, { transform: 'scale(1)' }], { duration: i === 3 ? 320 : 200, delay: i === 0 ? 0 : 80 + i * 230 }]);
    });
  } else if (k === 'c1') {
    stroked('path', 'sq', { d: 'M6 10.2V8.5A2.5 2.5 0 0 1 8.5 6h7A2.5 2.5 0 0 1 18 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 15.5v-1.7' });
    Ld('g', 6, 10.2, 6, 13.8, 'FG');
    D('d1', 12, 12, 1.8, 'AC');
    D('d2', 2, 12, 1.6, 'FG');
    an.push(['d1', [{ transform: 'translate(-11px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 650 }]);
    an.push(['g', drawKf, { duration: 220, delay: 430 }]);
    an.push(['d2', [{ transform: 'translate(-5px,0px)', opacity: 0 }, { transform: 'translate(0px,0px)', opacity: 1 }], { duration: 500, delay: 520 }]);
  } else if (k === 'c2') {
    L('a', 2, 12, 8.3, 12); L('b', 15.7, 12, 22, 12);
    stroked('circle', 'nd', { cx: 12, cy: 12, r: 3.7 });
    stroked('path', 'ck', { d: 'M10.3 12.1l1.2 1.2 2.3-2.5', pathLength: 1 }, 'AC', { ...DASH });
    D('d', 22, 12, 1.8, 'AC');
    an.push(['d', [{ transform: 'translate(-20px,0px)' }, { transform: 'translate(-13.7px,0px)', offset: .3 }, { transform: 'translate(-13.7px,0px)', offset: .62 }, { transform: 'translate(0px,0px)' }], { duration: 1200 }]);
    an.push(['ck', drawKf, { duration: 280, delay: 420 }]);
  } else if (k === 'c3') {
    stroked('rect', 'bar', { x: 9, y: 3, width: 6, height: 18, rx: 3 });
    const s: El['s'] = { ...org(12, 19.2) };
    const a: El['a'] = { x: 10.8, y: 9, width: 2.4, height: 10.2, rx: 1.2 };
    paint('fill', 'AC', a, s); add('rect', 'f', a, s);
    L('t', 6.5, 9, 17.5, 9);
    an.push(['f', [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 900, easing: 'cubic-bezier(.25,.8,.25,1)' }]);
    an.push(['t', [{ stroke: 'FG' }, { stroke: 'FG', offset: .78 }, { stroke: 'AC', offset: .88 }, { stroke: 'FG' }], { duration: 1100 }]);
  } else if (k === 'c4') {
    const X = [3.5, 12, 20.5];
    X.forEach((x, i) => stroked('circle', 'n' + i, { cx: x, cy: 12, r: 2.3 }));
    [6.8, 8.8, 15.2, 17.2].forEach((x, i) => D('p' + i, x, 12, .85, 'FG', org(x, 12)));
    X.forEach((x, i) => D('i' + i, x, 12, 1, i === 2 ? 'AC' : 'FG', org(x, 12)));
    ['i0', 'p0', 'p1', 'i1', 'p2', 'p3', 'i2'].forEach((id, j) => an.push([id, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, delay: j * 150 }]));
  } else if (k === 'c5') {
    L('l', 2, 14, 10, 14); L('r', 16, 14, 22, 14); L('f', 10, 14, 16, 14, 'FG', { opacity: '0' });
    stroked('path', 'b', { d: 'M10 14h1.4l1.2-5.5 1.6 9 1-3.5h.8' }, 'FG', org(13, 14));
    D('s', 22, 14, 1.7, 'AC');
    an.push(['s', [{ transform: 'translate(-20px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 1100, easing: 'linear' }]);
    an.push(['f', [{ opacity: 1 }, { opacity: 1, offset: .47 }, { opacity: 0, offset: .52 }, { opacity: 0 }], { duration: 1100, easing: 'linear' }]);
    an.push(['b', [{ opacity: 0, transform: 'scaleY(0)', stroke: 'AC' }, { opacity: 0, transform: 'scaleY(0)', stroke: 'AC', offset: .47 }, { opacity: 1, transform: 'scaleY(1.15)', stroke: 'AC', offset: .58 }, { opacity: 1, transform: 'scaleY(1)', stroke: 'FG' }], { duration: 1100, easing: 'linear' }]);
  } else {
    const Y = [5.5, 10, 14.5, 19], X2 = [19.5, 15.5, 18, 13.5];
    L('L0', 4.5, Y[0]!, X2[0]!, Y[0]!, 'AC');
    for (let i = 1; i < 4; i++) { L('L' + i, 4.5, Y[i]!, X2[i]!, Y[i]!); an.push(['L' + i, [{ transform: 'translateY(-4.5px)' }, { transform: 'translateY(0px)' }], { duration: 450 }]); }
    L('L4', 4.5, Y[3]!, 16, Y[3]!, 'FG', { opacity: '0' });
    an.push(['L4', [{ opacity: 1, transform: 'translateY(0px)' }, { opacity: 0, transform: 'translateY(4.5px)' }], { duration: 450 }]);
    an.push(['L0', [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'translateX(0px)' }], { duration: 450, delay: 330 }]);
  }
  return { els, an };
}

/** Contenido interno del <svg viewBox="0 0 24 24"> en su estado final. */
export function iconMarkup(k: IconKey): string {
  return def(k).els.map(({ tag, id, a, s }) => {
    const attrs = Object.entries(a).map(([n, v]) => `${n}="${v}"`).join(' ');
    const style = Object.entries(s).map(([n, v]) => `${n}:${v}`).join(';');
    return `<${tag} data-i="${id}" ${attrs}${style ? ` style="${style}"` : ''}/>`;
  }).join('');
}

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const running = new WeakMap<Element, Animation[]>();

/** Corre la animación del ícono una vez; con `paused` lo deja quieto en el primer cuadro (el «prime» del diseño). */
export function playIcon(svg: SVGSVGElement, paused = false): void {
  if (still()) return;
  const k = svg.dataset.nicon as IconKey;
  const cs = getComputedStyle(svg);
  const col = { FG: cs.color, AC: cs.getPropertyValue('--ac').trim() || cs.color };
  running.get(svg)?.forEach((a) => a.cancel());
  const list: Animation[] = [];
  for (const [id, kf, o] of def(k).an) {
    const el = svg.querySelector(`[data-i="${id}"]`);
    if (!el) continue;
    const frames = kf.map((f) => Object.fromEntries(Object.entries(f).map(([p, v]) => [p, v === 'FG' || v === 'AC' ? col[v] : v])));
    const a = el.animate(frames, { duration: 800, fill: 'both', easing: 'cubic-bezier(.4,0,.2,1)', ...o });
    a.onfinish = () => a.cancel();
    if (paused) a.pause();
    list.push(a);
  }
  running.set(svg, list);
}

/**
 * Íconos con data-nicon-auto dentro de `root`: se animan una vez al entrar en pantalla (60 % visibles). Con
 * data-nicon-prime esperan en el primer cuadro hasta entonces; con data-nicon-hover se repiten con el hover del propio ícono.
 */
export function initIcons(root: ParentNode): void {
  const auto = [...root.querySelectorAll<SVGSVGElement>('svg[data-nicon-auto]')];
  if (!auto.length || still()) return;
  for (const svg of auto) {
    if (svg.hasAttribute('data-nicon-prime')) playIcon(svg, true);
    if (svg.hasAttribute('data-nicon-hover')) svg.addEventListener('mouseenter', () => playIcon(svg));
  }
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { io.unobserve(e.target); playIcon(e.target as SVGSVGElement); }
  }, { threshold: .6 });
  auto.forEach((svg) => io.observe(svg));
}
