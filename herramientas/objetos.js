// Arma editor/recursos/objetos.js: el catálogo de los objetos de arte/objetos (los packs elegidos y unificados: plantas, macetas,
// basura, sillas, obra, faroles, grafitis…) y qué objeto del juego hace cada uno. Correrlo después de tocar este archivo o de sumar
// dibujos: node herramientas/objetos.js
//
// El editor sigue pidiendo los objetos por su nombre de siempre (u_farola, pl_malvon, yy_avena…): son roles. Cada rol sale de una o
// más listas (pools) con su peso, y cada lista tiene cuadros sueltos o macetas armadas (un recipiente y una planta que se mece encima).
// El cuadro sale del lugar (no del sorteo), así el resto del barrio no cambia.
//
// Nombres de los cuadros (el juego se fija en el prefijo): yy_z_* yuyos y pasto, se mecen; plm_z_* plantas en la tierra, se mecen;
// plm_t_* plantas que van arriba de una maceta, se mecen; u_farol_* faroles (luz); z_* lo demás, quieto.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), DIR = path.join(R, 'arte', 'objetos');

// ---------- el índice del zip (CSV con comillas: alguna subcategoría lleva coma)
function csv(txt) {
  const filas = []; let fila = [], campo = '', q = false;
  for (let i = 0; i < txt.length; i++) { const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; continue; }
    if (c === '"') q = true; else if (c === ',') { fila.push(campo); campo = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else campo += c; }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}
const filas = csv(fs.readFileSync(path.join(DIR, 'indice.csv'), 'utf8')), cab = filas.shift();
const iA = cab.indexOf('archivo'), iW = cab.indexOf('ancho_px'), iH = cab.indexOf('alto_px');
const ARCH = {};   // nombre corto del archivo → { src, w, h }
for (const f of filas) { if (!f[iA]) continue; const src = f[iA], b = path.basename(src, '.png');
  if (!fs.existsSync(path.join(DIR, src))) throw new Error('falta ' + src);
  ARCH[b] = { src, w: +f[iW], h: +f[iH] }; }
const arch = (b) => { const a = ARCH[b]; if (!a) throw new Error('no está en el índice: ' + b); return a; };

// ---------- nombres cortos
const corto = (b) => b.replace(/_32x32/, '').replace(/^garden_planters_/, 'gp_').replace(/^tx_village_props_/, 'village_').replace(/^messy_exterior_/, 'messy_')
  .replace(/^shelter_exterior_/, 'shelter_').replace(/^shelter_furniture_/, 'shelterf_').replace(/^makeshift_furnitureset_/, 'makeshift_')
  .replace(/^postapoc_workshop_/, 'workshop_').replace(/^coastal_furnitureset_/, 'coastal_').replace(/^office_exterior_/, 'office_')
  .replace(/^flores_maceta_(\d+)_\d+_\d+$/, 'fmaceta$1').replace(/^(flores|plantas|yuyos|hongos|tachos|papeles|caballetes|maderas|cajones|chango|fuente)_(\d+)_\d+_\d+$/, '$1$2')
  .replace(/^macetas_01_0_3_1$/, 'macetas01a').replace(/^macetas_01_0_3_2$/, 'macetas01b');
const FR = {};   // cuadro → { src, w, h, … }
function cuadro(prefijo, b, extra = {}) { const n = prefijo + corto(b); if (/_[b-z]$/.test(n)) throw new Error('nombre que parece variante: ' + n);
  if (!FR[n]) FR[n] = { ...arch(b), ...extra }; return n; }
const rango = (pre, a, b, suf = '_0_0', ancho = 2) => { const out = []; for (let i = a; i <= b; i++) out.push(pre + String(i).padStart(ancho, '0') + suf); return out; };
const gp = (s) => 'garden_planters_' + s;

// ---------- listas de cuadros
const P = {};
const lista = (nombre, prefijo, archivos, extra) => { P[nombre] = archivos.map(b => cuadro(prefijo, b, extra)); };
// plantas arriba de una maceta (plm_t_): las flores de las macetas LPC y las plantas sueltas del pack de macetas (sin los cuervos ni los tutores pelados)
lista('T_FLOR', 'plm_t_', [...rango('flores_maceta_', 10, 22), ...rango('flores_maceta_', 28, 31), gp('plantbases_100_272'), gp('plantbases_322_0'), gp('plantbases_352_204'), gp('plantbases_98_130'), gp('plantbases_97_192')]);
lista('T_FLORCITA', 'plm_t_', rango('flores_maceta_', 1, 9));
lista('T_HOJA', 'plm_t_', ['288_205', '289_145', '293_67', '320_205', '321_144', '325_67', '352_146', '357_67', '68_273'].map(s => gp('plantbases_' + s)));
lista('T_HUERTA', 'plm_t_', ['129_130', '132_272', '290_0', '353_0', '323_273', '64_65', '96_64', '65_195', '66_130', '128_64'].map(s => gp('plantbases_' + s)));
lista('T_BROTE', 'plm_t_', ['129_24', '161_275', '258_213', '291_274', '34_82', '355_275', '391_79', '98_17', '128_197', '161_81', '386_211'].map(s => gp('plantbases_' + s)));
// recipientes (z_): tierra = de abajo hasta el centro de la tierra, en px del dibujo (medido a ojo con la grilla)
const RECIP = { balde: [['plasticbucket_160_10', 16], ['plasticbucket_224_10', 16], ['plasticbucket_224_234', 16], ['plasticbucket_32_10', 16], ['plasticbucket_96_10', 16]],
  tambor: [['oilbarrel_134_6', 19], ['oilbarrel_198_38', 19], ['oilbarrel_38_6', 19], ['bluebarrel_102_6', 18], ['bluebarrel_198_6', 18], ['bluebarrel_294_6', 18]],
  goma: [['rubbertire_100_10', 12], ['rubbertire_36_10', 12], ['rubbertire_4_10', 12], ['rubbertire_164_1', 22], ['rubbertire_197_1', 22]],
  inodoro: [['toilet_228_210', 17]] };
const R_ = {}; for (const k in RECIP) R_[k] = RECIP[k].map(([s, t]) => cuadro('z_', gp(s), { tierra: t }));
// macetas que ya traen su planta
lista('M_LINDA', 'z_', ['flores_maceta_23_0_0', 'flores_maceta_32_0_0', 'flores_maceta_26_0_0', 'flores_maceta_27_0_0', 'coastal_furnitureset_146_354', 'coastal_furnitureset_161_360',
  'alchemy_decor_163_21', 'messy_exterior_32x32_1_9', gp('oilbarrel_294_323')]);
lista('M_GRANDE', 'z_', ['macetas_01_0_3_1', 'macetas_01_0_3_2']);
// plantas en la tierra (plm_z_, se mecen)
lista('G_FLOR', 'plm_z_', [...rango('flores_', 1, 1, '_0_0'), ...rango('flores_', 2, 9, '_1_0'), ...rango('flores_', 10, 33), 'flower_1', 'flower_2', 'flower_3', 'flower_4', 'flower_5']);
lista('G_HOJA', 'plm_z_', ['plantas_02_0_0', 'plantas_04_0_0', 'plantas_11_0_0', 'plantas_17_0_0', 'grass_3', gp('plantbases_293_67'), gp('plantbases_325_67'), gp('plantbases_357_67')]);
lista('G_AGAVE', 'plm_z_', ['plantas_23_0_0']);
lista('G_ARBUSTO', 'plm_z_', ['plantas_12_0_0', 'plantas_18_30_0', 'tx_village_props_356_580', 'tx_village_props_452_573', 'tx_village_props_576_572']);
lista('G_ALTA', 'plm_z_', ['tx_village_props_869_262', 'tx_village_props_899_257', 'tx_village_props_930_261', ...['64_65', '96_64', '97_192', '128_64', '129_130', '290_0', '322_0', '353_0'].map(s => gp('plantbases_' + s))]);
lista('G_SECO', 'plm_z_', ['tx_village_props_514_494', 'tx_village_props_545_485', 'tx_village_props_613_490', 'tx_village_props_644_496', 'wheat_102_7', 'wheat_133_0', 'tall_grass_0_12']);
// yuyos (yy_z_, se mecen), hongos y piedras (quietos)
lista('Y_FLOR', 'yy_z_', [...Object.keys(ARCH).filter(b => /^yuyos_\d+_0_0$/.test(b)), ...rango('flores_', 34, 55)]);
lista('Y_PASTO', 'yy_z_', ['grass_1', 'grass_2', 'grass_4_1', 'grass_4_2', 'grass_4_3', 'grass_4_4', 'grass_4_5', 'grass_4_6', 'tx_village_props_421_469', 'tx_village_props_427_503', 'plantas_07_0_0', 'plantas_13_0_0',
  ...['129_24', '258_213', '259_153', '260_276', '260_84', '35_21', '35_213', '36_278', '66_24', '161_275', '291_274', '355_275'].map(s => gp('plantbases_' + s))]);
lista('Y_SECO', 'plm_z_', ['tx_village_props_514_494', 'tx_village_props_545_485', 'tx_village_props_613_490', 'tx_village_props_644_496', 'wheat_102_7', 'wheat_133_0', 'tall_grass_0_12']);
lista('Y_HONGO', 'z_', Object.keys(ARCH).filter(b => /^hongos_/.test(b)));
lista('Y_PIEDRA', 'z_', [...Object.keys(ARCH).filter(b => /^rock_pile_/.test(b)), 'rock_3', 'rock_4', 'tx_village_props_816_365']);
// calle, patio y obra (z_, quietos)
lista('TACHO', 'z_', ['tachos_16_0_0', 'tachos_19_0_0']);
lista('BOLSAS', 'z_', ['trash_bag_1', 'trash_bag_2', 'trash_bag_3', 'trash_bag_4', 'trash_bag_5', 'trash_bag_6', 'trash_bag_7', 'trash_bag_8', 'trash_bag_9', 'trash_pile_2', 'papeles_04_0_0', 'papeles_05_0_0', 'messy_exterior_32x32_40_99']);
lista('ARENA', 'z_', ['shelter_exterior_32x32_326_192', 'shelter_exterior_32x32_340_224']);
lista('MADERAS', 'z_', ['maderas_03_0_0', 'maderas_05_0_0', 'maderas_06_0_0', 'maderas_10_0_0']);
lista('ESCOMBRO', 'z_', ['office_exterior_32x32_102_290']);
lista('CABALLETE', 'z_', ['caballetes_01_0_0', 'caballetes_02_0_0', 'caballetes_03_0_0', 'caballetes_04_0_0']);
lista('CHANGO', 'z_', ['chango_01_0_0', 'chango_02_0_0']);
lista('GARRAFA', 'z_', ['shelter_furniture_32x32_72_192', 'shelter_furniture_32x32_72_227', 'shelter_furniture_32x32_74_33']);
lista('GOMAS', 'z_', ['shelter_exterior_32x32_323_262', 'shelter_exterior_32x32_355_257', 'shelter_exterior_32x32_387_262', 'shelter_exterior_32x32_419_257']);
lista('CHAPAS', 'z_', ['shelter_exterior_32x32_301_352', 'shelter_exterior_32x32_429_288', 'shelter_exterior_32x32_429_320', 'postapoc_workshop_161_327']);
lista('PALLETS', 'z_', ['shelter_exterior_32x32_300_300', 'shelter_exterior_32x32_364_300', 'shelter_exterior_32x32_461_174', 'shelter_exterior_32x32_461_238']);
lista('CAJONES', 'z_', ['cajones_03_0_0', 'cajones_04_0_0', 'cajones_06_0_0', 'cajones_07_0_0']);
lista('SILLA', 'z_', ['messy_exterior_32x32_163_23', 'messy_exterior_32x32_197_25', 'postapoc_workshop_113_135', 'postapoc_workshop_96_129']);
lista('SILLON', 'z_', ['makeshift_furnitureset_1_22', 'makeshift_furnitureset_33_34', 'makeshift_furnitureset_68_21']);
lista('BANCO', 'z_', ['makeshift_furnitureset_258_322']);
lista('COLCHON', 'z_', ['shelter_furniture_32x32_420_242', 'shelter_furniture_32x32_456_100']);
lista('TENDEDERO', 'z_', ['messy_exterior_32x32_161_75', 'messy_exterior_32x32_97_75', 'decor_27_354']);
lista('TAMBOR', 'z_', ['postapoc_workshop_70_161', 'postapoc_workshop_71_194', 'shelter_furniture_32x32_71_449', 'shelter_furniture_32x32_71_481', ...['102_0', '198_0', '294_0', '6_0'].map(s => gp('oilbarrel_' + s))]);
// el farol de hierro: apagado de día, prendido de noche (el juego cambia el cuadro a la hora de su luz). luz: dónde está la lámpara (px del dibujo)
FR.u_farol_hierro = { ...arch('faroles_02_0_0'), luz: [[9, 20]], on: 'u_farol_hierro_on' };
FR.u_farol_hierro_on = { ...arch('faroles_01_0_0'), luz: [[9, 20]] };
P.FAROL = ['u_farol_hierro'];

// macetas armadas: un recipiente de la lista y una planta de las listas de arriba
const armar = (recips, tops) => ({ m: recips, p: tops });

// ---------- roles: el nombre que pide el editor → [[lista o maceta armada, peso], …]
const ROLES = {};
const rol = (nombres, pools) => { for (const n of nombres) ROLES[n] = pools; };
rol(['u_farola', 'u_farola_orn', 'u_farol_doble'], [['FAROL', 1]]);
rol(['u_cesto', 'u_cesto_b', 'canasto_0', 'canasto_1', 'canasto_2'], [['TACHO', 1]]);
rol(['bolsas_0', 'bolsas_1'], [['BOLSAS', 1]]);
rol(['b_bolsones'], [['ARENA', 1]]);
rol(['obra_material'], [['MADERAS', 2], ['ARENA', 1], ['ESCOMBRO', .5]]);
rol(['u_valla'], [['CABALLETE', 1]]);
rol(['chango', 'b_chango_vacio', 'carro_cartonero'], [['CHANGO', 1]]);
rol(['garrafa'], [['GARRAFA', 1]]);
rol(['gomas'], [['GOMAS', 1]]);
rol(['chapas'], [['CHAPAS', 1]]);
rol(['b_pallets'], [['PALLETS', 1]]);
rol(['cajones', 'k_cajones_botellas', 'k_cajones_botellas_b'], [['CAJONES', 1]]);
rol(['silla', 'k_sillas_pila'], [['SILLA', 3], ['SILLON', 1]]);
rol(['u_banco'], [['BANCO', 1]]);
rol(['k_colchon'], [['COLCHON', 1]]);
rol(['b_tendedero'], [['TENDEDERO', 1]]);
rol(['b_tacho_azul'], [['TAMBOR', 1]]);
rol(['u_macetero'], [['M_GRANDE', 1]]);
// macetas: lindas (casas de más plata), comunes y precarias (baldes, gomas, tambores, un inodoro)
rol(['pl_hortensia', 'pl_ficus', 'pl_limonero', 'pl_monstera', 'pl_helecho', 'pl_calas', 'pl_boj', 'pl_lavanda', 'pl_azalea', 'pl_begonias', 'pl_coleo', 'pl_clivia', 'pl_gomero',
  'pl_hibisco', 'pl_palmera', 'pl_suculentas', 'pl_jardinera', 'pl_ligustrina', 'pl_trebol'],
  [['M_LINDA', 3], [armar(R_.tambor.filter(n => /bluebarrel/.test(n)), ['T_FLOR', 'T_HOJA']), 1], [armar(R_.balde, ['T_FLOR']), .6]]);
rol(['pl_malvon', 'pl_potus', 'pl_sansevieria', 'pl_aloe', 'pl_cactus'],
  [['M_LINDA', 1], [armar(R_.balde, ['T_FLOR', 'T_FLOR', 'T_HOJA', 'T_FLORCITA']), 2], [armar(R_.tambor, ['T_FLOR', 'T_HOJA']), 1]]);
rol(['pl_balde', 'pl_botellas', 'pl_cubierta', 'pl_jaula'],
  [[armar(R_.balde, ['T_HOJA', 'T_HUERTA', 'T_FLOR', 'T_BROTE']), 2], [armar(R_.goma, ['T_HOJA', 'T_HUERTA', 'T_FLOR', 'T_BROTE']), 2],
   [armar(R_.tambor, ['T_HOJA', 'T_HUERTA', 'T_FLOR']), 1.5], [armar(R_.inodoro, ['T_FLOR', 'T_HOJA']), .25], ['M_LINDA', .3]]);
// plantas en la tierra
rol(['plm_agapanto'], [['G_FLOR', 1], ['G_HOJA', 1]]);
rol(['plm_lantana', 'plm_plumbago', 'plm_rosal'], [['G_FLOR', 1]]);
rol(['plm_jazmin'], [['G_FLOR', 1]]);
rol(['plm_santarita'], [['G_ARBUSTO', 1], ['G_FLOR', .4]]);   // (las enredaderas en espaldera van a las paredes, con los grafitis)
rol(['plm_romero'], [['G_ARBUSTO', 1], ['G_FLOR', 1]]);
rol(['plm_formio', 'plm_strelitzia'], [['G_HOJA', 1]]);
rol(['plm_cortadera'], [['G_HOJA', 1], ['G_SECO', .6]]);
rol(['plm_yuca'], [['G_AGAVE', 1], ['G_HOJA', .5]]);
rol(['plm_pindo'], [['G_ARBUSTO', 1]]);
rol(['plm_banano'], [['G_HOJA', 1], ['G_ALTA', .5]]);
rol(['plm_tomates'], [['G_ALTA', 1]]);
rol(['plm_yuyos'], [['G_SECO', 1], ['Y_PASTO', 1]]);
// yuyos: de jardín (con flores), de grieta y cordón, matas bajas y de baldío (secos, altos, alguna piedra)
rol(['yy_cesped_margaritas', 'yy_trebol_blanco', 'yy_manzanilla', 'yy_trebol', 'yy_vinagrillo', 'yy_verbena', 'yy_campanilla', 'yy_campanilla_b', 'yy_diente_leon', 'yy_diente_leon_b', 'yy_llanten'],
  [['Y_FLOR', 2], ['Y_PASTO', 1]]);
rol(['yy_grieta', 'yy_musgo', 'yy_brotes', 'yy_cordon', 'yy_gramilla'], [['Y_PASTO', 2], ['Y_FLOR', .5]]);
rol(['yy_mata', 'yy_rastrera', 'yy_pasto_largo'], [['Y_PASTO', 1.5], ['Y_FLOR', 1]]);
rol(['yy_seco_alto', 'yy_seco_alto_b', 'yy_avena', 'yy_cola_zorro', 'yy_pasto_seco', 'yy_mata_seca', 'yy_sorgo', 'yy_junco', 'yy_hinojo', 'yy_cardo', 'yy_ortiga', 'yy_ortiga_b',
  'yy_ortiga_c', 'yy_mostacilla', 'yy_mostacilla_b', 'yy_bardana', 'yy_arbusto_bayas'], [['Y_SECO', 1.2], ['Y_PASTO', 1], ['Y_FLOR', .5], ['Y_PIEDRA', .12]]);
rol(['yy_hongos'], [['Y_HONGO', 1]]);

// lo de Gemini que no tiene reemplazo: el editor no lo pone más (la plaza, los semáforos, los locales coreanos, las manchas del piso,
// la rejilla, la tapa y las piezas de fachada siguen como estaban)
const QUITAR = ['u_refugio', 'u_poste_trafo', 'u_contenedor', 'u_contenedor_b', 'u_campana', 'u_campana_b', 'u_kiosco', 'u_parada', 'u_tablero', 'u_caja_bsas',
  'u_bolardo_amarillo', 'u_bolardo_negro', 'u_cono', 'c_volquete', 'c_puesto_flores', 'c_puesto_frutas', 'c_chori', 'c_buzon', 'c_mesa_bar', 'c_moto', 'c_bici', 'c_hidrante',
  'c_perro', 'c_perro_duerme', 'c_gato', 'c_palomas', 'b_mesa_patio', 'b_viejo_mate', 'b_mujer_barre', 'b_autito', 'b_pelota', 'b_arco', 'b_perro_bebe', 'b_jaula',
  'b_cartel_vende', 'b_sombrilla', 'k_gauchito', 'k_virgen', 'k_heladera', 'k_tele', 'k_mantero', 'k_pizarra_helado', 'k_pelopincho', 'k_cucha', 'k_banderines',
  'parrilla', 'parrilla_tambor', 'parrilla_b'];

// ---------- grafitis (van a las paredes, casa por casa: editor/js/paredes.js): los grandes (con variantes de color), las letras
// sueltas (firmas: se arman de a varias, teñidas), los carteles pegados (de a varios) y las enredaderas en su espaldera (paradas
// en el piso contra la pared, quietas)
const GRAF = {
  grandes: ['graffiti_0_0_1', 'graffiti_0_0_2', 'graffiti_169_73', 'graffiti_172_7', 'graffiti_260_12', 'graffiti_265_66', 'graffiti_273_104', 'graffiti_66_10', 'graffiti_76_71'],
  letras: ['graffiti_elements_148_2_1', 'graffiti_elements_148_2_2', 'graffiti_elements_194_18_1', 'graffiti_elements_194_18_2', 'graffiti_elements_194_18_3'],
  carteles: ['posters_102_69', 'posters_135_67', 'posters_3_39', 'posters_39_35', 'posters_44_71', 'posters_67_35'],
  enredaderas: ['grid_2', 'grid_6', 'grid_7'],
};
const G = {}; for (const k in GRAF) G[k] = GRAF[k].map(b => { const n = 'gr_' + corto(b); FR[n] = { ...arch(b), grafiti: k }; return n; });

// ---------- revisión y salida
for (const [n, ps] of Object.entries(ROLES)) for (const [p] of ps) {
  if (typeof p === 'string') { if (!P[p]) throw new Error(n + ': no hay lista ' + p); }
  else { if (!p.m.length) throw new Error(n + ': maceta sin recipiente'); for (const t of p.p) if (!P[t]) throw new Error(n + ': no hay lista ' + t); } }
for (const n of Object.keys(FR)) { const f = FR[n]; f.ox = Math.floor(f.w / 2); f.oy = f.h >= 16 ? f.h - 2 : f.h - 1; }
const salida = { base: '../arte/objetos/', escala: .6, frames: FR, pools: P, roles: ROLES, quitar: QUITAR, grafitis: G };
const js = '// generado por herramientas/objetos.js — no editar a mano. Los objetos de arte/objetos (dibujados a 31,25 px/m, la escala de los\n'
  + '// personajes LPC: el juego los muestra a 0,6, como a la gente) y qué objeto del juego hace cada uno\n'
  + 'const OBJETOS = ' + JSON.stringify(salida) + ';\n';
fs.writeFileSync(path.join(R, 'editor', 'recursos', 'objetos.js'), js);
const usados = new Set(Object.values(P).flat());
console.log('objetos.js:', Object.keys(FR).length, 'cuadros (', usados.size, 'en listas,', Object.values(G).flat().length, 'grafitis ),', Object.keys(ROLES).length, 'roles,', QUITAR.length, 'quitados');
