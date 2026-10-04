// Isotipo de NoctiLabs: misma fórmula que mark() en «NoctiLabs Web v3.dc.html» (L539–544).
const RINGS: [r: number, n: number, d: number][] = [[8, 7, 2.6], [13.2, 13, 1.85], [18.4, 19, 1.1]];

const round = (x: number) => Math.round(x * 1000) / 1000;

export function markSvg(fg: string, core: string, attrs = ''): string {
  const dots = RINGS.flatMap(([r, n, d], k) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2 + k * 0.3;
      return `<circle cx="${round(24 + r * Math.cos(t))}" cy="${round(24 + r * Math.sin(t))}" r="${d}" fill="${fg}"/>`;
    }),
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"${attrs ? ' ' + attrs : ''}>${dots}<circle cx="24" cy="24" r="3.8" fill="${core}"/></svg>`;
}
