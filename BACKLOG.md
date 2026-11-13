# Backlog

Lo que falta hacer en el juego y en el editor, en el orden en que llegó. Cuando algo se termina, se marca con su commit; lo
que es del motor (WeedJS) se anota acá y se pide en su repo, no se cambia desde acá.

Estados: **pendiente**, **en curso**, **hecho** (con el commit), **charlar** (hay que decidir antes de hacerlo), **motor**
(necesita algo de WeedJS).

## Objetos y casas

- [ ] **Ropa colgada de las paredes** — hecho (f00925d). Sale la soga con ropa que las casas traían pintada en las
  paredes; los tendederos sueltos de `arte/objetos` quedan.
- [ ] **Plantas con tutor (enredaderas en espaldera)** — hecho (f00925d). Van pegadas a las paredes, como los
  grafitis (casa por casa, con el skew y la luz de la pared), paradas en el piso y quietas; más en las casas de más plata
  (knob «plantas»). Ya no salen sueltas en la vereda.
- [ ] **Sin balcones** — hecho (f00925d). Los balcones que salen de la pared (casas, edificios, balconcitos de las
  casas antiguas) dejaban pedazos de pared en medio de la vereda o de la calle; las ventanas que daban a ellos son
  ventanas comunes. Los que están pintados en la fachada de algunas esquinas son dibujo plano y quedan.
- [ ] **Gente tapada por las paredes** — hecho (f00925d). Dos causas:
  - La principal: la y de orden de cada pieza se «sube» para no quedar detrás de una pieza de la misma casa que se pinta
    antes y la toca. Techos, pisos, tapas de muros y accesorios se ordenaban por el frente de la casa (o por su centro):
    uno de atrás empujaba a las paredes que se pintan después hasta el frente, y la gente parada al costado quedaba
    detrás. Ahora una pared se ordena por el punto del piso que tiene debajo, y lo demás por su borde de atrás.
  - Las piezas eran anchas: en una pared que corre hacia el fondo, el pie cambiaba hasta 64 px dentro de una pieza.
    Ahora van en columnas donde cambia 8 px como mucho; cada textura se corta una sola vez.
  - En Parque Chas, las piezas bajas de pared ordenadas más de 8 px por delante de su pie bajaron del 23 % al 2,4 %.
    Las piezas de casas pasaron de 223 089 a 276 605 (+24 %), y el atlas de 33,0 a 34,9 MB (7068 × 4094).
- [ ] **Tanques de agua** — hecho (f00925d). Estaban en todas las casas, todos iguales: ahora en una de cada seis.
- [ ] **Casas de esquina con la forma de la esquina** — hecho (2bfae69). En las esquinas que no son en escuadra (entre 25°
  y 78°, o entre 102° y 155°) va una casa como las de la rotonda (`Houses.chas`): ochava de 2,8 m, frentes de 10 m y el fondo
  donde se cruzan las medianeras. Frentes y ochava miden siempre lo mismo y las medianeras son lisas: todas las esquinas de un
  estilo comparten sus texturas. Los techos en abanico usan un medio cuadrado blanco compartido (si no, cada triángulo iba al
  atlas). En Parque Chas (antes de ensanchar las calles) salieron 88. Pendiente: muchas esquinas no entran (la vereda o el
  lote de al lado no dejan); se podría probar con frentes más cortos.
- [ ] **Fondos de las manzanas** — hecho (2608753): cada límite entre dos patios lleva una medianera de 1,8 m sin pilares
  (tapia de revoque o de ladrillo, del patrón compartido) o un alambrado de 1,5 m, en 6 de cada 7; se corta con más tolerancia (PIE_FONDO,
  32 px: casi no pasa gente) por el tope de decoraciones. Cada fondo, de su semilla: lindo (plantas lindas a lo largo de los bordes,
  un árbol, sillas, ropa colgada; la mitad en lo rico), abandonado (yuyos crecidos, basura, escombro; un tercio en lo pobre) o el de
  siempre. Parque Chas: 1 300 medianeras, 8 mil piezas; decoraciones de 441 a 469 mil (de 524 287). El pedido: Las casas dan a la calle, pero sus fondos (lo de adentro de la manzana)
  tienen que ser patios, jardines o la continuación de la casa, separados entre sí por medianeras y rejas (las paredes y
  rejas que el mapa ya genera). Cada fondo, lindo o abandonado:
  - lindo: un jardín bien armado, con plantas lindas, sillas, mesa, ropa colgada;
  - abandonado, como un baldío: yuyos crecidos, basura, escombros.
- [ ] **Terrenos vacíos** — hecho (7d59c67, b9ce533). En Carabobo y en Parque Chas, lotes del tamaño de una o dos casas sin casa: con
  basura y yuyos, o sólo basura. Hecho (7d59c67): Parque Chas tiene baldíos (3 de cada 100 lotes; antes ninguno: su estilo no los
  traía), un tercio son sólo basura sobre la tierra, y la basura va en montones. Parque Chas: 66 baldíos (24 de basura); Carabobo: 152 (50).
  Y lo que pidió el dueño (12/11), hecho (b9ce533): barriles, cajas, gomas, garrafas, colchones, chapas y escombro chocan y
  hacen sombra (GameObjects); las plantas no. En los de yuyos, unas tres veces más yuyos, arbustos y de uno a tres árboles; en los
  de basura, de cinco a nueve montones grandes y algún yuyo entre la basura.
- [ ] **Techo con agujero en las esquinas con forma** — hecho (7d59c67). El techo iba en abanico desde un vértice: en una planta
  no convexa algún triángulo quedaba dado vuelta (mirando para abajo), el horneado lo descartaba y se veía el patio por el agujero.
  Ahora va por orejas, todos los triángulos mirando para arriba.

- [ ] **Autos y techos se pelean por el orden** — hecho (ef7f96d). Un auto que pasaba detrás de una casa quedaba encima
  del techo, y la medianera de la casa de al lado cruzaba techos: en f00925d los techos se ordenaban por su borde de atrás.
  Ahora un techo se ordena por el borde de adelante de su propia pieza (lo que se le superpone en pantalla está siempre más
  lejos que él); un piso al ras y una tira fina en alto (tapa de muro, alero), por su borde de atrás.

- [ ] **Caras lisas invisibles** — hecho (2bfae69). Las caras de un color (medianeras lisas, contornos) iban en `mundo.json` con
  textura `null`, y WeedJS les da la textura 0, que es `_empty` (transparente): no se veían. El exportador ahora escribe
  `_white`.
- [ ] **Casas de la rotonda: huecos y paredes «de papel»** — hecho (2bfae69). Entre el techo y la pared quedaba una rayita (el triángulo
  compartido de los techos, ahora más fino y pasado de la diagonal) y las paredes no tenían espesor (ahora llevan tapa arriba y el
  parapeto corrido hacia adentro).
- [ ] **Contorno de las paredes del piso de arriba** — hecho (5dc81ce; el dueño, 13/11). Las paredes de material llevaban sólo
  el contorno de los costados (arriba y abajo los tapan el techo y el piso); una pared que no llega al piso (el piso de arriba, la
  caja del techo) lleva ahora los cuatro, si mide 1,4 m o más (la cara de adentro de un petil ya tiene la línea de su tapa).
- [ ] **Patios divididos** — hecho (08891a7; el dueño, 13/11). Los patios tienen que estar separados por paredes, cercas o algo; si no,
  parecen parte de la vereda. En Parque Chas los lotes no llenan la manzana: lo que queda entre ellos se pinta de baldosa, sin
  paredes, y llega hasta la vereda; y muchos patios tenían medianera de un solo lado. Ahora cada patio está cerrado (medianeras a
  los costados y al fondo, puestas después del recorte del catálogo, con la casa que quedó: si deja un pasillo, la medianera
  arranca en el frente y un pedazo de pared lo cierra), y lo que queda entre lotes va detrás de una pared corrida sobre la
  vereda. Decoraciones: Parque Chas 478 271 → 508 899, Carabobo 419 186 → 434 876 (de 524 287). Lo que más cuesta ahora es el
  paredón (6 a 7 piezas por metro, unas 12 mil en cada barrio): si hace falta lugar, va por ahí.
- [ ] **Casas iguales seguidas** — hecho (92d1a7b; el dueño, 13/11). Una casa que se ve como otra ya puesta a menos de 14 m
  (casillas: 6 m) toma la del catálogo más parecida que no se vea como ninguna, o una variante propia. «Se ve como»: la misma clave
  sin rumbo ni fondo. Pares de vecinas iguales: Parque Chas 154 → 0, Carabobo 4 920 → 6; caras de Carabobo 3,74 → 4,45 MB.
- [ ] **Gente detrás de una pared** — hecho (c7d0128; el dueño, 13/11). La tapaba un cartel pegado: una pieza de pared iba con la
  clave de la columna más baja que tapa, y en una pared en diagonal su punta alta quedaba delante de la gente. Ahora va en tiras de
  8 texeles, cada una con su clave.
- [ ] **La fuente tira agua** — hecho (cc6f691). Un chorro de gotas que sube de 0,8 a 1,15 m sobre el pico y cae en la taza de
  arriba, con gravedad de verdad (45 gotas por segundo, sin importar los fps). Partículas de GPU (`ParticleEmitter.emitGpu`, capa
  `agua`) que tira una entidad `Chorro` por fuente. El editor dice de dónde sale y adónde cae (`chorro` en `objetos.js`,
  `META.fuentes`), así sirve para cualquier dibujo de fuente. Las de las plazas también tiran.
- [ ] **Partículas de GPU entre las entidades** — motor. Con `sortWithEntities: true` la capa del agua no dibujaba nada (ni lo que
  queda por encima de la fuente); sin eso, sí (bundle fa59073a, Chromium sin placa). Hoy el agua va encima de las entidades: el
  chorro está a más de 3 m y lo que pasa por delante no llega a taparlo, pero un árbol delante de la fuente de una plaza no
  taparía las gotas. Pedirlo en WeedJS con una escena chica que lo muestre.

## Piso

- [ ] **Veredas parejas** — hecho (2bfae69): una por manzana. En f00925d era una por lado de cuadra, y en una misma manzana
  se mezclaban. Ahora el editor arma las manzanas (lo que queda adentro de las calles, en una grilla de 1 m) y cada una lleva un solo
  tipo de vereda (el que más frente ocupa entre sus lotes), en todas las veredas que la rodean.
- [ ] **Veredas sin plantas en el medio** — hecho (2bfae69). Los yuyos «de las grietas» iban en cualquier punto del
  ancho de la vereda: ahora junto al cordón o al pie de la pared.
- [ ] **Veredas y calles más anchas** — hecho (2bfae69). Knob `ancho` (1,5): multiplica calzadas y veredas (también las
  de un barrio real y la calzada de la rotonda). La franja de pasto junto al cordón mide un tercio de la vereda (entre 1 y
  2,2 m; antes 1 m fijo). Parque Chas: 3379 casas (antes 4140; las manzanas quedaron más chicas).
- [ ] **Gente caminando por la calzada de la rotonda** — hecho (bf17c6f). La grilla de costos de los peatones marcaba vereda todo
  lo que estaba a menos de hw + sw de una calle, sin mirar la rotonda: el anillo de la calzada contaba como vereda (barato, y un lugar
  donde aparecía gente). Ahora el anillo es calzada (se cruza como una calle) y en la isla de la fuente no camina nadie.
- [ ] **Calles parejas** — hecho (f00925d). Un solo material por calle (asfalto, asfalto roto, adoquín, tierra), el
  que más largo tenía entre sus cuadras. Una calle son las cuadras del mismo nombre; sin nombre, las que siguen derecho en
  la esquina.
- [ ] **Plantas y árboles saliendo de la baldosa** — hecho (4a27389; el dueño, 13/11: «no tiene sentido! salvo que estén en
  macetas»). En un patio de baldosa o cemento una planta de tierra va en maceta y no se ponen yuyos (los de grieta sí) ni árboles;
  la regla del piso es una sola (World.pisoLote), la misma con que el exportador lo pinta.
- [ ] **Patio y jardín en cada fondo** — hecho (el dueño, 13/11: «el piso de los fondos es siempre el mismo... debería estar
  alineado con la casa; muchas veces hay una parte de patio, de cerámicos o algo así, pero cada casa diferente, y una parte de
  jardín, con plantas»). Cada casa: baldosas pegadas a la casa (roja, calcáreo blanco y negro, cerámico, ladrillo, vainilla gris o
  cemento, de su semilla), alineadas con ella (piso.bin trae el rumbo de cada lote: la parte «patios»), y detrás su jardín: pasto,
  tierra en lo pobre, yuyos si está abandonado; a veces todo patio. Las plantas de tierra, en el jardín; en el patio, macetas.
- [ ] **Medianeras que se abren del lote; plantas encima de la tapa** — hecho (el dueño, 13/11). Las medianeras se dibujaban
  giradas al rumbo de auto más cercano (cada 7,5°), no al de su lote: una de 26 m de un lote a 171,1° salía a 165,8°, 2,3 m fuera
  de su lugar y metida en la casa del fondo («esa línea que se va abriendo»). Ahora llevan su ángulo exacto (spec.ph; el diseño se
  comparte entre ángulos y el atlas no crece) y van en el marco de su lote. Una planta de atrás ya no queda encima: columnas de
  16 px (antes 32) y la tapa ordenada por la punta de adelante de su pared. No pasan a menos de 0,5 m de la casa de otro lote (se
  cortan en tramos) ni dejan pasillos de menos de 90 cm junto a la casa. Las casas siguen al rumbo de auto más cercano: en un lote
  que no está en uno de esos rumbos, la casa queda girada hasta 3,75° respecto del lote.

## Luces

- [ ] **Faros de los autos** — hecho (f00925d). La luz sale del frente del auto, no 18 px más adelante (la sombra de
  un árbol al costado caía hacia atrás), y el auto ya no lleva destellos.
- [ ] **Brillos ordenados por Y** — motor. Los brillos tienen que ordenarse por Y con lo demás. El brillo propio de cada
  luz (`hasGlowSprite`, con `lightGlow: 'sprite'`) ya va con las entidades, pero la luz de la noche lo multiplica y casi no
  se ve; por eso las lámparas de los faroles y los semáforos llevan su brillo en capas aditivas, encima de todo (la lámpara
  detrás de una casa va sin brillo). Probado: en la capa de entidades la lámpara queda opaca y sin halo. Hace falta que
  WeedJS dibuje un brillo en el orden de las entidades sin que la luz lo oscurezca (por ejemplo, la pasada aditiva de los
  brillos con prueba de profundidad contra las entidades, o un búfer emisivo que se suma después de la luz).
- [ ] **Luces direccionales** — charlar, motor. Un parámetro en `LightEmitter`: el ángulo del cono (360° por defecto, así las
  luces de siempre siguen siendo puntuales), que gira con la entidad. Para los faros de los autos.
- [ ] **Resolución de la luz para pixel art** — charlar. ¿Tiene sentido `lighting.resolution: .5` en un juego pixel art?

## Cables

- [ ] **Cables que salen del aire** — hecho (2bfae69). Las bajadas terminaban en un punto al azar (en el aire): ahora van a
  la fachada de una o dos casas del lado del poste. De poste a poste, los tres de luz y dos de teléfono y tele, más gruesos y
  combados; la línea cruza la esquina si la calle sigue derecho, y si no, el último poste lleva su rienda al piso. Cada tramo
  tiene su estilo (grosor y tono). Parque Chas: 34 065 tramos (antes 7028). Además el pool de decoraciones de la escena no
  contaba los grafitis: las últimas decoraciones (cables, líneas) podían quedar sin lugar.

## Árboles

- [ ] **Ramas más angostas y menos hojas** — hecho (2bfae69). Ramas a 0,6 de su grosor (el tronco igual), la mitad de
  los racimos pelados y al resto le queda un cuarto de sus hojas.
- [ ] **Árboles con ramas repetidas** — hecho (b9ce533; el dueño, 12/11). Cada especie, una librería de 4 ramas paradas y su
  cima; cada tipo de árbol las usa giradas, una sí y una no en espejo, y estiradas. Un solo tronco (y otro a la cal), recto,
  estirado a cada árbol. Parque Chas: la hoja `arboles`, de 215 cuadros (2,71 Mpx, 1,0 MB) a 74 (0,99 Mpx, 0,48 MB); Carabobo,
  de 141 (1,83 Mpx) a 50 (0,70 Mpx).
- [ ] **Hojas flotando; ramas que terminan en palo** — hecho (b9ce533; el dueño, 12/11). Las rosetas iban en una esfera
  alrededor del extremo de la rama y muchas quedaban en el aire: ahora van sobre ramitas que salen del racimo. Los racimos de las
  puntas y la cima nunca quedan pelados, y la punta de cada ramita lleva su roseta.

## Movimiento

- [ ] **Menos vaivén** — hecho (f00925d). Árboles y plantas se mecen la mitad (o menos) que antes, y un poco más
  lento.

## Sombras

- [ ] **Sombras con skew, no giradas** — charlar, motor. La sombra de un objeto de frente (un tendedero, por ejemplo)
  tendría que ser el dibujo inclinado sobre el piso (skew: la base fija, lo de arriba corrido hacia donde cae la sombra),
  no el dibujo girado. Las sombras de los sprites las hace WeedJS (rota el dibujo); los objetos sueltos son decoraciones
  con una sombra horneada fija.

## Imágenes y atlas

- [ ] **Ordenar las imágenes; repo limpio** — hecho (fffa219). Cada pack de `arte/objetos` es una hoja con su JSON en
  `img/objetos/` (`herramientas/hojas.js`; 19 packs y `viejos`, lo que queda de la hoja vieja del editor: carteles, piletas,
  pizarras, el semáforo y las sombras). La escena carga esas hojas enteras y WeedJS arma el bigAtlas al cargar: ya no se hornea
  (`hornear_atlas.js` y las carpetas `atlas/` de los barrios, fuera). El editor sólo arma lo del barrio: caras, árboles, piso y
  la hoja de grafitis de las paredes (`img/grafitis`). `META.props` dice la hoja, el cuadro, el ancla, la escala y si se mece de
  cada objeto (antes, `META.anclas` y `META.escalas` y una hoja `img/props` por barrio).
- [ ] **Fuera los objetos de Gemini** — hecho (fffa219). Se borraron sus dibujos (`arte/gemini`, `hd_props`, el .rar) y las
  herramientas que los limpiaban y achicaban (`achicar.py`, `armar_hd.py`, `pixelar.py`, `variantes.py`, `fuente_mosaico.py`,
  `variantes.html`). Quedan las piezas de fachada (`arte/fachadas`, con las hojas originales en `arte/fachadas/gemini`); su hoja
  la arma ahora `herramientas/hojas.js` (salió igual pixel por pixel). Las grillas de autos para Gemini pasaron a
  `arte/autos_gemini`. La fuente de la rotonda y de las plazas es la de `arte/objetos`.
- [ ] **Plazas sin juegos ni bancos de Gemini** — falta el dibujo. Con los objetos de Gemini se fueron los juegos (hamacas, tobogán,
  subibaja, calesita), el monumento, la glorieta, el bebedero, el ping-pong, el ajedrez y las manchas del piso; los packs de
  `arte/objetos` no traen nada de eso (los bancos y la fuente sí). Hoy las plazas los saltean. Armados en 3D con cajas de colores
  (69ffe40, b8f1005) quedaban horribles al lado de la fuente: se sacaron (el dueño, 13/11). Van cuando haya un dibujo (otro pack
  o del dueño); no se arman en 3D sin que se pida.
- [ ] **Atlas de las caras con mucho repetido** — hecho (c1d764e). Las paredes de material (revoque, ladrillo, ladrillo hueco,
  salpicré, hormigón, piedra) salen de una baldosa compartida que se repite; el revoque, gris, teñido del color de cada pared. Al
  hornear: el fondo en recortes de la baldosa (con las manchas horneadas), y lo dibujado encima (ventanas, puertas, carteles,
  zócalos) en recuadros con sólo eso, compartidos; una pieza igual a otra va una sola vez.

  | | Atlas de caras | PNG | Piezas de casas |
  |---|---|---|---|
  | Parque Chas | 12,9 → 7,8 Mpx | 20,7 → 7,0 MB | 232 → 353 mil |
  | Carabobo | 9,6 → 6,2 Mpx | 15,4 → 6,2 MB | 236 → 341 mil |
  | Inventado | 10,1 → 6,6 Mpx | 15,5 → 6,1 MB | 55 → 77 mil |

  El costo: un 40-50 % más de piezas (lo dibujado va aparte, y el borde de los costados). Pendiente si hace falta: medir qué le
  cuestan al juego esas piezas de más (memoria, carga, cuadro) en un aparato de verdad; los techos todavía guardan un recorte por
  medida (de medio metro en medio metro). Una decoración que repita su textura (tiling, como los sprites) haría innecesarios los
  recortes: sería un pedido a WeedJS.
- [ ] **Caras, segunda y tercera vuelta** — hecho (b9ce533; el dueño, 12/11: «hay un montón de assets duplicados», «un simple
  pattern que se repite», «decorations rotadas, con skew y scale»). El fondo de las paredes y los techos, un patrón: baldosas de
  6 × 3 m (techos, 6 × 6) repetidas y estiradas, sin variantes por manchas. Lo dibujado, cada cosa en su recuadro, cortado en franjas
  regulares desde su borde; las rayas a lo ancho de la pared, en su tira; lo que es la pared oscurecida pareja, negro translúcido
  (sirve sobre cualquier color); ventanas y puertas con su azar de su tamaño y una de tres variantes. Las piezas de fachada de Gemini,
  la imagen original una vez, escalada a cada uso; las pintadas, en una capa aparte, de una de 16 variantes por ancho. Cada pieza,
  recortada a lo que tiene.

  | | Esta mañana | Ahora |
  |---|---|---|
  | Parque Chas | 12,9 Mpx, 4 hojas, 20,7 MB; 232 mil piezas | 4,2 Mpx, 2 hojas, 3,8 MB; 344 mil piezas |
  | Carabobo | 9,6 Mpx, 3 hojas, 15,4 MB; 236 mil piezas | 3,4 Mpx, 1 hoja, 3,3 MB; 316 mil piezas |

  El tope: WeedJS numera las decoraciones con 19 bits, más de 524 287 no carga. Con baldosas de 3 m Parque Chas pedía 536 mil y el
  juego no arrancaba; con 6 m pedía 497 mil, y cortando el fondo de cada pared con su propia columna (no con la más fina de todas
  las paredes que comparten la baldosa) y con borde sólo a los costados en las paredes, 441 mil (Carabobo, 379 mil).

## Formato

- [ ] **Un solo formato** — hecho. El editor exporta y la escena lee un único formato, sin compatibilidad hacia atrás ni
  caminos de repuesto. Los flowfields siempre en `.bin` (fuera el knob `ffBinario`, `META.ffExt` y el repuesto `.json`) y
  fuera el número de `formato` (0f39cb4); las lámparas de los faroles de Gemini (`LAMPARAS`) (fffa219); y las casas en franjas
  (el dueño, 13/11: «el camino de la exportación anterior podés borrarlo»): fuera el knob `skew`, `w.franjas`, las hojas
  `casas*`, `META.nFranjas`, `nPiezas`, `hojasCasas` y `escalaCasas`, y la rama de la escena que colgaba franjas de la `Casa`.
  Lo que hacían (una persona pegada a una pared se ordena bien) lo hacen las caras: cada pared que llega al piso va en columnas
  donde el pie cambia 8 px como mucho (`PIE_MAX`). `META.skew` queda en 1: el demo de WeedJS lo mira.

## Una sola escena: la del demo de WeedJS

- [ ] **Este repo pasa a ser el editor de barrios** — pendiente (decidido el 12/11). El juego jugable es el demo de WeedJS
  (`demos/buenosAiresScene`), como ahora; la escena de acá (`conurbanoScene.js`) se deja de mantener. Quizás este repo
  cambie de nombre. Lo que el editor arma es dato, y la escena sólo lo lee con lectores genéricos. Hoy al demo le faltan
  tres:
  - las piezas propias de cada casa (`casas[].g`: grafitis, firmas, carteles, enredaderas), con el mismo formato que las
    piezas de las caras;
  - las lámparas de cada farol (`META.lamparas`: dónde está la lámpara, a qué altura, su cuadro prendido), en vez de una tabla
    por nombre;
  - la planta sobre su maceta (`props[].o`).
  Y conviene que el formato diga las cosas en vez de que la escena las deduzca de los nombres (por ejemplo, un dato «se
  mece» en vez de los prefijos `plm_`/`yy_`: ya está, `META.props[n].m`). Va junto con «Un solo formato». A resolver: cuánto
  pesan los barrios en el repo de WeedJS (Parque Chas son unos 80 MB por exportación).

## Barrios y rama

- [ ] **Reexportar el barrio inventado y Carabobo** — hecho (fffa219): los tres barrios, reexportados juntos.
- [x] **Rama `objetos-zip`** — mergeada a main el 12/11 (sin subir a GitHub).
- [ ] **Varsovia y Bucarelli, tal cual** — hecho (45e9bf8; el dueño, 12/11 y 13/11). Los 20 lotes de la cuadra, del catastro, y cada casa
  de la foto más nueva de su fachada (`editor/recursos/cuadras_reales.js`, `Houses.build` con `spec.d`); las dos esquinas de
  Bucarelli, estilos propios de `Houses.chas` (2901 con paños de ladrillo, 1634 lila con la esquina redonda); los árboles del censo
  corridos con los lotes. Diferencias que quedan: las calles del editor son más anchas (los frentes, achicados un 7 % para que
  entren); las fachadas del lado par miran para el otro lado de la cámara; los postes salen como en todo el barrio; los balcones
  no van (se sacaron de todas las casas). Después (el dueño, 13/11: «que se haga ahora»), las de Bucarelli junto a la esquina, en
  cuadras parciales (con su ancho real, pegadas a la esquina o al cruce): enfrente 1645, 1639, 1635, 1627 y 1617, y del lado de
  Varsovia 1628; 1652, 1642 y 1618 no entran (con las calles más anchas, las manzanas del editor son más chicas ahí; las fotos
  están en `D:\tmp\varsovia\fotos`). Lo pedido:
  En Parque Chas, la esquina de Varsovia y Bucarelli
  tiene que quedar como es de verdad, y sobre todo la cuadra de Varsovia al 2900: lo más parecida posible, casa por casa (ancho
  del frente, alto, materiales y colores, puertas, ventanas, rejas, portones, techos), y también la vereda, los árboles y los
  postes. Mirarla en Google Maps, Street View o lo que haya. En el mapa, Varsovia al 2900 es la cuadra de 116 m entre Bucarelli y
  Andonaegui (`osm_parquechas.json`, way 5513; la Ciudad pone Varsovia 2950 a mitad de cuadra); hoy sus lotes y sus casas salen
  al azar, como en todo el barrio.

## Editor

- [ ] **Dibujar calles; las manzanas salen solas** — pendiente (el dueño, 12/11). Hoy las calles de un barrio real salen de
  `real_<barrio>.js` (los `segs`, de `herramientas/osm_real.py`), y las manzanas no se guardan: el generador las saca de las
  calles. La idea: el barrio pasa a ser un grafo de esquinas y cuadras (`editor/recursos/barrio_<carpeta>.json`) que se
  dibuja en el editor, con imán a los 48 rumbos de los autos; de ahí salen los `segs` de siempre, y lotes, casas y manzanas
  siguen saliendo del generador de hoy. Después, las manzanas como polígonos (las caras del grafo), para marcar una como
  plaza, villa o complejo. Plan, por etapas y con lo que hay que charlar antes: `editor/PLAN_CALLES.md`.
