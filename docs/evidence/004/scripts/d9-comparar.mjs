// D9: compara, script por script, las salidas de la regresión sobre la rama (reg/salidas) y sobre la línea de base
// 10847c1 sin la fase 4 (reg-base/salidas). Una FALLA nueva en la rama es una regresión; una que está en las dos es
// previa a la fase 4. Uso: node d9-comparar.mjs <reg/salidas> <reg-base/salidas>
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [rama, base] = process.argv.slice(2);
// Normaliza lo que cambia entre corridas o entre builds (hashes de assets, tiempos, rutas) para comparar el texto.
const norm = (l) => l.replace(/\.[\w-]{8}\.(js|css)/g, '.HASH.$1').replace(/\d+(\.\d+)? ?ms/g, 'N ms').replace(/localhost:49\d\d/g, 'localhost:PORT').trim();
const fallas = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => /FALLA/.test(l)).map(norm);
const oks = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => /^\s*OK\b/.test(l)).length;
let nuevas = 0;
for (const name of readdirSync(rama).filter((f) => f.endsWith('.txt')).sort()) {
  const fr = join(rama, name);
  const fb = join(base, name);
  const r = fallas(fr);
  const b = existsSync(fb) ? fallas(fb) : null;
  const nuevasAqui = b ? r.filter((l) => !b.includes(l)) : r;
  const resueltas = b ? b.filter((l) => !r.includes(l)) : [];
  nuevas += b ? nuevasAqui.length : 0;
  console.log(`${name.padEnd(32)} rama: ${String(oks(fr)).padStart(4)} OK / ${r.length} FALLA · base: ${b ? `${String(oks(fb)).padStart(4)} OK / ${b.length} FALLA` : 'sin equivalente'}${b ? ` · nuevas ${nuevasAqui.length}, resueltas ${resueltas.length}` : ''}`);
  for (const l of nuevasAqui) console.log(`    nueva en la rama: ${l.slice(0, 260)}`);
  for (const l of resueltas) console.log(`    solo en la base: ${l.slice(0, 260)}`);
}
console.log(`\nFALLAs nuevas en la rama respecto de la línea de base (scripts con equivalente): ${nuevas}`);
