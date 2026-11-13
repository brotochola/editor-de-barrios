// Junta los meta.json de los barrios exportados (carabobo/ y parquechas/, los reales) en barrios.js, que importa la
// escena en todos los hilos: así una sola escena sirve para los dos (elige con ?barrio=… en la URL de la escena).
// Correrlo después de exportar un barrio (reexportar.js lo corre solo): node herramientas/barrios.js
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), B = {};
for (const d of ['carabobo', 'parquechas']) { const f = path.join(R, d, 'meta.json'); if (fs.existsSync(f)) B[d] = JSON.parse(fs.readFileSync(f, 'utf8')); }
fs.writeFileSync(path.join(R, 'barrios.js'), '// generado por herramientas/barrios.js con los meta.json de cada barrio — no editar a mano\nexport const BARRIOS = ' + JSON.stringify(B) + ';\n');
console.log('barrios.js:', Object.keys(B).join(', '));
