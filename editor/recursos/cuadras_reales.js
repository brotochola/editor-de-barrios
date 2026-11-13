// Cuadras de un barrio real armadas tal cual (el dueño, 12/11: «la esquina de Varsovia y Bucarelli tiene que quedar como es de
// verdad, y sobre todo la cuadra de Varsovia al 2900: lo más parecida posible, casa por casa»). Los lotes salen del catastro de la
// Ciudad (epok.buenosaires.gob.ar: herramientas/catastro.js) y cada casa, de la foto de fachada más nueva del lote
// (fotos.usig.buenosaires.gob.ar). world.js pone los lotes en su orden y con sus frentes, achicados lo justo para que entren entre
// las esquinas (las calles del editor son más anchas que las de verdad); barrio.js arma cada casa con su descripción (Houses.build,
// spec.d) en vez del sorteo.
//
// Una cuadra: la calle, los ejes de las dos esquinas (lon, lat), las esquinas (las de la punta «desde»: el estilo de Houses.chas, los
// pisos, el frente sobre cada calle y si es redonda; «hasta»: null = sin la esquina del generador, los lotes del catastro llegan
// hasta el cruce) y los lotes: lado (izq/der yendo de «desde» a «hasta»), frente de s0 a s1 (m desde el eje de «desde»), fondo (m).
// La casa: k (tipo), pisos, pared [r, g, b], fin (stucco/brick), revest (piedra, zocalo_piedra, granito, ceramico, marmol; revestH m,
// revestC color), pbFin/paFin (brick: la planta baja o la alta de ladrillo), paPared (color de la planta alta), banda (cornisa de
// color), petil (ladrillo), techo (losa, membrana, tejas; tejaC), mansarda (faja de pizarra entre los pisos), retiro (m: la planta
// alta corrida), D (fondo de la casa), y las aberturas de la planta baja (pb) y la alta (pa): [tipo, x, ancho, opciones], x en m
// desde la izquierda mirando desde la calle, sobre el frente de verdad (ancho). Tipos: puerta (m: madera, chapa, vidrio; c color),
// reja (puerta de reja), ventana (e: persiana, cerrado, lama, reja, arco, none; c color de la lama o la persiana; r: reja delante),
// porton (c), cortina (persiana de chapa de garaje).
(window.CUADRAS_REALES = window.CUADRAS_REALES || {}).parquechas = [{
  calle: "Varsovia", desde: [-58.482057, -34.583204], hasta: [-58.482938, -34.583962],   // los ejes de Bucarelli y de Andonaegui
  origen: [-34.5858, -58.4788],   // el de recursos/osm_parquechas.json (lat, lon): las calles del barrio se proyectan desde ahí
  esquinas: {
    desde: {
      // Varsovia 2901 (061-166-025A): una planta, revoque gastado con paños de ladrillo y ventanitas tapiadas, parapeto alto
      der: { tipo: "v2901", pisos: 1, frente: { Varsovia: 9.2, Bucarelli: 11 }, och: 1.2 },
      // Bucarelli 1634 (061-165-001): casa art déco lila de una planta, esquina redonda, murito con pilares adelante
      izq: { tipo: "b1634", pisos: 1, frente: { Varsovia: 13.5, Bucarelli: 12 }, och: 4, redonda: true },
    },
    hasta: null,
  },
  lotes: [
    // ---- lado impar (der, manzana 061-166), de Bucarelli a Andonaegui
    { smp: "061-166-024", dir: "Varsovia 2915", lado: "der", s0: 14.7, s1: 23.8, fondo: 14.9,
      casa: { k: "casa2", pisos: 2, pared: [232, 224, 206], D: 9, techo: "losa",
        pb: [["ventana", 1.4, 1.5, { e: "reja" }], ["ventana", 4.2, .7, { e: "none", r: 1 }], ["puerta", 7.4, .95, { m: "chapa", c: [236, 234, 228] }]],
        pa: [["ventana", 1.3, 1.6, { e: "persiana" }], ["ventana", 5.6, 1.6, { e: "persiana" }]] } },
    { smp: "061-166-023", dir: "Varsovia 2923", lado: "der", s0: 23.8, s1: 32.7, fondo: 15.0,
      casa: { k: "casa", pisos: 1, pared: [238, 236, 228], revest: "zocalo_piedra", banda: [176, 122, 62], D: 9, techo: "membrana",
        pb: [["ventana", 1.4, 1.6, { e: "lama", c: [214, 216, 214] }], ["ventana", 4.4, 1.6, { e: "lama", c: [214, 216, 214] }], ["puerta", 7.5, .95, { m: "madera" }]] } },
    { smp: "061-166-022", dir: "Varsovia 2931", lado: "der", s0: 32.7, s1: 41.7, fondo: 15.2,
      casa: { k: "casa", pisos: 1, pared: [232, 208, 198], D: 11, techo: "losa",
        pb: [["puerta", 1.6, 1.0, { m: "madera" }], ["ventana", 3.9, .8, { e: "none", r: 1 }], ["puerta", 6.9, 1.05, { m: "madera" }]] } },
    { smp: "061-166-021", dir: "Varsovia 2947", lado: "der", s0: 41.7, s1: 50.7, fondo: 15.2,
      casa: { k: "casa2", pisos: 2, pared: [178, 188, 198], paPared: [222, 224, 226], mansarda: [62, 68, 84], D: 9, techo: "losa",
        pb: [["ventana", 2.2, 2.0, { e: "none", r: 1 }], ["ventana", 5.9, .6, { e: "none" }], ["puerta", 7.6, .9, { m: "chapa", c: [238, 238, 234] }]],
        pa: [["ventana", .8, 1.4, { e: "lama", c: [240, 240, 236] }], ["ventana", 3.6, 1.2, { e: "none" }], ["ventana", 6.3, 1.4, { e: "lama", c: [240, 240, 236] }]] } },
    { smp: "061-166-020", dir: "Varsovia 2953", lado: "der", s0: 50.7, s1: 59.8, fondo: 15.1,
      casa: { k: "casa2", pisos: 2, pared: [224, 198, 98], revest: "ceramico", paFin: "brick", retiro: 1.6, D: 11, techo: "losa",
        pb: [["porton", 5.3, 2.7, { c: [226, 214, 160] }]],
        pa: [["ventana", .9, 1.4, { e: "arco" }], ["ventana", 5.4, 2.6, { e: "none" }]] } },
    { smp: "061-166-019", dir: "Varsovia 2965", lado: "der", s0: 59.8, s1: 68.6, fondo: 15.0,
      casa: { k: "casa2", pisos: 2, pared: [176, 96, 70], fin: "brick", D: 11, techo: "losa",
        pb: [["reja", 1.2, 1.4], ["porton", 4.9, 2.6, { c: [96, 66, 44] }]],
        pa: [["ventana", 1.0, 1.8, { e: "lama", c: [210, 192, 156] }], ["ventana", 5.3, 1.8, { e: "lama", c: [210, 192, 156] }]] } },
    { smp: "061-166-018", dir: "Varsovia 2971", lado: "der", s0: 68.6, s1: 77.7, fondo: 14.7,
      casa: { k: "casa2", pisos: 2, pared: [234, 232, 226], revest: "marmol", revestH: 2.8, revestC: [206, 204, 198], D: 9, techo: "losa",
        pb: [["ventana", 1.0, 2.0, { e: "lama", c: [236, 236, 232] }], ["puerta", 4.9, .9, { m: "chapa", c: [238, 238, 234] }], ["puerta", 6.0, .9, { m: "chapa", c: [238, 238, 234] }], ["puerta", 7.1, .9, { m: "chapa", c: [238, 238, 234] }]],
        pa: [["ventana", 3.4, 1.6, { e: "persiana" }]] } },
    { smp: "061-166-017", dir: "Varsovia 2979", lado: "der", s0: 77.7, s1: 86.8, fondo: 14.9,
      casa: { k: "casa", pisos: 1, pared: [218, 216, 210], petil: "ladrillo", D: 9, techo: "losa",
        pb: [["ventana", 1.0, 1.6, { e: "lama", c: [96, 176, 180] }], ["reja", 4.2, .9], ["porton", 5.9, 2.6, { c: [104, 180, 182] }]] } },
    { smp: "061-166-016", dir: "Varsovia 2987", lado: "der", s0: 86.8, s1: 95.7, fondo: 15.0,
      casa: { k: "casa", pisos: 1, pared: [236, 234, 228], D: 9, techo: "losa",
        pb: [["ventana", 2.2, 1.5, { e: "reja" }], ["puerta", 6.6, 1.0, { m: "chapa", c: [238, 238, 234] }]] } },
    { smp: "061-166-015", dir: "Andonaegui 1627", lado: "der", s0: 95.7, s1: 105.4, fondo: 12.8,
      casa: { k: "casa2", pisos: 2, pared: [234, 232, 226], paFin: "brick", D: 9, techo: "losa",
        pb: [["ventana", .9, 1.3, { e: "reja" }], ["puerta", 4.4, .95, { m: "chapa", c: [236, 236, 232] }], ["ventana", 7.2, 1.3, { e: "reja" }]],
        pa: [["ventana", 1.2, 1.4, { e: "persiana" }], ["ventana", 6.6, 1.4, { e: "persiana" }]] } },
    // ---- lado par (izq, manzana 061-165), de Bucarelli a Andonaegui
    { smp: "061-165-002", dir: "Varsovia 2924", lado: "izq", s0: 27.7, s1: 37.6, fondo: 15.5,
      casa: { k: "casa2", pisos: 2, pared: [224, 208, 178], retiro: 1.4, D: 9, techo: "losa",
        pb: [["ventana", 1.0, 1.6, { e: "reja" }], ["reja", 4.1, 1.0], ["reja", 5.4, .6], ["ventana", 6.9, 1.3, { e: "lama", c: [226, 226, 222] }]],
        pa: [["ventana", 6.4, 1.5, { e: "persiana" }]] } },
    { smp: "061-165-003", dir: "Varsovia 2928", lado: "izq", s0: 37.6, s1: 46.4, fondo: 21.7,
      casa: { k: "casa2", pisos: 2, pared: [238, 236, 230], revest: "ladrillo", revestH: .8, D: 11, techo: "losa",
        pb: [["puerta", .6, .95, { m: "madera" }], ["porton", 4.0, 2.6, { c: [238, 236, 230] }]],
        pa: [["ventana", .9, 1.4, { e: "cerrado", c: [200, 74, 46] }], ["ventana", 5.6, 1.6, { e: "cerrado", c: [200, 74, 46] }]] } },
    { smp: "061-165-004", dir: "Varsovia 2938", lado: "izq", s0: 46.4, s1: 55.2, fondo: 21.7,
      casa: { k: "casa", pisos: 1, pared: [212, 212, 208], revest: "granito", revestH: 1.9, revestC: [118, 118, 120], D: 11, techo: "losa",
        pb: [["reja", .3, .95], ["ventana", 2.8, 1.5, { e: "reja" }], ["ventana", 5.9, 1.5, { e: "reja" }]] } },
    { smp: "061-165-005", dir: "Varsovia 2946", lado: "izq", s0: 55.2, s1: 64.0, fondo: 21.7,
      casa: { k: "casa2", pisos: 2, pared: [238, 236, 232], pbFin: "brick", D: 9, techo: "tejas", tejaC: [92, 92, 98],
        pb: [["puerta", .3, .95, { m: "madera" }], ["porton", 2.0, 2.6, { c: [40, 124, 72] }], ["ventana", 6.0, 1.4, { e: "reja" }]],
        pa: [["ventana", 3.4, 1.3, { e: "lama", c: [232, 232, 228] }]] } },
    { smp: "061-165-006", dir: "Varsovia 2966", lado: "izq", s0: 64.0, s1: 72.7, fondo: 21.7,
      casa: { k: "casa", pisos: 1, pared: [214, 200, 172], revest: "piedra", D: 9, techo: "tejas",
        pb: [["puerta", .9, .95, { m: "madera" }], ["ventana", 3.4, 1.4, { e: "reja" }], ["reja", 6.3, 1.0]] } },
    { smp: "061-165-007", dir: "Varsovia 2972", lado: "izq", s0: 72.7, s1: 81.6, fondo: 21.7,
      casa: { k: "casa", pisos: 1, pared: [236, 234, 228], revest: "granito", revestH: 2.6, revestC: [44, 44, 48], D: 11, techo: "tejas",
        pb: [["porton", .4, 3.2, { c: [150, 94, 48] }], ["ventana", 5.2, 1.4, { e: "reja" }]] } },
    { smp: "061-165-008", dir: "Varsovia 2980", lado: "izq", s0: 81.6, s1: 90.3, fondo: 21.6,
      casa: { k: "chalet", pisos: 1, pared: [238, 236, 230], D: 7, techo: "tejas",
        pb: [["ventana", 1.0, 1.4, { e: "lama", c: [232, 232, 228] }], ["puerta", 4.0, .95, { m: "madera" }], ["ventana", 6.3, 1.4, { e: "lama", c: [232, 232, 228] }]] } },
    { smp: "061-165-009", dir: "Varsovia 2986", lado: "izq", s0: 90.3, s1: 99.7, fondo: 13.3,
      casa: { k: "casa2", pisos: 2, pared: [190, 104, 76], fin: "brick", mansarda: [96, 72, 62], D: 9, techo: "losa",
        pb: [["puerta", 3.0, 1.3, { m: "madera" }], ["ventana", 7.0, 1.5, { e: "reja" }]],
        pa: [["ventana", 1.2, 1.6, { e: "persiana" }], ["ventana", 6.4, 1.6, { e: "persiana" }]] } },
    { smp: "061-165-010", dir: "Varsovia 2994", lado: "izq", s0: 99.7, s1: 105.3, fondo: 13.1,
      casa: { k: "casa2", pisos: 2, pared: [200, 200, 196], paFin: "brick", D: 9, techo: "tejas", tejaC: [92, 76, 66],
        pb: [["puerta", .4, .9, { m: "madera" }], ["ventana", 2.6, 1.4, { e: "lama", c: [232, 232, 228] }]],
        pa: [["ventana", 1.6, 1.8, { e: "persiana" }]] } },
  ],
}];
