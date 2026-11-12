// Arma las hojas de objetos que lee el juego: img/objetos/<pack>.png|json (una por pack de arte/objetos, según indice.csv) y
// img/objetos/viejos.png|json (lo que queda de la hoja vieja del editor: carteles, piletas, pizarras, el semáforo y las sombras), más
// img/objetos/hojas.js, la lista que importa la escena, y la hoja de fachadas del editor (editor/recursos/fachada.png|js, con las piezas
// fd_* de arte/fachadas). Las arma editor/hojas.html en un Chromium sin ventana (canvas).
// Después corre herramientas/objetos.js, que arma el catálogo del editor con esas hojas.
// Con el juego servido (node herramientas/servir.js 8010): node herramientas/hojas.js [--url http://127.0.0.1:8010]
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { playwright } = require('./playwright.js');
const R = path.join(__dirname, '..'), DIR = path.join(R, 'arte', 'objetos'), SAL = path.join(R, 'img', 'objetos');
const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const URL0 = arg('url', 'http://127.0.0.1:8010').replace(/\/$/, '');
// lo de la hoja vieja que sigue en uso (la plantilla de nombres de editor/js/hojas.js viejos())
const VIEJOS = '^(cartel|pileta|pizarra_[0-9]+|u_semaforo|sh_.+)$';

// el índice del zip (CSV con comillas: alguna subcategoría lleva coma)
function csv(txt) {
  const filas = []; let fila = [], campo = '', q = false;
  for (let i = 0; i < txt.length; i++) { const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; continue; }
    if (c === '"') q = true; else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else campo += c; }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}
// el nombre de una hoja: el del pack, en minúsculas y con guiones bajos («0-mem0ry Garden Planters» → mem0ry_garden_planters)
const slug = (s) => s.toLowerCase().replace(/^0-/, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const packDe = (archivo, pack) => slug(pack);

(async () => {
  const filas = csv(fs.readFileSync(path.join(DIR, 'indice.csv'), 'utf8')), cab = filas.shift();
  const iA = cab.indexOf('archivo'), iP = cab.indexOf('pack_origen'), lista = {}, vistos = new Map();
  for (const f of filas) { if (!f[iA]) continue; const s = packDe(f[iA], f[iP]), n = path.basename(f[iA], '.png');
    if (!fs.existsSync(path.join(DIR, f[iA]))) throw new Error('falta ' + f[iA]);
    if (vistos.has(n)) throw new Error('dos dibujos con el mismo nombre: ' + n + ' (' + vistos.get(n) + ', ' + s + ')'); vistos.set(n, s);
    (lista[s] ||= []).push([n, '../arte/objetos/' + f[iA]]); }
  const b = await playwright().chromium.launch({ headless: true, args: ['--mute-audio'] });
  const p = await (await b.newContext()).newPage(); const errores = []; p.on('pageerror', e => errores.push(String(e)));
  await p.goto(URL0 + '/editor/hojas.html'); await p.waitForFunction(() => typeof Hojas !== 'undefined', null, { timeout: 60000 });
  const hojas = [...await p.evaluate((l) => Hojas.packs(l), lista), await p.evaluate((v) => Hojas.viejos(v), VIEJOS)];
  // la hoja de fachadas del editor (recursos/fachada.png|js): las piezas fd_* de arte/fachadas
  const FD = path.join(R, 'arte', 'fachadas'), fd = fs.readdirSync(FD).filter(f => /^fd_.*\.png$/.test(f)).sort().map(f => [f.slice(0, -4), '../arte/fachadas/' + f]);
  const fach = await p.evaluate((l) => Hojas.fachada(l), fd);
  await b.close(); if (errores.length) throw new Error(errores.join('\n'));
  const REC = path.join(R, 'editor', 'recursos');
  if (!fach.igual) fs.writeFileSync(path.join(REC, 'fachada.png'), Buffer.from(fach.png.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(REC, 'fachada.js'), '// piezas de fachada (Gemini, vista frontal a 30 px/m; arte/fachadas, en una hoja con herramientas/hojas.js): R3 las pega en las caras de las casas (Tex.blit)\n'
    + 'const FACHADA = {"frames": {' + Object.entries(fach.frames).map(([n, f]) => `"${n}": {"x": ${f.x}, "y": ${f.y}, "w": ${f.w}, "h": ${f.h}}`).join(', ') + '}};\n');
  console.log('fachada.png', fd.length + ' piezas', fach.igual ? '(igual a la que había)' : '(nueva)');
  fs.mkdirSync(SAL, { recursive: true });
  for (const f of fs.readdirSync(SAL)) if (/\.(png|json)$/.test(f)) fs.unlinkSync(path.join(SAL, f));   // las de antes (un pack que ya no está)
  for (const h of hojas) {
    fs.writeFileSync(path.join(SAL, h.nombre + '.png'), Buffer.from(h.png.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(SAL, h.nombre + '.json'), JSON.stringify(h.json));
    console.log(h.nombre.padEnd(40), Object.keys(h.json.frames).length + ' cuadros', h.json.meta.size.w + '×' + h.json.meta.size.h); }
  fs.writeFileSync(path.join(SAL, 'hojas.js'), '// generado por herramientas/hojas.js — no editar a mano. Las hojas de objetos (img/objetos/<nombre>.png|json): la escena\n'
    + '// las carga enteras y WeedJS arma el atlas\nexport const HOJAS = ' + JSON.stringify(hojas.map(h => h.nombre)) + ';\n');
  console.log(hojas.length, 'hojas en img/objetos');
  execFileSync('node', [path.join(__dirname, 'objetos.js')], { stdio: 'inherit' });
})().catch(e => { console.error(e); process.exit(1); });
