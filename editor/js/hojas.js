// ===================== hojas.js — las hojas de objetos que lee el juego (img/objetos/*.png|json) =====================
// Una hoja por pack de arte/objetos (los dibujos tal cual, a la escala de los personajes LPC) y «viejos»: lo que queda de la hoja vieja
// del editor (recursos/v4_assets.png) y todavía se usa (carteles, piletas, pizarras, el semáforo y las sombras), con el contorno que les
// ponía el exportador (el de las casas, por fuera, 1 px; las sombras, sin). El juego carga las hojas enteras y WeedJS arma el atlas.
// Formato: el JSON de siempre (frames, animations, meta); en «viejos», además, el ancla de cada cuadro (anclas: {nombre: [x, y]}).
const Hojas = (() => {
  const PAD = 2, ANCHO = 2048;
  const cargar = (src) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(new Error("no carga " + src)); im.src = src; });
  // estantes: los más altos primero, de izquierda a derecha, con PAD px transparentes entre cuadros
  function empaquetar(nombre, cuadros, extra = {}) {
    const orden = cuadros.slice().sort((a, b) => b.cv.height - a.cv.height || a.nombre.localeCompare(b.nombre));
    let x = 0, y = 0, fila = 0, ancho = 0; const pos = new Map();
    for (const c of orden) { const w = c.cv.width, h = c.cv.height;
      if (x + w > ANCHO) { x = 0; y += fila + PAD; fila = 0; }
      pos.set(c.nombre, [x, y]); x += w + PAD; fila = Math.max(fila, h); ancho = Math.max(ancho, x); }
    const W = Math.max(1, ancho - PAD), H = Math.max(1, y + fila), hoja = document.createElement("canvas"); hoja.width = W; hoja.height = H;
    const g = hoja.getContext("2d"); g.imageSmoothingEnabled = false;
    const frames = {}, animations = {};
    for (const c of cuadros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))) { const [px, py] = pos.get(c.nombre), w = c.cv.width, h = c.cv.height;
      g.drawImage(c.cv, px, py);
      frames[c.nombre] = { frame: { x: px, y: py, w, h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w, h }, sourceSize: { w, h } };
      animations[c.nombre] = [c.nombre]; }
    const json = { frames, animations, ...extra, meta: { app: "editor de barrios · hojas.js", image: nombre + ".png", size: { w: W, h: H }, scale: 1 } };
    return { nombre, png: hoja.toDataURL("image/png"), json };
  }
  const aCanvas = (im, x = 0, y = 0, w = im.width, h = im.height) => { const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").drawImage(im, x, y, w, h, 0, 0, w, h); return c; };
  // packs: {slug: [[nombre, ruta desde la raíz del sitio]]}
  async function packs(lista) {
    const out = [];
    for (const [slug, archivos] of Object.entries(lista)) {
      const cuadros = await Promise.all(archivos.map(async ([nombre, ruta]) => ({ nombre, cv: aCanvas(await cargar(ruta)) })));
      out.push(empaquetar(slug, cuadros)); }
    return out;
  }
  // «viejos»: los cuadros de la hoja vieja con estos nombres (expresión regular), con su contorno y su ancla
  async function viejos(patron) {
    const re = new RegExp(patron), atlas = await cargar("recursos/v4_assets.png"), SUAVE = Math.min(1, .7 * R3.LIGHT.outline), cuadros = [], anclas = {};
    for (const [n, f] of Object.entries(ASSETS.frames)) { if (!re.test(n)) continue;
      let cv = aCanvas(atlas, f.x, f.y, f.w, f.h); const t = /^sh_/.test(n) ? 0 : 1;
      if (t) cv = Contorno.canvas(cv, t, null, SUAVE);
      cuadros.push({ nombre: n, cv }); anclas[n] = [Math.round((f.ox + t) / cv.width * 1e4) / 1e4, Math.round((f.oy + t) / cv.height * 1e4) / 1e4]; }
    return empaquetar("viejos", cuadros, { anclas });
  }
  // las piezas de fachada (arte/fachadas/fd_*.png, de frente, a 30 px/m), en la hoja del editor (recursos/fachada.png|js), que R3 pega en
  // las caras de las casas: estantes de 1024 px, las más altas primero, 1 px entre piezas. lista: [[nombre, ruta]]
  async function fachada(lista) {
    const ims = await Promise.all(lista.map(async ([n, ruta]) => [n, await cargar(ruta)]));
    ims.sort((a, b) => b[1].height - a[1].height || (a[0] < b[0] ? -1 : 1));
    const W = 1024; let x = 0, y = 0, fila = 0; const frames = {};
    for (const [n, im] of ims) { if (x + im.width > W) { x = 0; y += fila + 1; fila = 0; }
      frames[n] = { x, y, w: im.width, h: im.height }; x += im.width + 1; fila = Math.max(fila, im.height); }
    const cv = document.createElement("canvas"); cv.width = W; cv.height = y + fila; const g = cv.getContext("2d");
    for (const [n, im] of ims) g.drawImage(im, frames[n].x, frames[n].y);
    const orden = {}; for (const n of Object.keys(frames).sort()) orden[n] = frames[n];
    // ¿igual, pixel por pixel, a la que ya está? (así no se reescribe un PNG que no cambió)
    let igual = false;
    try { const v = await cargar("recursos/fachada.png");
      if (v.width === cv.width && v.height === cv.height) { const c2 = document.createElement("canvas"); c2.width = v.width; c2.height = v.height;
        const g2 = c2.getContext("2d"); g2.drawImage(v, 0, 0); const a = g.getImageData(0, 0, cv.width, cv.height).data, b = g2.getImageData(0, 0, v.width, v.height).data;
        igual = a.every((x, i) => x === b[i]); } } catch (e) { /* no hay hoja: se escribe */ }
    return { png: cv.toDataURL("image/png"), frames: orden, igual };
  }
  return { packs, viejos, fachada };
})();
