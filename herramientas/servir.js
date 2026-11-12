// Servidor local con los encabezados que WeedJS necesita (SharedArrayBuffer), como servir.py pero con Node (en la compu
// puede no haber Python): node herramientas/servir.js [puerto]   (8000 si no se dice)
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..'), PUERTO = +(process.argv[2] || 8000);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.wasm': 'application/wasm', '.frag': 'text/plain; charset=utf-8',
  '.vert': 'text/plain; charset=utf-8', '.wgsl': 'text/plain; charset=utf-8', '.bin': 'application/octet-stream', '.md': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(RAIZ, path.normalize(p));
  if (!f.startsWith(RAIZ)) { res.writeHead(403); res.end(); return; }
  fs.stat(f, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end('no está: ' + p); return; }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size,
      'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp', 'Cross-Origin-Resource-Policy': 'same-origin',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(f).pipe(res);
  });
}).listen(PUERTO, () => console.log(`http://localhost:${PUERTO}/`));
