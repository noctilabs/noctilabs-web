// Chequeo de layout reutilizable: desborde horizontal, texto recortado y superposición entre hojas de texto visibles.
export const LAYOUT = `(() => {
  const W = document.documentElement.clientWidth;
  const vis = (e) => { if (e.closest('[hidden], .sr-only, [aria-hidden="true"] .sr-only')) return false; const cs = getComputedStyle(e); if (cs.visibility !== 'visible' || +cs.opacity === 0 || cs.display === 'none') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const desc = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').filter(c => !c.startsWith('astro-'))[0] : '') + ' «' + (e.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 30) + '»';
  const out = { scrollW: document.documentElement.scrollWidth, W, desborde: [], recorte: [], superpuestos: [] };
  // Contenedores con scroll horizontal propio (SEG, tablist): su contenido se desplaza adentro, no cuenta como desborde.
  const scroller = (e) => { for (let p = e.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p); if (/auto|scroll/.test(cs.overflowX)) return true; } return false; };
  const all = [...document.querySelectorAll('body *')].filter(vis);
  for (const e of all) {
    const r = e.getBoundingClientRect();
    if ((r.right > W + .5 || r.left < -.5) && !scroller(e) && getComputedStyle(e).position !== 'fixed') out.desborde.push(desc(e) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    const cs = getComputedStyle(e);
    const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (hasText && (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY))) {
      if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) out.recorte.push(desc(e) + ' scroll ' + e.scrollWidth + '×' + e.scrollHeight + ' > client ' + e.clientWidth + '×' + e.clientHeight);
    }
    if (hasText && cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) out.recorte.push('elipsis ' + desc(e));
  }
  // Superposición: rectángulos de texto (Range) de hojas con texto propio, entre elementos que no son ancestro/descendiente.
  const leaves = all.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !e.closest('svg'));
  const boxes = leaves.map(e => { const rg = document.createRange(); const rs = []; for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { rg.selectNodeContents(n); rs.push(...[...rg.getClientRects()].filter(x => x.width > 1 && x.height > 1)); } return { e, rs }; });
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j];
    if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    let hit = null;
    for (const a of A.rs) { for (const b of B.rs) { const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 1 && oy > 2) { hit = [ox, oy]; break; } } if (hit) break; }
    if (hit) out.superpuestos.push(desc(A.e) + ' / ' + desc(B.e) + ' (' + hit[0].toFixed(1) + '×' + hit[1].toFixed(1) + ' px)');
  }
  // Recorte por un ancestro (gate 002, hallazgo 9): texto visible que se sale de un ancestro con overflow hidden/clip.
  for (const { e, rs } of boxes) {
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/auto|scroll/.test(cs.overflowX)) break;
      const cx = /hidden|clip/.test(cs.overflowX), cy = /hidden|clip/.test(cs.overflowY);
      if (!cx && !cy) continue;
      const pr = p.getBoundingClientRect();
      const bad = rs.some(r => (cx && (r.left < pr.left - 1 || r.right > pr.right + 1)) || (cy && (r.top < pr.top - 1 || r.bottom > pr.bottom + 1)));
      if (bad) { out.recorte.push('recortado por ancestro ' + desc(p) + ': ' + desc(e)); break; }
    }
  }
  return out;
})()`;
