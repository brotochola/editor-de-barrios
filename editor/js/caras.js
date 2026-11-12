// ===================== caras.js — casas por caras planas con skew (WeedJS ≥ DX-DECOSKEW, PR #7) =====================
// Cada diseño del catálogo (casa, edificio, casilla, esquina, tapial, paredón, poste) se arma una sola vez en R3, sin
// rumbo y en modo kit (Houses.setKit): sus caras quedan en coordenadas de la casa y sus detalles chicos como accesorios.
// Lo que va al atlas, sin rumbo y sin repetir:
//   - las caras con dibujo propio (fachadas, medianeras, carteles…): planas, con su material, la oclusión del piso, la
//     saturación y un borde oscuro (el contorno), sin la luz, en piezas de hasta 128 px de mundo;
//   - las baldosas de material (techos): una por material, compartida por todas las casas, en piezas de hasta 6 m;
//   - los accesorios (tanque, aire, antena, maceta): un sprite de R3 cada uno, compartido (los que tienen frente, por
//     octavo de vuelta);
//   - las caras de color liso no van: se dibujan con la textura blanca del motor (_white) teñida.
// Para cada rumbo en que se usa un diseño (una "variante"): qué se ve; para cada pieza su lugar, escala y skew (la cara
// plana proyectada en la vista oblicua es un paralelogramo: escala + skewX + skewY la dibujan exacta), el tinte, hacia
// dónde mira y la altura de su centro (con eso WeedJS la ilumina como una superficie: lighting.faces), el orden de pintor
// dentro de la casa (innerZ) y la y de orden (en una pared, el punto del piso que tiene debajo; en lo demás, su borde de adelante
// sobre el piso; subida lo justo para no quedar detrás de una pieza de la casa que tapa; las caras van en columnas finas: PIE_MAX).
const Caras = (() => {
  const { SF, K, SYN, CZ } = R3;
  const VIEW = R3.norm([-K, 1, -SYN / CZ]);
  const G = 1.25;   // la textura va por G y el tinte de cada cara es L/G ≤ 1
  // el contorno de cada cara: GROSOR px de textura por dentro de cada borde (2 a 30 px/m: 1,2 px de mundo, lo que suman el borde
  // de una hoja y el anillo de un árbol, y el anillo de un accesorio), en las caras lisas desde BORDE_MIN de lado (10 px de
  // textura: le quedan 6 de color)
  const GROSOR = 2, BORDE_MIN = .35;
  // lo que puede cambiar el pie de una pared lisa (px de pantalla) a lo ancho de una de sus columnas (ver el orden de las piezas)
  const PIE_MAX = 8;
  const len = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  const rot = (c, s, v) => [c * v[0] - s * v[1], s * v[0] + c * v[1], v[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sc3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  // metros → px de mundo (vector, o punto desde el origen de la casa)
  const J = (v) => [SF * (v[0] + K * v[1]), -SF * (v[2] * CZ + v[1] * SYN)];
  const hexDe = (c) => (Math.max(0, Math.min(255, Math.round(c[0]))) << 16) | (Math.max(0, Math.min(255, Math.round(c[1]))) << 8) | Math.max(0, Math.min(255, Math.round(c[2])));

  // ---------- la luz de cada cara la pone WeedJS, según dónde están el sol y los faroles (lighting.faces). Acá sólo va la de
  // una superficie plana al sol, igual para todas, la de un techo en R3 (r3d.js render); WeedJS lleva esa superficie a 1
  const L = [.83, .83, .83];
  // color de R3 tras la saturación (sobre el color ya iluminado)
  function saturar(r, g, b) { const s = R3.LIGHT.sat, l = .3 * r + .59 * g + .11 * b; return [l + (r - l) * s, l + (g - l) * s, l + (b - l) * s]; }

  // ---------- texturas planas (RGBA), multiplicadas por G
  // cara con textura propia: en su espacio (u a la derecha, v hacia abajo), con AO del piso, saturación y contorno
  function textura(f) {
    const t = f.tex;   // (un triángulo de color liso no pasa por acá: va con TRI, la textura compartida)
    const w = t.w, h = t.h, d = new Uint8ClampedArray(w * h * 4), aoK = R3.LIGHT.ao;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = (x + .5) / w, v = (y + .5) / h; if (f.tri && u + v > 1) continue;
      const i = (y * t.w + x) * 4; if (t.d[i + 3] < 128) continue;
      const z = f.O[2] + u * f.E1[2] + v * f.E2[2], ao = 1 - 0.2 * aoK * Math.max(0, 1 - z / 0.7), c = saturar(t.d[i] * ao, t.d[i + 1] * ao, t.d[i + 2] * ao);
      const o = (y * w + x) * 4; d[o] = c[0] * G; d[o + 1] = c[1] * G; d[o + 2] = c[2] * G; d[o + 3] = 255;
    }
    if (!f.sinContorno) contorno({ w, h, d }); return { w, h, d };
  }
  // el borde de lo opaco, GROSOR px hacia adentro, llevado al oscuro de su color, como el de los árboles (Contorno.fuerza)
  function contorno(T) { const { w, h, d } = T, tA = Contorno.fuerza(R3.LIGHT.outline); if (tA <= 0) return;
    const borde = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = y * w + x; if (!d[k * 4 + 3]) continue;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !d[(k - 1) * 4 + 3] || !d[(k + 1) * 4 + 3] || !d[(k - w) * 4 + 3] || !d[(k + w) * 4 + 3]) borde[k] = 1; }
    for (let s = 2; s <= GROSOR; s++) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = y * w + x; if (!d[k * 4 + 3] || borde[k]) continue;
      if ((x > 0 && borde[k - 1] === s - 1) || (x < w - 1 && borde[k + 1] === s - 1) || (y > 0 && borde[k - w] === s - 1) || (y < h - 1 && borde[k + w] === s - 1)) borde[k] = s; }
    for (let k = 0; k < w * h; k++) if (borde[k]) { const i = k * 4, c = Contorno.oscuro(d[i], d[i + 1], d[i + 2]);
      for (let j = 0; j < 3; j++) d[i + j] = d[i + j] * (1 - tA) + c[j] * tA; } }
  // un recorte de la baldosa de un material (wq × hq m, desde la esquina), saturado y por G; sin contorno (se repite)
  function recorteMaterial(m, wq, hq) {
    const b = m.tex, w = Math.max(1, Math.min(b.w, Math.round(wq * R3.TD))), h = Math.max(1, Math.min(b.h, Math.round(hq * R3.TD))), d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * b.w + x) * 4, o = (y * w + x) * 4, c = saturar(b.d[i], b.d[i + 1], b.d[i + 2]);
      d[o] = c[0] * G; d[o + 1] = c[1] * G; d[o + 2] = c[2] * G; d[o + 3] = b.d[i + 3] < 128 ? 0 : 255; }
    return { w, h, d };
  }
  // la misma textura girada: u' = v, v' = 1 − u (un techo en un rumbo donde su eje u sale vertical en pantalla)
  function transponer(T) {
    const w = T.h, h = T.w, d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const s = (x * T.w + (T.w - 1 - y)) * 4, o = (y * w + x) * 4;
      d[o] = T.d[s]; d[o + 1] = T.d[s + 1]; d[o + 2] = T.d[s + 2]; d[o + 3] = T.d[s + 3]; }
    return { w, h, d };
  }
  function hash(T) { let a = 0x811c9dc5 ^ T.w, b = 0x9e3779b9 ^ T.h;
    for (let i = 0; i < T.d.length; i += 4) { const v = T.d[i] | T.d[i + 1] << 8 | T.d[i + 2] << 16 | T.d[i + 3] << 24;
      a = Math.imul(a ^ v, 16777619); b = Math.imul(b ^ (v >>> 3), 2246822519); }
    return (a >>> 0).toString(36) + "." + (b >>> 0).toString(36) + "." + T.w + "x" + T.h; }
  const hashD = (d) => { let a = 0x811c9dc5; for (let i = 0; i < d.length; i++) a = Math.imul(a ^ (d[i] | 0), 16777619); return a >>> 0; };

  // ---------- dónde se puede pintar (paredes.js pone ahí grafitis y carteles, casa por casa): en celdas de CELDA texeles, lo liso
  // de cada pared que llega al piso: del color de la pared (sin aberturas, carteles, murales ni pintadas), entre 0,25 y 3,4 m, y
  // sin nada de la casa adelante. El color de la pared es la mediana de la textura; un pixel es pared si está a menos de lo que se
  // aleja el 85 % de los pixeles (con holgura: el revoque gastado, las manchas y la junta del ladrillo también son pared)
  const CELDA = 4, LIBRE = new WeakMap();
  function libreDe(T) {
    let m = LIBRE.get(T); if (m) return m;
    const { w, h, d } = T, nx = Math.floor(w / CELDA), ny = Math.floor(h / CELDA), H3 = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)]; let n = 0;
    for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 128) { H3[0][d[i * 4]]++; H3[1][d[i * 4 + 1]]++; H3[2][d[i * 4 + 2]]++; n++; }
    const med = H3.map(hh => { let s = 0; for (let v = 0; v < 256; v++) { s += hh[v]; if (s >= n / 2) return v; } return 0; });
    const dist = new Float32Array(w * h), HD = new Uint32Array(450);
    for (let i = 0; i < w * h; i++) { if (d[i * 4 + 3] <= 128) { dist[i] = 1e9; continue; }
      const v = Math.hypot(d[i * 4] - med[0], d[i * 4 + 1] - med[1], d[i * 4 + 2] - med[2]); dist[i] = v; HD[Math.min(449, v | 0)]++; }
    let p85 = 0; for (let s = 0; p85 < 450; p85++) { s += HD[p85]; if (s >= n * .85) break; }
    const tope = Math.max(24, p85 * 1.3), mask = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { let malos = 0;
      for (let y = j * CELDA; y < (j + 1) * CELDA; y++) for (let x = i * CELDA; x < (i + 1) * CELDA; x++) if (dist[y * w + x] > tope) malos++;
      mask[j * nx + i] = malos <= 1 ? 1 : 0; }
    m = { nx, ny, mask }; LIBRE.set(T, m); return m;
  }
  const dentro4 = (P, x, y) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    if (Math.abs(c) < 1e-9) continue; if (!s) s = Math.sign(c); else if (Math.sign(c) !== s) return false; } return true; };

  // ---------- geometría en pantalla
  const area = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  function caja(P) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of P) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); } return [x0, y0, x1, y1]; }
  const separadas = (A, B) => A[2] <= B[0] || B[2] <= A[0] || A[3] <= B[1] || B[3] <= A[1];
  // recorte de un polígono convexo por otro (Sutherland–Hodgman)
  function recortar(P, Q) {
    const sQ = Math.sign(area(Q)) || 1; let out = P;
    for (let i = 0; i < Q.length && out.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], inp = out; out = [];
      const lado = (p) => sQ * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
      for (let j = 0; j < inp.length; j++) { const p = inp[j], q = inp[(j + 1) % inp.length], lp = lado(p), lq = lado(q);
        if (lp >= 0) out.push(p);
        if ((lp >= 0) !== (lq >= 0)) { const t = lp / (lp - lq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } } }
    return out;
  }
  // elementos de una variante: caras (polígono y profundidad en cada punto) y accesorios (su rectángulo y una profundidad)
  function elementoCara(F) { const p0 = J(F.O), a = J(F.E1), b = J(F.E2);
    const poli = F.tri ? [p0, [p0[0] + a[0], p0[1] + a[1]], [p0[0] + b[0], p0[1] + b[1]]]
      : [p0, [p0[0] + a[0], p0[1] + a[1]], [p0[0] + a[0] + b[0], p0[1] + a[1] + b[1]], [p0[0] + b[0], p0[1] + b[1]]];
    const det = a[0] * b[1] - a[1] * b[0];
    return { poli, caja: caja(poli), centro: R3.dot(add(F.O, add(sc3(F.E1, .5), sc3(F.E2, .5))), VIEW),
      prof: (s) => { if (Math.abs(det) < 1e-9) return R3.dot(F.O, VIEW); const dx = s[0] - p0[0], dy = s[1] - p0[1];
        const al = (dx * b[1] - dy * b[0]) / det, be = (a[0] * dy - a[1] * dx) / det; return R3.dot(add(F.O, add(sc3(F.E1, al), sc3(F.E2, be))), VIEW); } }; }
  // orden de pintor: "A antes que B" donde se tapan (la de atrás en su punto común), orden topológico, las lejanas primero
  function ordenPintor(E) {
    const n = E.length, antes = Array.from({ length: n }, () => []), grado = new Int32Array(n);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (separadas(E[i].caja, E[j].caja)) continue;
      const I = recortar(E[i].poli, E[j].poli); if (I.length < 3 || Math.abs(area(I)) < .5) continue;
      let cx = 0, cy = 0; for (const q of I) { cx += q[0]; cy += q[1]; } const s = [cx / I.length, cy / I.length];
      const di = E[i].prof(s), dj = E[j].prof(s); if (Math.abs(di - dj) < 1e-4) continue;
      if (di > dj) { antes[i].push(j); grado[j]++; } else { antes[j].push(i); grado[i]++; }
    }
    const orden = [], hecho = new Uint8Array(n);
    while (orden.length < n) {
      let best = -1; for (let i = 0; i < n; i++) if (!hecho[i] && grado[i] === 0 && (best < 0 || E[i].centro > E[best].centro)) best = i;
      if (best < 0) for (let i = 0; i < n; i++) if (!hecho[i] && (best < 0 || E[i].centro > E[best].centro)) best = i;   // ciclo
      hecho[best] = 1; orden.push(best); for (const j of antes[best]) grado[j]--;
    }
    const rank = new Int32Array(n); orden.forEach((i, r) => rank[i] = r); return rank;
  }
  // ---------- todo el catálogo
  // entries: las claves del catálogo (cada una con su rumbo spec.a). Devuelve { piezas: [{nombre, T, x0, y0, w, h}],
  // variantes: { id: [[cuadro, dx, dy, sx, sy, kx, ky, tinte, sortDy, innerZ(, nx, ny, nz, z)], …] }, pies: { id: {foot, casters} } }
  function hornear(entries, DET, progreso = () => {}) {
    const TILE = Math.round(128 * DET), disenos = new Map(), texturas = new Map(), piezas = [], variantes = {}, pies = {}, ranurasDe = {};
    const st = { caras: 0, lisas: 0, material: 0, propias: 0, accesorios: 0 };
    // una textura deduplicada, cortada en piezas de hasta cu × cv px (TILE, o columnas más finas en una pared que corre hacia el
    // fondo: ver más abajo), más 1 px de solape: su grilla de cuadros
    const hashDe = (T) => T.hsh ?? (T.hsh = hash(T));
    function registrar(T, prefijo, cu = TILE, cv = TILE) {
      const hsh = hashDe(T) + ":" + cu + "x" + cv; let e = texturas.get(hsh); if (e) return e;
      const id = texturas.size, grid = [];
      for (let y0 = 0; y0 < T.h; y0 += cv) for (let x0 = 0; x0 < T.w; x0 += cu) {
        const w = Math.min(T.w - x0, cu + 1), h = Math.min(T.h - y0, cv + 1);
        let algo = false; for (let y = y0; y < y0 + h && !algo; y++) for (let x = x0; x < x0 + w; x++) if (T.d[(y * T.w + x) * 4 + 3]) { algo = true; break; }
        if (!algo) continue;   // una pieza toda transparente no va (los huecos de un triángulo, de una reja)
        const nombre = prefijo + id + "_" + (x0 / cu) + "_" + (y0 / cv); piezas.push({ nombre, T, x0, y0, w, h }); grid.push({ nombre, x0, y0, w, h }); }
      e = { id, w: T.w, h: T.h, grid }; texturas.set(hsh, e); return e;
    }
    // el ancho de columna (texeles a lo largo de la pared) para que el pie no cambie más de PIE_MAX px de pantalla dentro de una
    // pieza: TILE, o TILE/2, TILE/4… E: el borde horizontal de la pieza; n: sus texeles. Una textura se corta una sola vez (si no,
    // va repetida al atlas): con la columna más fina que pida cualquiera de las variantes que la usan (cortes, por su hash y eje)
    // la y de orden buscada de una pieza (P: su centro; O, E1, E2: su paralelogramo, en m). Una pared: el punto del piso que tiene
    // debajo (sus columnas son finas). Lo que está en alto y no es vertical (techos, tapas de muros): su borde de adelante sobre el
    // piso, el de la pieza misma: lo que se superpone en pantalla con un pedazo de techo está siempre más lejos que ese pedazo, así
    // que el techo tiene que ir después. Un piso al ras (patio, escalón): su borde de atrás, así lo que se para encima va después.
    // Una tira en alto (tapa de muro, alero, contorno; de menos de 60 cm): también su borde de atrás, así nunca empuja hacia
    // adelante a la pared que tiene abajo (lo que pase detrás puede quedar encima de una tira de pocos cm: casi no se ve).
    // (Con el frente de la casa entera, un techo, un piso o una tapa de atrás hacía subir hasta el frente a las paredes que se pintan
    // después, y la gente parada al costado de una pared quedaba detrás; con el borde de atrás de los techos, la medianera de la casa
    // de al lado y los autos que pasaban detrás quedaban encima del techo)
    function buscada(vertical, P, O, E1, E2, tira, tri) {
      if (vertical) return J([P[0], P[1], 0])[1];
      const C = (tri ? [[0, 0], [1, 0], [0, 1]] : [[0, 0], [1, 0], [0, 1], [1, 1]]).map(([i, j]) => add(O, add(sc3(E1, i), sc3(E2, j)))), y = C.map(c => J([c[0], c[1], 0])[1]);
      return tira || Math.max(...C.map(c => c[2])) <= .3 ? Math.min(...y) : Math.max(...y); }
    const cortes = new Map();
    function columna(E, n) { const porTexel = Math.abs(J(E)[1]) / n; let c = TILE; while (c > 8 && c * porTexel > PIE_MAX) c = Math.ceil(c / 2); return c; }
    const BLANCO = { w: 8, h: 8, grid: [{ nombre: "_white", x0: 0, y0: 0, w: 8, h: 8 }] };
    // medio cuadrado blanco (u + v ≤ 1): cualquier triángulo liso es su imagen con escala y skew, como una cara lisa lo es de _white.
    // Todos lo comparten, teñido de su color (antes cada triángulo iba al atlas con su textura: los techos de las esquinas con forma)
    // (128 texeles, y un texel y medio pasado de la diagonal: si no, entre el techo y la pared quedaba una rayita escalonada)
    const TRI = (() => { const n = 128, d = new Uint8ClampedArray(n * n * 4);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if ((x + .5) / n + (y + .5) / n > 1 + 1.5 / n) continue; const o = (y * n + x) * 4; d[o] = d[o + 1] = d[o + 2] = d[o + 3] = 255; }
      return registrar({ w: n, h: n, d }, "t"); })();
    // un accesorio: su sprite de R3 (iluminado, con contorno) por tipo y octavo de vuelta, y dónde cae su origen en él
    const sprites = new Map();
    function spriteAcc(a, oct) {
      const k = a.tipo + ":" + (a.kind || "") + ":" + (a.seed ?? "") + ":" + (a.wall ? 1 : 0) + (a.back ? 1 : 0) + (a.big ? 1 : 0) + ":" + oct;
      let e = sprites.get(k); if (e) return e;
      const res = Houses.accesorio(a, oct * Math.PI / 4).render({ groundShadow: false });
      const cv = res.canvas, d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
      const T = { w: cv.width, h: cv.height, d: new Uint8ClampedArray(d) }, reg = registrar(T, "a");
      e = { reg, ax: res.ax, ay: res.ay }; sprites.set(k, e); return e;
    }
    const claveDiseno = (spec) => { const { a, ...resto } = spec; return JSON.stringify(resto); };
    Houses.setKit(true);
    try {
    // primera pasada: las caras y piezas de cada variante, y el corte que pide cada textura de pared
    const fase = [];
    entries.forEach((e, n) => {
      if (n % 16 === 0) progreso(n / entries.length * .3);
      const kd = claveDiseno(e.spec); let D = disenos.get(kd);
      if (!D) { const B3 = Barrio.build3D({ ...e.spec, a: 0 }), s = B3.sc;
        D = { faces: s.faces.filter(f => f.both || f.n[2] > -.5), casters: s.casters, acc: s.acc || [], tex: new Map(), puertas: B3.puertas || [], frenteY: B3.frenteY || 0 }; disenos.set(kd, D); }
      const phi = World.ANG[e.spec.a], c = Math.cos(phi), s = Math.sin(phi), E = [], items = [], cands = [];
      // ---- caras visibles, en piezas planas: [textura (grilla), O, E1, E2 (el paralelogramo que cubre), tinte]
      for (let fi = 0; fi < D.faces.length; fi++) { const F0 = D.faces[fi]; let n3 = rot(c, s, F0.n);
        if (R3.dot(n3, VIEW) >= -1e-4) { if (!F0.both) continue; n3 = [-n3[0], -n3[1], -n3[2]]; }
        const F = { O: rot(c, s, F0.O), E1: rot(c, s, F0.E1), E2: rot(c, s, F0.E2), tri: F0.tri, n: n3 };
        const A = J(F.E1), B = J(F.E2); if (Math.hypot(A[0], A[1]) < .5 || Math.hypot(B[0], B[1]) < .5 || Math.abs(A[0] * B[1] - A[1] * B[0]) < 1) continue;   // de canto
        st.caras++; const sub = [];
        // una pared que llega al piso: sus piezas se ordenan por el pie de su columna (y llevan grafitis: ranuras)
        const zMin = Math.min(F.O[2], F.O[2] + F.E1[2], F.O[2] + F.E2[2], F.O[2] + F.E1[2] + F.E2[2]), pared = Math.abs(F.n[2]) < .1 && zMin <= .3;
        if (!F0.tex && !F0.tri) {
          // color liso: la textura blanca del motor, teñida con el color iluminado
          st.lisas++; const col = saturar(F0.col[0] * L[0], F0.col[1] * L[1], F0.col[2] * L[2]);
          sub.push({ reg: BLANCO, O: F.O, E1: F.E1, E2: F.E2, tinte: hexDe(col), girable: false, principal: true });
        } else if (!F0.tex) {
          // triángulo de color liso: el medio cuadrado compartido (TRI), teñido
          st.lisas++; const col = saturar(F0.col[0] * L[0], F0.col[1] * L[1], F0.col[2] * L[2]);
          sub.push({ reg: TRI, O: F.O, E1: F.E1, E2: F.E2, tinte: hexDe(col), girable: false, tri: true });
        } else if (F0.tex && F0.tex.mat && hashD(F0.tex.d) === F0.tex.limpia) {
          // material limpio (un techo): baldosas compartidas de hasta 6 m, cada una un recorte de medio metro en medio metro
          st.material++; const m = F0.tex.mat, Wm = len(F.E1), Hm = len(F.E2), nx = Math.max(1, Math.ceil(Wm / m.tw - .01)), ny = Math.max(1, Math.ceil(Hm / m.th - .01));
          const wq = Math.max(.5, Math.min(m.tw, Math.round(Wm / nx * 2) / 2)), hq = Math.max(.5, Math.min(m.th, Math.round(Hm / ny * 2) / 2)), mk = m.key + ":" + wq + "x" + hq;
          let T = D.tex.get(mk); if (!T) { T = recorteMaterial(m, wq, hq); D.tex.set(mk, T); }
          const tn = hexDe(L.map(v => v / G * 255));
          for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) sub.push({ T, O: add(F.O, add(sc3(F.E1, i / nx), sc3(F.E2, j / ny))), E1: sc3(F.E1, 1 / nx), E2: sc3(F.E2, 1 / ny), tinte: tn, girable: true, clave: mk });
        } else {
          // dibujo propio: la cara entera
          st.propias++; let T = D.tex.get(fi); if (!T) { T = textura(F0); D.tex.set(fi, T); }
          sub.push({ T, O: F.O, E1: F.E1, E2: F.E2, tinte: hexDe(L.map(v => v / G * 255)), girable: !F.tri, clave: fi, principal: !F.tri });
        }
        // el contorno de las caras de color liso y de los techos de material (las de dibujo propio lo traen en su textura): una
        // tira de GROSOR px de textura por dentro de cada borde, del color de la cara llevado a su oscuro (como contorno()), con
        // la textura blanca del motor. Cada parte de la casa lleva el suyo, como cada hoja de un árbol: también las caras chicas
        // (tapas de tapial, postes, aleros) desde BORDE_MIN de lado
        { const lisa = !F0.tex && !F0.tri, mat = F0.tex && F0.tex.mat && hashD(F0.tex.d) === F0.tex.limpia;
          if (((lisa && len(F0.E1) > BORDE_MIN && len(F0.E2) > BORDE_MIN) || mat) && Contorno.fuerza(R3.LIGHT.outline) > 0) {
            let base; if (lisa) base = saturar(F0.col[0] * L[0], F0.col[1] * L[1], F0.col[2] * L[2]);
            else { const m = F0.tex.mat; if (!m.prom) { const d = m.tex.d; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } m.prom = [r / n, g / n, b / n]; }
              const sp = saturar(m.prom[0], m.prom[1], m.prom[2]); base = [sp[0] * L[0], sp[1] * L[1], sp[2] * L[2]]; }
            const os = Contorno.oscuro(base[0], base[1], base[2]), tA = Contorno.fuerza(R3.LIGHT.outline), tn = hexDe(base.map((v, j) => v + (os[j] - v) * tA)), th = GROSOR / R3.TD;
            const e1 = len(F.E1), e2 = len(F.E2), i1 = sc3(F.E1, th / e1), i2 = sc3(F.E2, th / e2), lejos1 = add(F.O, F.E1), lejos2 = add(F.O, F.E2);
            for (const [O, E1, E2] of [[F.O, F.E1, i2], [sub3(lejos2, i2), F.E1, i2], [F.O, i1, F.E2], [sub3(lejos1, i1), i1, F.E2]]) {
              // la orientación que deja escala y skew sanos (la textura blanca es igual de cualquier lado)
              const A2 = J(E1), B2 = J(E2), la = Math.hypot(A2[0], A2[1]) || 1e-9, lb = Math.hypot(B2[0], B2[1]) || 1e-9;
              const qn = Math.min(Math.abs(A2[0]) / la, Math.abs(B2[1]) / lb), qt = Math.min(Math.abs(B2[0]) / lb, Math.abs(A2[1]) / la);
              sub.push(qt > qn ? { reg: BLANCO, O: add(O, E1), E1: E2, E2: sc3(E1, -1), tinte: tn, girable: false, borde: true } : { reg: BLANCO, O, E1, E2, tinte: tn, girable: false, borde: true }); } } }
        // orientación de cada pieza: la normal (u = E1) o la traspuesta (u = E2, v = −E1), la que deja escala y skew sanos
        for (const q of sub) { if (q.reg) continue;
          const A2 = J(q.E1), B2 = J(q.E2), la = Math.hypot(A2[0], A2[1]), lb = Math.hypot(B2[0], B2[1]);
          const qn = Math.min(Math.abs(A2[0]) / la, Math.abs(B2[1]) / lb), qt = Math.min(Math.abs(B2[0]) / lb, Math.abs(A2[1]) / la);
          if (q.girable && qt > qn) { const k = "t:" + q.clave; let Tt = D.tex.get(k); if (!Tt) { Tt = transponer(q.T); D.tex.set(k, Tt); }
            q.O = add(q.O, q.E1); const e1 = q.E1; q.E1 = q.E2; q.E2 = sc3(e1, -1); q.T = Tt; q.trans = true; }
          // en una pared, columnas tan finas como haga falta para que cada pieza se ordene bien con lo que está al pie
          if (pared) { const hor1 = Math.abs(q.E1[2]) <= Math.abs(q.E2[2]), k = hashDe(q.T) + (hor1 ? "u" : "v"), cu = hor1 ? columna(q.E1, q.T.w) : columna(q.E2, q.T.h);
            q.corte = k; cortes.set(k, Math.min(cortes.get(k) ?? TILE, cu)); } }
        const el = elementoCara(F), idx = E.length; E.push(el);
        for (const q of sub) items.push({ el: idx, q, pared, F });
        // una pared que llega al piso, lisa o con su dibujo, sin trasponer: candidata para grafitis (ranuras, más abajo)
        if (pared) { const q0 = sub.find(q => q.principal); if (q0 && !q0.trans) cands.push({ el: idx, q: q0, F, T: q0.reg === BLANCO ? null : q0.T, caja: el.caja }); }
      }
      fase.push({ e, D, phi, c, s, E, items, cands });
    });
    // segunda pasada: cada textura al atlas (una vez, con su corte), los accesorios, el orden y lo demás de cada variante
    fase.forEach(({ e, D, phi, c, s, E, items, cands }, n) => {
      if (n % 16 === 0) progreso(.3 + .7 * n / fase.length);
      for (const it of items) { const q = it.q; if (!q || q.reg) continue;
        const k = q.corte, cu = k ? cortes.get(k) : TILE;
        q.reg = !k ? registrar(q.T, "c") : k.endsWith("u") ? registrar(q.T, "c", cu, TILE) : registrar(q.T, "c", TILE, cu); }
      // ---- accesorios: un sprite cada uno, parado en su punto
      for (const a of D.acc) { const P = rot(c, s, [a.x, a.y, a.z]), oct = a.tipo === "tanque" || a.tipo === "maceta" ? 0 : ((Math.round(phi / (Math.PI / 4)) % 8) + 8) % 8;
        const sp = spriteAcc(a, oct), p = J(P), k = 1 / DET, x0 = p[0] - sp.ax * k, y0 = p[1] - sp.ay * k, w = sp.reg.w * k, h = sp.reg.h * k;
        const poli = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], dc = R3.dot(add(P, [0, 0, .5]), VIEW);
        st.accesorios++; const idx = E.length; E.push({ poli, caja: caja(poli), centro: dc, prof: () => dc });
        items.push({ el: idx, acc: { sp, p, P } }); }
      // ---- orden: innerZ por el orden de pintor; la y de orden de cada pieza, subida lo justo
      const rank = ordenPintor(E), nE = E.length, tiles = [];
      for (const it of items) {
        const r = rank[it.el], iz = nE <= 250 ? r - 125 : Math.round(r * 250 / (nE - 1)) - 125;
        if (it.acc) { const { sp, p, P } = it.acc, k = 1 / DET, x0 = p[0] - sp.ax * k, y0 = p[1] - sp.ay * k, w = sp.reg.w * k, h = sp.reg.h * k;
          // el sprite del accesorio: el cuadro entero, anclado donde cae su origen, sin skew; se ordena por el punto del piso que tiene
          // debajo (con el frente de la casa, uno de atrás hacía subir a las paredes que se pintan después: ver la y de orden)
          const g = sp.reg.grid[0]; if (sp.reg.grid.length !== 1) console.warn("accesorio en más de una pieza", g.nombre);
          tiles.push({ rank: r, cuadro: g.nombre, p: [x0 + w / 2, y0 + h / 2], sx: k, sy: k, kx: 0, ky: 0, tn: 0xffffff, iz, objetivo: J([P[0], P[1], 0])[1], poli: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]] });
          continue; }
        const q = it.q, T = q.reg, A = J(q.E1), B = J(q.E2), a = [A[0] / T.w, A[1] / T.w], b = [B[0] / T.h, B[1] / T.h];
        const sx = a[0], sy = b[1], kx = b[0] / b[1], ky = a[1] / a[0];
        // una cara lisa (la textura blanca teñida) va en columnas: una pieza sola se ordena por un solo pie, y en una pared que corre
        // hacia el fondo (o en la tapa larga de un muro) el pie sube o baja decenas de px de punta a punta (la gente parada al pie,
        // adelante, quedaba tapada). Se corta a lo largo del borde que más cambia el pie (en una pared, el horizontal), en columnas
        // donde cambia a lo sumo PIE_MAX px de pantalla. Sólo las paredes que llegan al piso (donde se para la gente): lo demás va
        // entero (cortado, las piezas se duplicaban; las tiras, ver buscada)
        const vert = Math.abs(it.F.n[2]) < .1, tira = !vert && Math.min(len(q.E1), len(q.E2)) < .6;
        if (T === BLANCO && it.pared) {
          const piso = (E) => Math.abs(J([E[0], E[1], 0])[1]);
          const hor1 = vert ? Math.abs(q.E1[2]) <= Math.abs(q.E2[2]) : piso(q.E1) >= piso(q.E2), Eh = hor1 ? q.E1 : q.E2, n = Math.max(1, Math.ceil(piso(Eh) / PIE_MAX - 1e-6));
          // cada columna, 1 px de pantalla más ancha (como las piezas con textura): si no, entre una y otra quedaba una rayita
          const pasa = n > 1 ? 1 + 1 / Math.max(1, Math.hypot(...J(sc3(Eh, 1 / n)))) : 1;
          const e1 = hor1 ? sc3(q.E1, pasa / n) : q.E1, e2 = hor1 ? q.E2 : sc3(q.E2, pasa / n), A1 = J(e1), B1 = J(e2);
          for (let k = 0; k < n; k++) {
            const O = add(q.O, sc3(Eh, k / n)), P = add(O, add(sc3(e1, .5), sc3(e2, .5))), j0 = J(O);
            // su y de orden: la de una pieza de dibujo (abajo)
            tiles.push({ rank: r, cuadro: "_white", p: J(P), sx: A1[0] / 8, sy: B1[1] / 8, kx: B1[0] / B1[1], ky: A1[1] / A1[0], tn: q.tinte, iz, objetivo: buscada(vert, P, O, e1, e2, tira), borde: !!q.borde, n: it.F.n, z: P[2], el: it.el,
              uv: hor1 ? [k / n, 0, (k + 1) / n, 1] : [0, k / n, 1, (k + 1) / n], poli: [j0, [j0[0] + A1[0], j0[1] + A1[1]], [j0[0] + A1[0] + B1[0], j0[1] + A1[1] + B1[1]], [j0[0] + B1[0], j0[1] + B1[1]]] });
          }
          continue;
        }
        for (const g of T.grid) {
          const cu = g.x0 + g.w / 2, cv = g.y0 + g.h / 2, P = add(q.O, add(sc3(q.E1, cu / T.w), sc3(q.E2, cv / T.h))), p = J(P);
          const q0 = add(q.O, add(sc3(q.E1, g.x0 / T.w), sc3(q.E2, g.y0 / T.h))), da = J(sc3(q.E1, g.w / T.w)), db = J(sc3(q.E2, g.h / T.h)), j0 = J(q0);
          const objetivo = buscada(vert, P, q0, sc3(q.E1, g.w / T.w), sc3(q.E2, g.h / T.h), tira, q.tri);
          tiles.push({ rank: r, cuadro: g.nombre, p, sx: g.nombre === "_white" ? A[0] / 8 : sx, sy: g.nombre === "_white" ? B[1] / 8 : sy, kx, ky, tn: q.tinte, iz, objetivo, borde: !!q.borde, n: it.F.n, z: P[2], el: it.el, g,
            poli: q.tri ? [j0, [j0[0] + da[0], j0[1] + da[1]], [j0[0] + db[0], j0[1] + db[1]]] : [j0, [j0[0] + da[0], j0[1] + da[1]], [j0[0] + da[0] + db[0], j0[1] + da[1] + db[1]], [j0[0] + db[0], j0[1] + db[1]]] });
        }
      }
      // la y de orden: la buscada, o la de una pieza de la casa que tapa y va antes en el orden de pintor, si es más baja
      tiles.sort((A, B) => A.rank - B.rank);
      const cajas = tiles.map(t => caja(t.poli));
      for (let i = 0; i < tiles.length; i++) { let k = tiles[i].objetivo;
        for (let j = 0; j < i; j++) { if (tiles[j].rank === tiles[i].rank || tiles[j].clave <= k || separadas(cajas[i], cajas[j])) continue;
          const I = recortar(tiles[i].poli, tiles[j].poli); if (I.length >= 3 && Math.abs(area(I)) >= .5) k = tiles[j].clave; }
        tiles[i].clave = k; }
      for (const t of tiles) if (t.borde) t.clave += .02;   // el borde, encima de su cara (misma y de orden y mismo innerZ)
      ranurasDe[e.id] = ranuras(cands, tiles, cajas, rank, nE);
      const r2 = (v) => Math.round(v * 100) / 100, r4 = (v) => Math.round(v * 1e4) / 1e4;
      // las piezas de caras llevan además hacia dónde mira su cara (la normal, ya girada como la casa) y la altura de su centro (m):
      // el juego se las da a WeedJS (Decoration.spawn: faceNormalX, faceNormalY, faceNormalZ, faceHeight)
      variantes[e.id] = tiles.map(t => { const v = [t.cuadro, r2(t.p[0]), r2(t.p[1]), r4(t.sx), r4(t.sy), r4(t.kx), r4(t.ky), t.tn, r2(t.clave - t.p[1]), t.iz];
        if (t.n) v.push(r2(t.n[0]), r2(t.n[1]), r2(t.n[2]), r2(t.z)); return v; });
      // el pie de la casa (de donde cuelgan el colisionador y la sombra): el punto más al frente de las cajas apoyadas
      let foot = [0, 0], fy = 1e9;
      for (const cs of D.casters) { if (cs.c[2] - cs.h[2] > .3) continue;
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const q = rot(c, s, [cs.c[0] + sx * cs.h[0] * cs.ax[0][0] + sy * cs.h[1] * cs.ax[1][0], cs.c[1] + sx * cs.h[0] * cs.ax[0][1] + sy * cs.h[1] * cs.ax[1][1], 0]);
          if (q[1] < fy - 1e-6) { fy = q[1]; foot = [q[0], q[1]]; } } }
      pies[e.id] = { foot, casters: D.casters.map(cs => ({ c: rot(c, s, cs.c), ax: cs.ax.map(v => rot(c, s, v)), h: cs.h, noGround: cs.noGround })),
        // las puertas del frente: de dónde a dónde (m, desde el origen de la casa) y hacia dónde es afuera
        puertas: D.puertas.map(([a, b]) => ({ a: rot(c, s, [a, D.frenteY, 0]), b: rot(c, s, [b, D.frenteY, 0]), afuera: rot(c, s, [0, -1, 0]) })) };
    });
    } finally { Houses.setKit(false); }
    return { piezas, variantes, pies, ranuras: ranurasDe, nTexturas: texturas.size, nDisenos: disenos.size, st };
  }
  // las ranuras de una variante: para cada pared candidata, sus celdas libres y lo que paredes.js necesita para poner una pieza encima:
  // O (px de mundo desde el origen de la casa), a y b (px por texel a lo largo y hacia abajo), el tamaño en texeles, las piezas de la
  // cara con su y de orden (pz: u0, v0, u1, v1, clave), innerZ, la normal, la geometría 3D (para la altura) y el largo (m)
  function ranuras(cands, tiles, cajas, rank, nE) {
    const out = [];
    for (const c of cands) {
      const q = c.q, r = rank[c.el], iz = nE <= 250 ? r - 125 : Math.round(r * 250 / (nE - 1)) - 125;
      const Tw = c.T ? c.T.w : Math.max(1, Math.round(len(q.E1) * R3.TD)), Th = c.T ? c.T.h : Math.max(1, Math.round(len(q.E2) * R3.TD));
      const nx = Math.floor(Tw / CELDA), ny = Math.floor(Th / CELDA); if (nx < 6 || ny < 6) continue;
      const A = J(q.E1), B = J(q.E2), a = [A[0] / Tw, A[1] / Tw], b = [B[0] / Th, B[1] / Th], O = J(q.O), base = c.T ? libreDe(c.T) : null, mask = new Uint8Array(nx * ny);
      let hay = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        if (base ? !base.mask[j * base.nx + i] : (i < 1 || j < 1 || i >= nx - 1 || j >= ny - 1)) continue;   // las lisas, sin el borde
        const z = q.O[2] + q.E1[2] * (i + .5) * CELDA / Tw + q.E2[2] * (j + .5) * CELDA / Th; if (z < .25 || z > 3.4) continue;
        mask[j * nx + i] = 1; hay++; }
      if (!hay) continue;
      // lo de la casa que tapa esta pared (va después en el orden de pintor): sus celdas no
      for (let k = 0; k < tiles.length && hay; k++) { const t = tiles[k]; if (t.rank <= r || separadas(cajas[k], c.caja)) continue;
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const m = j * nx + i; if (!mask[m]) continue;
          const u = (i + .5) * CELDA, v = (j + .5) * CELDA; if (dentro4(t.poli, O[0] + a[0] * u + b[0] * v, O[1] + a[1] * u + b[1] * v)) { mask[m] = 0; hay--; } } }
      if (!hay) continue;
      const pz = []; for (const t of tiles) { if (t.el !== c.el || t.borde) continue;
        pz.push(t.uv ? [t.uv[0] * Tw, t.uv[1] * Th, t.uv[2] * Tw, t.uv[3] * Th, t.clave] : t.cuadro === "_white" ? [0, 0, Tw, Th, t.clave] : [t.g.x0, t.g.y0, t.g.x0 + t.g.w, t.g.y0 + t.g.h, t.clave]); }
      out.push({ O, a, b, Tw, Th, nx, ny, mask, pz, iz, n: c.F.n.map(v => Math.round(v * 100) / 100), O3: q.O, E1: q.E1, E2: q.E2, L: len(q.E1) });
    }
    return out;
  }
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  return { hornear, G, L: L[0], CELDA };
})();
