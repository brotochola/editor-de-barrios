// ===================== paredes.js — grafitis, firmas y carteles de arte/objetos en las paredes, casa por casa =====================
// Las casas salen de un catálogo compartido: un dibujo pintado en la pared de un diseño se vería igual en cada casa de ese diseño.
// Por eso estos van aparte, como piezas sueltas de cada casa (mundo.json, casas[].g), encima de su pared: caras.js dice en qué
// partes de cada pared se puede pintar (lo liso, sin aberturas, carteles ni nada de la casa adelante: ranuras) y acá se elige qué
// va en cada casa, sin que se note la repetición:
//   - grafitis grandes (9 dibujos, cada uno en 6 colores): el mismo dibujo no se repite a menos de LEJOS_MISMO m, y el mismo dibujo con
//     el mismo color, a menos de LEJOS_IGUAL; entre los que se pueden, el menos usado. Unos más gastados que otros (alfa);
//   - firmas: de 2 a 4 letras sueltas, juntas, de un color (el tinte del juego sobre la letra blanca);
//   - carteles pegados: de 1 a 4, distintos y en cualquier orden;
//   - enredaderas en su espaldera: paradas en el piso contra la pared, quietas (una por pared, a lo sumo).
// Cuántos: según el lugar (grafitis: más en lo pobre y en tapiales; enredaderas: más en lo de más plata) y los knobs
// «grafitis» y «plantas». Todo sale de la posición de la casa (no del sorteo del barrio), así el resto no cambia.
const Paredes = (() => {
  const TONOS = 6, LEJOS_MISMO = 45, LEJOS_IGUAL = 160, CELDA = 40, TIRA = 8;   // TIRA: el ancho de las tiras (ver pieza)
  const FIRMA = [[44, 44, 50], [44, 44, 50], [44, 44, 50], [200, 48, 56], [56, 88, 196], [206, 210, 218], [58, 156, 84], [236, 204, 64], [214, 92, 168]];
  const r2 = (v) => Math.round(v * 100) / 100, r4 = (v) => Math.round(v * 1e4) / 1e4;
  const hex = (c) => (Math.max(0, Math.min(255, Math.round(c[0]))) << 16) | (Math.max(0, Math.min(255, Math.round(c[1]))) << 8) | Math.max(0, Math.min(255, Math.round(c[2])));

  // F: los cuadros del editor (los grafitis llevan f.hd.img y f.hd.grafiti); C: los knobs; L: la luz de una superficie plana al sol (caras.js)
  function nuevo(F, C, L) {
    const K = C.grafitis ?? 1, KE = C.plantas ?? 1, G = OBJETOS.grafitis, usos = new Map(), grilla = new Map(), usados = new Set(); let n = 0;
    const dim = (nm) => F[nm].hd;
    const tinteL = (c, k = 1) => hex(c.map(v => v * L * k));
    // lo que ya se puso cerca (x, y en m): clave → lista de [x, y]
    function cerca(x, y, clave, R) { const i0 = Math.floor((x - R) / CELDA), i1 = Math.floor((x + R) / CELDA), j0 = Math.floor((y - R) / CELDA), j1 = Math.floor((y + R) / CELDA);
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const l = grilla.get(i * 65536 + j); if (!l) continue;
        for (const p of l) if (p[2] === clave && (p[0] - x) ** 2 + (p[1] - y) ** 2 < R * R) return true; }
      return false; }
    function anotar(x, y, clave) { const k = Math.floor(x / CELDA) * 65536 + Math.floor(y / CELDA); let l = grilla.get(k); if (!l) grilla.set(k, l = []); l.push([x, y, clave]); usos.set(clave, (usos.get(clave) || 0) + 1); }

    // un rectángulo libre de gw × gh texeles en la ranura (las celdas, más una de margen): [u0, v0] o null. Más abajo que arriba
    function lugar(s, libre, gw, gh, rng) {
      const C4 = Caras.CELDA, cw = Math.ceil(gw / C4) + 2, ch = Math.ceil(gh / C4) + 2; if (cw > s.nx || ch > s.ny) return null;
      for (let intento = 0; intento < 14; intento++) {
        const i0 = (rng() * (s.nx - cw + 1)) | 0, j0 = Math.min(s.ny - ch, ((1 - rng() * rng()) * (s.ny - ch + 1)) | 0);
        let ok = true; for (let j = j0; j < j0 + ch && ok; j++) for (let i = i0; i < i0 + cw; i++) if (!libre[j * s.nx + i]) { ok = false; break; }
        if (!ok) continue;
        for (let j = j0; j < j0 + ch; j++) for (let i = i0; i < i0 + cw; i++) libre[j * s.nx + i] = 0;
        return [Math.round(i0 * C4 + (cw * C4 - gw) / 2), Math.round(j0 * C4 + (ch * C4 - gh) / 2)];
      }
      return null; }
    // una pieza de w × h texeles con su esquina en (u0, v0) de la ranura: [cuadro, x, y, sx, sy, kx, ky, tinte, sortDy, innerZ, nx, ny, nz, z, alfa]
    // (lo mismo que las piezas de las caras, más el alfa). El dibujo se lee derecho aunque la pared corra hacia la izquierda en pantalla.
    // Va encima de las columnas de su pared que tapa, con la clave de la más baja: si es más ancha que esas columnas (una pared que
    // corre en diagonal), en tiras de TIRA texeles (la columna más fina de una pared), cada una con su clave; si no, la punta alta de
    // un cartel ancho tapaba a la gente parada en la vereda (el dueño, 13/11). Las tiras son cuadros propios (nombre~8_k), uno solo
    // por dibujo y tira (con anchos a la medida de cada pared, cada dibujo iba a la hoja cuatro veces). Devuelve la lista de piezas
    function pieza(s, nombre, u0, v0, w, h, tinte, alfa, extra) {
      const a = s.a[0] < 0 ? [-s.a[0], -s.a[1]] : s.a, b = s.b[1] < 0 ? [-s.b[0], -s.b[1]] : s.b, vc = v0 + h / 2;
      const tapa = (ua, ub) => s.pz.filter(p => p[0] < ub && p[2] > ua && p[1] < v0 + h && p[3] > v0);
      let cw = Infinity; for (const p of tapa(u0, u0 + w)) cw = Math.min(cw, p[2] - p[0]);
      const sw = cw < w ? TIRA : w;
      const out = [];
      for (let k = 0; k * sw < w; k++) {
        const ws = Math.min(sw, w - k * sw), ui = a === s.a ? u0 + k * sw : u0 + w - k * sw - ws, uc = ui + ws / 2;   // la tira k del dibujo, en la ranura
        const x = s.O[0] + s.a[0] * uc + s.b[0] * vc, y = s.O[1] + s.a[1] * uc + s.b[1] * vc;
        let clave = -Infinity; for (const p of tapa(ui, ui + ws)) clave = Math.max(clave, p[4]);
        if (clave === -Infinity) clave = y;
        const z = s.O3[2] + s.E1[2] * uc / s.Tw + s.E2[2] * vc / s.Th, nm = sw < w ? nombre + "~" + sw + "_" + k : nombre;
        usados.add(nm); n++;
        out.push(["grafitis_" + nm, r2(x), r2(y), r4(a[0]), r4(b[1]), r4(b[0] / b[1]), r4(a[1] / a[0]), tinte, r2(clave + .01 + extra * .001 - y), s.iz, s.n[0], s.n[1], s.n[2], r2(z), r2(alfa)]);
      }
      return out;
    }
    // ---- las tres clases
    function grande(s, libre, rng, x, y, out) {
      const orden = G.grandes.map(g => [g, (usos.get(g) || 0) + rng() * 2]).sort((p, q) => p[1] - q[1]);
      for (const [g] of orden) { if (cerca(x, y, g, LEJOS_MISMO)) continue;
        const tonos = []; for (let t = 0; t < TONOS; t++) { const k = g + "_t" + t; if (!cerca(x, y, k, LEJOS_IGUAL)) tonos.push([k, (usos.get(k) || 0) + rng()]); }
        if (!tonos.length) continue;
        const d = dim(g), pos = lugar(s, libre, d.w, d.h, rng); if (!pos) continue;
        const k = tonos.sort((p, q) => p[1] - q[1])[0][0];
        out.push(...pieza(s, k, pos[0], pos[1], d.w, d.h, tinteL([255, 255, 255]), .62 + rng() * .38, out.length));
        anotar(x, y, g); anotar(x, y, k); return true; }
      return false; }
    function firma(s, libre, rng, x, y, out) {
      const nl = 2 + ((rng() * 3) | 0), letras = []; let w = 0, h = 0;
      for (let i = 0; i < nl; i++) { const l = G.letras[(rng() * G.letras.length) | 0], d = dim(l), sep = i ? -((rng() * 3) | 0) : 0; letras.push([l, w + sep, d]); w += d.w + sep; h = Math.max(h, d.h); }
      const pos = lugar(s, libre, w, h + 2, rng); if (!pos) return false;
      const col = FIRMA[(rng() * FIRMA.length) | 0], tn = tinteL(col), al = .7 + rng() * .3;
      for (const [l, du, d] of letras) out.push(...pieza(s, l, pos[0] + du, pos[1] + 1 + Math.round((rng() - .5) * 2), d.w, d.h, tn, al, out.length));
      return true; }
    function carteles(s, libre, rng, x, y, out) {
      const nc = 1 + ((rng() * rng() * 4) | 0), pool = G.carteles.slice(), elegidos = []; let w = 0, h = 0;
      for (let i = 0; i < nc && pool.length; i++) { const c = pool.splice((rng() * pool.length) | 0, 1)[0], d = dim(c), sep = i ? 1 + ((rng() * 3) | 0) : 0; elegidos.push([c, w + sep, d]); w += d.w + sep; h = Math.max(h, d.h); }
      const pos = lugar(s, libre, w, h + 2, rng); if (!pos) return false;
      for (const [c, du, d] of elegidos) out.push(...pieza(s, c, pos[0] + du, pos[1] + 1 + ((rng() * 3) | 0), d.w, d.h, tinteL([255, 255, 255], .82 + rng() * .18), .85 + rng() * .15, out.length));
      return true; }

    // la enredadera en su espaldera: parada en el piso contra la pared (el pie en la base de la pared), donde todo lo que tapa está
    // libre (las celdas de menos de 0,25 m no se miran: no se marcan)
    function enredadera(s, libre, rng, out) {
      if (!G.enredaderas || !G.enredaderas.length) return false;
      const C4 = Caras.CELDA, nm = G.enredaderas[(rng() * G.enredaderas.length) | 0], d = dim(nm), cw = Math.ceil(d.w / C4) + 1;
      if (cw > s.nx || d.h > s.Th) return false;
      const v0 = s.E2[2] < 0 ? s.Th - d.h : 0, j0 = Math.floor(v0 / C4), j1 = Math.min(s.ny - 1, Math.floor((v0 + d.h - 1) / C4));
      const zf = (j) => s.O3[2] + s.E2[2] * (j + .5) * C4 / s.Th;
      for (let intento = 0; intento < 10; intento++) {
        const i0 = (rng() * (s.nx - cw + 1)) | 0; let ok = true;
        for (let j = j0; j <= j1 && ok; j++) { if (zf(j) < .25) continue; for (let i = i0; i < i0 + cw; i++) if (!libre[j * s.nx + i]) { ok = false; break; } }
        if (!ok) continue;
        for (let j = j0; j <= j1; j++) for (let i = i0; i < i0 + cw; i++) libre[j * s.nx + i] = 0;
        out.push(...pieza(s, nm, Math.round(i0 * C4 + (cw * C4 - d.w) / 2), v0, d.w, d.h, tinteL([255, 255, 255]), 1, out.length));
        return true; }
      return false; }

    // las piezas de una casa: ranuras (de caras.js, de su variante), dónde está (m), qué es (spec.t) y la riqueza del lugar
    function poner(ranuras, x, y, tipo, riqueza) {
      if (!ranuras || !ranuras.length || (K <= 0 && KE <= 0) || tipo === "poste") return null;
      const rng = R3.rng((Math.imul(Math.round(x * 10), 0x27d4eb2d) ^ Math.imul(Math.round(y * 10), 0x165667b1) ^ 0x5eed6a11) >>> 0);
      const largo = tipo === "tapial", p = Math.min(1, K * (largo ? .85 : riqueza < .35 ? .75 : riqueza < .6 ? .55 : .3)), out = [];
      const pe = Math.min(1, KE * (riqueza < .3 ? .06 : riqueza < .6 ? .14 : .2));
      for (const s of ranuras) {
        const max = largo ? Math.max(1, Math.floor(s.L / 5)) : s.L > 8 ? 2 : 1; let libre = null;
        // primero la enredadera (va abajo, contra el piso), después los grafitis en lo que quede libre
        if (rng() < pe) { libre = s.mask.slice(); enredadera(s, libre, rng, out); }
        // dónde queda esta pared (m, más o menos: el pie de su centro), para no repetir cerca
        const xs = x + (s.O[0] + s.a[0] * s.Tw / 2) / R3.SF, ys = y - (s.O[1] + s.b[1] * s.Th) / (R3.SYN * R3.SF);
        for (let k = 0; k < max; k++) { if (rng() >= p) continue;
          if (!libre) libre = s.mask.slice();
          const q = rng(), rico = riqueza > .6;
          const ok = q < (rico ? .35 : .55) ? grande(s, libre, rng, xs, ys, out) || firma(s, libre, rng, xs, ys, out)
            : q < (rico ? .75 : .8) ? carteles(s, libre, rng, xs, ys, out) : firma(s, libre, rng, xs, ys, out);
          if (!ok) break; } }
      return out.length ? out : null;
    }
    // los cuadros que se usaron, para la hoja de props: [nombre, canvas]. Los grandes, en su tono; todos con la saturación de las casas
    function cuadros() {
      const out = [], sat = R3.LIGHT.sat;
      for (const nm of usados) { const tira = /^(.*)~(\d+)_(\d+)$/.exec(nm), nm0 = tira ? tira[1] : nm, m = /^(.*)_t(\d)$/.exec(nm0), base = m ? m[1] : nm0, t = m ? +m[2] : 0, d = dim(base);
        const x0 = tira ? +tira[2] * +tira[3] : 0, w = tira ? Math.min(+tira[2], d.w - x0) : d.w;
        const cv = document.createElement("canvas"); cv.width = w; cv.height = d.h; const g = cv.getContext("2d"); g.drawImage(d.img, d.x + x0, d.y, w, d.h, 0, 0, w, d.h);
        const im = g.getImageData(0, 0, w, d.h), px = im.data;
        for (let i = 0; i < px.length; i += 4) { if (!px[i + 3]) continue; let r = px[i], gg = px[i + 1], b = px[i + 2];
          if (t) [r, gg, b] = girarTono(r, gg, b, t * 360 / TONOS);
          const l = .3 * r + .59 * gg + .11 * b; px[i] = l + (r - l) * sat; px[i + 1] = l + (gg - l) * sat; px[i + 2] = l + (b - l) * sat; }
        g.putImageData(im, 0, 0); out.push([nm, cv]); }
      return out; }
    return { poner, cuadros, get n() { return n; } };
  }
  // giro del tono (HSL) de lo que tiene color: los contornos oscuros, los blancos y los grises quedan como están
  function girarTono(r, g, b, grados) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (d < .12 || l < .1 || l > .93) return [r * 255, g * 255, b * 255];
    const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + grados + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2;
    const [a, bb, cc] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [(a + m0) * 255, (bb + m0) * 255, (cc + m0) * 255]; }
  return { nuevo };
})();
