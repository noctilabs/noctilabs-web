// D9: clasifica cada FALLA de B15 reflow/zoom de la rama. Es «del contrato de la fase 4» solo si es una página del
// formulario, su único desborde es el honeypot fuera de pantalla (§2.3) y, si dice «formulario NO operable», es porque
// el instrumento espera 4 errores y el consentimiento obligatorio (§2.2) suma un quinto. Uso: node d9-clasificar.mjs <salidas>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const HP = '["div.hp «» -10000..-9999","input «» -9996..-9995"]';
let otras = 0;
for (const name of ['b15-reflow-v2.txt', 'b15-zoom-v2.txt']) {
  const lines = readFileSync(join(dir, name), 'utf8').split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('FALLA')) continue;
    const detail = [];
    for (let j = i + 1; j < lines.length && /^\s{2,}\S/.test(lines[j]); j++) detail.push(lines[j].trim());
    blocks.push({ line: lines[i], detail });
  }
  let contrato = 0;
  for (const { line, detail } of blocks) {
    const page = /\s(\/(?:hablemos|en\/contact)\/)[:\s]/.exec(line)?.[1];
    const soloHoneypot = detail.length === 1 && detail[0] === `desborde: ${HP}`;
    const motivo = line.includes('formulario NO operable') ? 'honeypot + quinto error (consentimiento)' : 'honeypot';
    if (page && soloHoneypot) { contrato++; console.log(`${name}: del contrato (${motivo}) · ${line.slice(6, 60)}`); }
    else { otras++; console.log(`${name}: OTRA · ${line} ${JSON.stringify(detail)}`); }
  }
  console.log(`${name}: ${blocks.length} FALLA, ${contrato} explicadas por el contrato de la fase 4\n`);
}
console.log(`FALLAs de B15 no explicadas por el contrato: ${otras}`);
