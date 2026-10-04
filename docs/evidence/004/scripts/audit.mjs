// Recorrido común de D7/D8: violaciones CSP desde la navegación inicial, cabeceras HTTP del documento, errores de
// consola y atributos `style` aplicados.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export function routesOf(dist) {
  const out = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f === 'index.html') out.push(`/${relative(dist, d).split('\\').join('/')}${relative(dist, d) ? '/' : ''}`);
    }
  })(dist);
  return out.sort();
}

export async function setupAudit(b) {
  await b.send('Network.enable');
  await b.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push({ directive: e.effectiveDirective, blocked: e.blockedURI, sample: e.sample, line: e.lineNumber }), true);`,
  });
  const docs = [];
  b.on((m) => {
    if (m.method === 'Network.responseReceived' && m.params.type === 'Document') docs.push({ url: m.params.response.url, status: m.params.response.status, headers: m.params.response.headers });
  });
  return docs;
}

export const STYLE_CHECK = `(() => {
  const els = [...document.querySelectorAll('[style]')];
  const bad = els.filter((e) => e.style.length === 0 && e.getAttribute('style').trim() !== '');
  const custom = els.filter((e) => /--[a-z-]+\\s*:/.test(e.getAttribute('style'))).filter((e) => {
    const [, name, value] = /(--[a-z-]+)\\s*:\\s*([^;]+)/.exec(e.getAttribute('style'));
    return getComputedStyle(e).getPropertyValue(name).trim() !== value.trim();
  });
  return { total: els.length, sinAplicar: bad.length + custom.length };
})()`;
