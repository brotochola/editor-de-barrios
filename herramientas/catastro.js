// Catastro de la Ciudad (datos abiertos del GCBA) para armar una cuadra real tal cual: los lotes de unas manzanas, con su frente,
// fondo, pisos, puertas y geometría (epok.buenosaires.gob.ar), y las fotos de fachada de cada lote (fotos.usig.buenosaires.gob.ar,
// dos o tres tomas de distintos años). Las fotos no van al repo: se bajan a una carpeta de afuera (D:\tmp\...).
//
// Bajar:   node herramientas/catastro.js bajar <carpeta> 061-165 061-166 061-166-025A ...
//          (una manzana entera es sección-manzana; un lote suelto, sección-manzana-parcela, para los que llevan letra)
// Frentes: node herramientas/catastro.js frentes <carpeta> <lon,lat de una punta> <lon,lat de la otra>
//          los lotes que dan a esa cuadra, en orden desde la primera punta (las puntas son los cruces de los ejes de las calles;
//          servicios.usig.buenosaires.gob.ar/normalizar/?direccion=varsovia+y+bucarelli&geocodificar=true los da).
// Un lote de una manzana se busca también por un punto: epok.buenosaires.gob.ar/catastro/parcela/?lng=..&lat=.. (WGS84).
// Node 22 (fetch); curl en Windows no conecta con epok.
"use strict";
const fs = require("fs"), path = require("path");
const [, , modo, dir, ...args] = process.argv;
if (!modo || !dir) { console.log("uso: node herramientas/catastro.js bajar|frentes <carpeta> ..."); process.exit(1); }

const pedir = async (u) => {
  for (let i = 0; ; i++) {
    try { return await fetch(u); } catch (e) { if (i >= 2) throw e; await new Promise((s) => setTimeout(s, 800)); }
  }
};

async function bajar() {
  fs.mkdirSync(dir, { recursive: true });
  const archivo = path.join(dir, "lotes.json"), todo = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, "utf8")) : {};
  for (const a of args) {
    const suelto = a.split("-").length === 3;
    let vacios = 0;
    for (let p = 1; p <= (suelto ? 1 : 80) && vacios < 4; p++) {
      const smp = suelto ? a : `${a}-${String(p).padStart(3, "0")}`;
      const d = await (await pedir(`https://epok.buenosaires.gob.ar/catastro/parcela/?smp=${smp}`)).json();
      if (!d.smp) { vacios++; continue; }   // los lotes con letra (025A) no salen al recorrer: pedirlos sueltos
      vacios = 0;
      const g = await (await pedir(`https://epok.buenosaires.gob.ar/catastro/geometria/?smp=${smp}`)).json();
      d.geometria = g.features?.[0]?.geometry ?? null;
      // el servicio de fotos, pasado el último índice, vuelve a dar alguna de las anteriores: se guarda cada foto distinta una vez
      d.fotos = []; const vistas = new Set();
      for (let i = 0; i < 6; i++) {
        const r = await pedir(`https://fotos.usig.buenosaires.gob.ar/getFoto?smp=${smp}&i=${i}&h=750&w=1000`);
        const b = Buffer.from(await r.arrayBuffer());
        if (!(r.headers.get("content-type") || "").startsWith("image") || b.length < 3000) break;
        const h = require("crypto").createHash("md5").update(b).digest("hex");
        if (vistas.has(h)) continue;
        vistas.add(h); const f = `${smp}_${d.fotos.length}.jpg`; fs.writeFileSync(path.join(dir, f), b); d.fotos.push(f);
      }
      todo[smp] = d;
      console.log(smp, d.direccion, "frente", d.frente, "pisos", d.pisos_sobre_rasante, "fotos", d.fotos.length,
        (d.puertas || []).map((x) => `${x.calle} ${x.altura}`).join(", "));
    }
  }
  fs.writeFileSync(archivo, JSON.stringify(todo, null, 1));
}

function frentes() {
  const L = JSON.parse(fs.readFileSync(path.join(dir, "lotes.json"), "utf8"));
  const [A, B] = args.map((s) => s.split(",").map(Number));
  const k = Math.cos(A[1] * Math.PI / 180) * 111320, m = (p) => [(p[0] - A[0]) * k, (p[1] - A[1]) * 110950];
  const b = m(B), len = Math.hypot(...b), u = [b[0] / len, b[1] / len], n = [-u[1], u[0]];   // n: a la izquierda yendo de A a B
  console.log(`cuadra de ${len.toFixed(1)} m de eje a eje`);
  const filas = [];
  for (const [smp, d] of Object.entries(L)) {
    if (!d.geometria) continue;
    const pts = d.geometria.coordinates.flat(2).map(m).map((p) => [p[0] * u[0] + p[1] * u[1], p[0] * n[0] + p[1] * n[1]]);
    const dmin = Math.min(...pts.map((p) => Math.abs(p[1])));
    if (dmin > 12) continue;   // no da a esta calle
    const fr = pts.filter((p) => Math.abs(p[1]) < dmin + .8), s0 = Math.min(...fr.map((p) => p[0])), s1 = Math.max(...fr.map((p) => p[0]));
    if (s1 < -3 || s0 > len + 3 || s1 - s0 < 1.5) continue;
    const lado = pts.reduce((a, p) => a + p[1], 0) > 0 ? "izq" : "der", fondo = Math.max(...pts.map((p) => Math.abs(p[1]))) - dmin;
    filas.push({ smp, d, lado, s0, s1, dmin, fondo });
  }
  filas.sort((a, b) => a.lado.localeCompare(b.lado) || a.s0 - b.s0);
  for (const f of filas) console.log(f.lado, f.smp.padEnd(12), (f.d.direccion || "").padEnd(18), `${f.s0.toFixed(1).padStart(6)} a ${f.s1.toFixed(1).padStart(6)}`,
    `= ${(f.s1 - f.s0).toFixed(2).padStart(5)} m, línea a ${f.dmin.toFixed(1)} m del eje, fondo ${f.fondo.toFixed(1)} m, pisos ${f.d.pisos_sobre_rasante}, fotos ${f.d.fotos.length}`);
}

(modo === "bajar" ? bajar() : Promise.resolve(frentes())).catch((e) => { console.error(e); process.exit(1); });
