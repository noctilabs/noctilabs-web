// Origen ajeno para D7 (frame-ancestors): http://127.0.0.1:4955/?src=<url> devuelve una página con un iframe a <url>.
import { createServer } from 'node:http';
createServer((req, res) => {
  const src = new URL(req.url, 'http://x').searchParams.get('src') ?? '';
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><title>framer</title><iframe id="f" src="${src.replace(/"/g, '')}" width="800" height="600"></iframe>`);
}).listen(4955, '127.0.0.1', () => console.log('framer en http://127.0.0.1:4955'));
