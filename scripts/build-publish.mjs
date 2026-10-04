// Perfil de publicación (spec 004 §2.2 y §2.9): `npm run build:publish`, el buildCommand de vercel.json.
// Define PUBLISH=1 (portable, sin depender del shell), corre el build y termina con check-redirects.mjs.
import { spawnSync } from 'node:child_process';

process.env.PUBLISH = '1';
const run = (cmd) => spawnSync(cmd, { stdio: 'inherit', shell: true, env: process.env }).status ?? 1;

const build = run('npm run build');
if (build !== 0) process.exit(build);
process.exit(run('node scripts/check-redirects.mjs'));
