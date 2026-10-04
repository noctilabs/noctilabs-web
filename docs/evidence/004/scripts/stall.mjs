// Servidor de respuesta trabada para D2 (timeout en la lectura del cuerpo): manda cabeceras 200 y un pedazo del
// JSON, y nunca termina. Solo lo alcanza un pedido de Web3Forms redirigido por CDP Fetch (continueRequest).
import { createServer } from 'node:http';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, accept', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
  req.resume();
  res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
  res.write('{"succ');
  // Sin res.end(): el cuerpo queda trabado.
}).listen(4957, '127.0.0.1', () => console.log('stall en http://127.0.0.1:4957'));
