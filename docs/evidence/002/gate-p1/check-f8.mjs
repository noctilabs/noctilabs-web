// Comprobación estática del build con F8: hallazgos 1–4 y 10 sobre el HTML generado.
import { readFileSync, existsSync } from 'node:fs';
const dist = process.argv[2];
const page = (p) => readFileSync(`${dist}/${p}/index.html`, 'utf8');
const out = [];
const ok = (name, cond, detail = '') => out.push(`${cond ? 'OK ' : 'FALLA'} ${name}${detail ? ` — ${detail}` : ''}`);

ok('H1 gate-nulo publicado (ES)', existsSync(`${dist}/insights/gate-nulo/index.html`));
ok('H1 gate-minutos excluido', !existsSync(`${dist}/insights/gate-minutos/index.html`));

for (const [l, p] of [['es', 'insights/gate-cuerpo'], ['en', 'en/insights/gate-cuerpo']]) {
  const h = page(p);
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  ok(`H2 ${l} ids únicos en la página`, dup.length === 0, dup.length ? `repetidos: ${dup.join(', ')}` : `${ids.length} ids`);
  const prose = h.slice(h.indexOf('<div class="prose-article"'), h.indexOf('</article>') > 0 ? h.indexOf('</article>') : undefined);
  const h2 = [...prose.split('related-title')[0].matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
  const toc = [...h.matchAll(/<nav class="toc"[\s\S]*?<\/nav>/g)][0]?.[0] ?? '';
  const tocTargets = [...toc.matchAll(/href="[^"#]*#([^"]+)"/g)].map((m) => m[1]);
  ok(`H2 ${l} cada link del índice apunta a su propio H2`, tocTargets.length === h2.length && tocTargets.every((t, i) => t === h2[i]), `h2=${h2.join(',')} toc=${tocTargets.join(',')}`);
  const hrefs = [...h.matchAll(/<div class="prose-article"[\s\S]*$/g)][0][0];
  const links = [...hrefs.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
  ok(`H3 ${l} relativos conservados`, ['../otro-articulo/', 'otro-articulo/', './?x=1'].every((x) => links.includes(x)), links.join(' | '));
  ok(`H3 ${l} protocolos peligrosos descartados`, !links.some((x) => /javascript:|evil/.test(x)));
  ok(`H4 ${l} sin lista con h3 ni lista check`, !/<li>\s*<h3|Lista con h3|Lista check/.test(hrefs));
  ok(`H4 ${l} lista válida renderizada`, /<li>Ítem válido<\/li>/.test(hrefs));
  ok(`H10 ${l} WhatsApp con translate=no en el cuerpo`, /<span translate="no">WhatsApp<\/span>/.test(hrefs));
}
console.log(out.join('\n'));
process.exitCode = out.some((l) => l.startsWith('FALLA')) ? 1 : 0;
