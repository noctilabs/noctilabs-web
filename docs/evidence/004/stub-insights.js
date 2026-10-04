/* Stub del consumidor de la cola de Vercel Web Analytics (spec 004 §2.7, D8). Reemplaza /_vercel/insights/script.js
   en la verificación local: lee window.vaq, ejecuta el beforeSend encolado con eventos sintéticos y publica entrada
   y salida en window.__stub. No manda nada a ningún lado. */
(function () {
  var q = window.vaq || [];
  var bs = null;
  for (var i = 0; i < q.length; i++) if (q[i][0] === 'beforeSend') bs = q[i][1];
  var base = location.origin + location.pathname;
  var inputs = [
    { type: 'pageview', url: base + '?utm_source=x&b=2' },
    { type: 'pageview', url: base + '#seccion' },
    { type: 'pageview', url: base + '?email=persona@example.com#frag' },
    { type: 'event', url: base + '?q=1#h' },
    { type: 'pageview', url: base }
  ];
  var script = document.querySelector('script[src$="/_vercel/insights/script.js"]');
  window.__stub = {
    found: typeof bs === 'function',
    queue: q.map(function (x) { return x[0]; }),
    dataset: script ? Object.assign({}, script.dataset) : null,
    io: bs ? inputs.map(function (e) { return { input: e, output: bs(e) }; }) : []
  };
})();
