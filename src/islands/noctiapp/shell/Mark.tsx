// Isotipo de Nocti (App L508–513): tres anillos de puntos y el núcleo azul. Decorativo.
const DOTS: { cx: number; cy: number; r: number }[] = [];
[[8, 7, 2.6], [13.2, 13, 1.85], [18.4, 19, 1.1]].forEach(([r, n, d], k) => {
  for (let i = 0; i < n!; i++) {
    const t = (i / n!) * Math.PI * 2 + k * 0.3;
    DOTS.push({ cx: +(24 + r! * Math.cos(t)).toFixed(3), cy: +(24 + r! * Math.sin(t)).toFixed(3), r: d! });
  }
});

export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="na-mark">
      {DOTS.map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#0B0B0C" />)}
      <circle cx="24" cy="24" r="3.8" fill="#0047FF" />
    </svg>
  );
}
