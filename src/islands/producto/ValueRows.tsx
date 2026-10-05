// Filas de «El valor de una capa compartida» (spec 007 §3.4, V4 L554–560). El texto sale en el HTML del servidor;
// la isla solo agrega los íconos animados: se dibujan al entrar en pantalla y se repiten al pasar por la fila.
import { useState } from 'react';
import { NIcon } from './NIcon';

interface Row { k: string; t: string; d: string }

export default function ValueRows({ rows }: { rows: Row[] }) {
  const [go, setGo] = useState<Record<number, number>>({});
  return (
    <ol className="vr">
      {rows.map((r, i) => (
        <li key={r.k} className="vr-row" onMouseEnter={() => setGo((g) => ({ ...g, [i]: (g[i] || 0) + 1 }))}>
          <div className="vr-ic">
            <NIcon k={r.k} fg="#0B0B0C" ac="#0047FF" size={48} prime noHover go={go[i] || 0} />
            <span className="vr-n">{'0' + (i + 1)}</span>
          </div>
          <h3 className="vr-t">{r.t}</h3>
          <p className="vr-d">{r.d}</p>
        </li>
      ))}
    </ol>
  );
}
