// @ts-nocheck — transcripción literal de icDef() de «NoctiLabs Web v4.dc.html» (V4 L1103–1187): íconos de trazo
// animados con la Web Animations API. Se mantiene igual al diseño para poder compararlo; los tipos viven en NIcon.tsx.
import { createElement as h } from 'react';

const SW = { strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke', fill: 'none' };
const org = (x, y) => ({ transformBox: 'view-box', transformOrigin: x + 'px ' + y + 'px' });
const DASH = { strokeDasharray: 1, strokeDashoffset: 0 };
const drawKf = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];

export function icDef(k, fg, ac, R) {
  const els = [], an = [];
  const L = (id, x1, y1, x2, y2, o = {}) => h('line', { key: id, ref: R(id), x1, y1, x2, y2, stroke: fg, ...SW, ...o });
  const Ld = (id, x1, y1, x2, y2, st, o = {}) => h('line', { key: id, ref: R(id), x1, y1, x2, y2, stroke: st, ...SW, pathLength: 1, style: DASH, ...o });
  const D = (id, cx, cy, r, f, o = {}) => h('circle', { key: id, ref: R(id), cx, cy, r, fill: f, ...o });
  if (k === 'b1') {
    els.push(h('circle', { key: 'ring', ref: R('ring'), cx: 10, cy: 10, r: 6, stroke: fg, ...SW, pathLength: 1, style: DASH }), L('hd', 14.6, 14.6, 20, 20));
    an.push(['ring', [{ opacity: 0, strokeDashoffset: 1 }, { opacity: 0, strokeDashoffset: 1, offset: .5 }, { opacity: 1, strokeDashoffset: 0 }], { duration: 1000 }]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = 10 + 6 * Math.cos(a), y = 10 + 6 * Math.sin(a), dx = (Math.cos(a) * 3.2).toFixed(2), dy = (Math.sin(a) * 3.2).toFixed(2);
      els.push(D('d' + i, x, y, 1, ac, { style: { opacity: 0 } }));
      an.push(['d' + i, [{ opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { opacity: 1, transform: 'translate(' + dx + 'px,' + dy + 'px)', offset: .15 }, { opacity: 1, transform: 'translate(0px,0px)', offset: .6 }, { opacity: 0, transform: 'translate(0px,0px)' }], { duration: 1000 }]); }
  } else if (k === 'b2') {
    [[4.5, 4.5], [19.5, 4.5], [19.5, 19.5], [4.5, 19.5]].forEach(([x, y], i) => { const n = Math.SQRT1_2, sx = x < 12 ? 1 : -1, sy = y < 12 ? 1 : -1;
      els.push(Ld('l' + i, x + sx * n * 2.4, y + sy * n * 2.4, 12 - sx * n * 3.6, 12 - sy * n * 3.6, fg), D('o' + i, x, y, 1.6, fg));
      an.push(['l' + i, drawKf, { duration: 380, delay: i * 130 }]); });
    els.push(D('c', 12, 12, 2.2, ac, { style: org(12, 12) }));
    an.push(['c', [{ transform: 'scale(.45)' }, { transform: 'scale(.45)', offset: .72 }, { transform: 'scale(1.3)', offset: .86 }, { transform: 'scale(1)' }], { duration: 1000 }]);
  } else if (k === 'b3') {
    els.push(h('rect', { key: 'a', ref: R('a'), x: 6, y: 6, width: 12, height: 12, rx: 2.5, stroke: fg, ...SW }), h('rect', { key: 'b', ref: R('b'), x: 6, y: 6, width: 12, height: 12, rx: 2.5, stroke: ac, ...SW, style: { opacity: 0 } }));
    an.push(['a', [{ transform: 'translate(-3.5px,-3.5px)' }, { transform: 'translate(0px,0px)' }], { duration: 800 }]);
    an.push(['b', [{ transform: 'translate(3.5px,3.5px)', opacity: 1 }, { transform: 'translate(0px,0px)', opacity: 1, offset: .75 }, { transform: 'translate(0px,0px)', opacity: 0 }], { duration: 1000 }]);
  } else if (k === 'b4') {
    const Pt = [0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [12 + 8.5 * Math.cos(a), 12.6 + 8.5 * Math.sin(a)]; });
    Pt.forEach(([x, y], i) => { const [x2, y2] = Pt[(i + 1) % 5];
      els.push(L('s' + i, 12, 12.6, x, y, { style: { opacity: 0 } }), Ld('m' + i, x, y, x2, y2, fg));
      an.push(['s' + i, [{ opacity: 1 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: 650 }]);
      an.push(['m' + i, [{ strokeDashoffset: 1, stroke: ac }, { strokeDashoffset: 0, stroke: ac, offset: .7 }, { strokeDashoffset: 0, stroke: fg }], { duration: 520, delay: 420 + i * 90 }]); });
    els.push(D('c', 12, 12.6, 2, ac, { style: { ...org(12, 12.6), opacity: 0 } }));
    an.push(['c', [{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1)', offset: .35 }, { opacity: 0, transform: 'scale(.3)' }], { duration: 650 }]);
    Pt.forEach(([x, y], i) => els.push(D('p' + i, x, y, 1.6, fg)));
  } else if (k === 'b5') {
    const A = [4, 17], B = [9.5, 6.5], C = [15, 16.5], N = [20.5, 7.5];
    els.push(L('ab', A[0], A[1], B[0], B[1]), L('bc', B[0], B[1], C[0], C[1]), L('ca', C[0], C[1], A[0], A[1]), Ld('nl', C[0], C[1], N[0], N[1], ac));
    [A, B, C].forEach((p, i) => els.push(D('p' + i, p[0], p[1], 1.7, fg)));
    els.push(D('n', N[0], N[1], 2.1, ac, { style: org(N[0], N[1]) }));
    an.push(['n', [{ transform: 'scale(0)' }, { transform: 'scale(1.4)', offset: .6 }, { transform: 'scale(1)' }], { duration: 320 }]);
    an.push(['nl', drawKf, { duration: 240, delay: 200, easing: 'ease-out' }]);
  } else if (k === 'b6') {
    [18, 12, 6].forEach((y, i) => { els.push(L('L' + i, 7, y, 20.5, y), D('D' + i, 3.5, y, 1.5, i === 2 ? ac : fg, { style: org(3.5, y) }));
      an.push(['L' + i, [{ opacity: 0, transform: 'translateY(-5px)', stroke: ac }, { opacity: 1, transform: 'translateY(0px)', stroke: ac, offset: .6 }, { opacity: 1, transform: 'translateY(0px)', stroke: fg }], { duration: 520, delay: i * 260 }]);
      an.push(['D' + i, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 220, delay: i * 260 + 300 }]); });
  } else if (k === 'b7') {
    const P7 = [[3.5, 18], [9, 13.5], [14, 15.5], [20, 7]];
    els.push(L('ax', 3, 21, 21, 21));
    for (let i = 0; i < 3; i++) { els.push(Ld('s' + i, P7[i][0], P7[i][1], P7[i + 1][0], P7[i + 1][1], i === 2 ? ac : fg)); an.push(['s' + i, drawKf, { duration: 260, delay: 120 + i * 230, easing: 'linear' }]); }
    P7.forEach(([x, y], i) => { els.push(D('p' + i, x, y, i === 3 ? 2.1 : 1.6, i === 3 ? ac : fg, { style: org(x, y) })); an.push(['p' + i, [{ transform: 'scale(0)' }, { transform: i === 3 ? 'scale(1.35)' : 'scale(1)', offset: .7 }, { transform: 'scale(1)' }], { duration: i === 3 ? 320 : 200, delay: i === 0 ? 0 : 80 + i * 230 }]); });
  } else if (k === 'c1') {
    els.push(h('path', { key: 'sq', ref: R('sq'), d: 'M6 10.2V8.5A2.5 2.5 0 0 1 8.5 6h7A2.5 2.5 0 0 1 18 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 15.5v-1.7', stroke: fg, ...SW }), Ld('g', 6, 10.2, 6, 13.8, fg), D('d1', 12, 12, 1.8, ac), D('d2', 2, 12, 1.6, fg));
    an.push(['d1', [{ transform: 'translate(-11px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 650 }]);
    an.push(['g', drawKf, { duration: 220, delay: 430 }]);
    an.push(['d2', [{ transform: 'translate(-5px,0px)', opacity: 0 }, { transform: 'translate(0px,0px)', opacity: 1 }], { duration: 500, delay: 520 }]);
  } else if (k === 'c2') {
    els.push(L('a', 2, 12, 8.3, 12), L('b', 15.7, 12, 22, 12), h('circle', { key: 'nd', ref: R('nd'), cx: 12, cy: 12, r: 3.7, stroke: fg, ...SW }), h('path', { key: 'ck', ref: R('ck'), d: 'M10.3 12.1l1.2 1.2 2.3-2.5', stroke: ac, ...SW, pathLength: 1, style: DASH }), D('d', 22, 12, 1.8, ac));
    an.push(['d', [{ transform: 'translate(-20px,0px)' }, { transform: 'translate(-13.7px,0px)', offset: .3 }, { transform: 'translate(-13.7px,0px)', offset: .62 }, { transform: 'translate(0px,0px)' }], { duration: 1200 }]);
    an.push(['ck', drawKf, { duration: 280, delay: 420 }]);
  } else if (k === 'c3') {
    els.push(h('rect', { key: 'bar', ref: R('bar'), x: 9, y: 3, width: 6, height: 18, rx: 3, stroke: fg, ...SW }), h('rect', { key: 'f', ref: R('f'), x: 10.8, y: 9, width: 2.4, height: 10.2, rx: 1.2, fill: ac, style: org(12, 19.2) }), L('t', 6.5, 9, 17.5, 9));
    an.push(['f', [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 900, easing: 'cubic-bezier(.25,.8,.25,1)' }]);
    an.push(['t', [{ stroke: fg }, { stroke: fg, offset: .78 }, { stroke: ac, offset: .88 }, { stroke: fg }], { duration: 1100 }]);
  } else if (k === 'c4') {
    const X = [3.5, 12, 20.5];
    X.forEach((x, i) => els.push(h('circle', { key: 'n' + i, ref: R('n' + i), cx: x, cy: 12, r: 2.3, stroke: fg, ...SW })));
    [6.8, 8.8, 15.2, 17.2].forEach((x, i) => els.push(D('p' + i, x, 12, .85, fg, { style: org(x, 12) })));
    X.forEach((x, i) => els.push(D('i' + i, x, 12, 1, i === 2 ? ac : fg, { style: org(x, 12) })));
    ['i0', 'p0', 'p1', 'i1', 'p2', 'p3', 'i2'].forEach((id, j) => an.push([id, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, delay: j * 150 }]));
  } else if (k === 'c5') {
    els.push(L('l', 2, 14, 10, 14), L('r', 16, 14, 22, 14), L('f', 10, 14, 16, 14, { style: { opacity: 0 } }), h('path', { key: 'b', ref: R('b'), d: 'M10 14h1.4l1.2-5.5 1.6 9 1-3.5h.8', stroke: fg, ...SW, style: org(13, 14) }), D('s', 22, 14, 1.7, ac));
    an.push(['s', [{ transform: 'translate(-20px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 1100, easing: 'linear' }]);
    an.push(['f', [{ opacity: 1 }, { opacity: 1, offset: .47 }, { opacity: 0, offset: .52 }, { opacity: 0 }], { duration: 1100, easing: 'linear' }]);
    an.push(['b', [{ opacity: 0, transform: 'scaleY(0)', stroke: ac }, { opacity: 0, transform: 'scaleY(0)', stroke: ac, offset: .47 }, { opacity: 1, transform: 'scaleY(1.15)', stroke: ac, offset: .58 }, { opacity: 1, transform: 'scaleY(1)', stroke: fg }], { duration: 1100, easing: 'linear' }]);
  } else if (k === 'c6') {
    const Y = [5.5, 10, 14.5, 19], X2 = [19.5, 15.5, 18, 13.5];
    els.push(L('L0', 4.5, Y[0], X2[0], Y[0], { stroke: ac }));
    for (let i = 1; i < 4; i++) { els.push(L('L' + i, 4.5, Y[i], X2[i], Y[i])); an.push(['L' + i, [{ transform: 'translateY(-4.5px)' }, { transform: 'translateY(0px)' }], { duration: 450 }]); }
    els.push(L('L4', 4.5, Y[3], 16, Y[3], { style: { opacity: 0 } }));
    an.push(['L4', [{ opacity: 1, transform: 'translateY(0px)' }, { opacity: 0, transform: 'translateY(4.5px)' }], { duration: 450 }]);
    an.push(['L0', [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'translateX(0px)' }], { duration: 450, delay: 330 }]);
  }
  return { els, an };
}
