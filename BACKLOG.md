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
- [ ] **Fondos de las manzanas** — pendiente. Las casas dan a la calle, pero sus fondos (lo de adentro de la manzana)
  tienen que ser patios, jardines o la continuación de la casa, separados entre sí por medianeras y rejas (las paredes y
  rejas que el mapa ya genera). Cada fondo, lindo o abandonado:
  - lindo: un jardín bien armado, con plantas lindas, sillas, mesa, ropa colgada;
  - abandonado, como un baldío: yuyos crecidos, basura, escombros.
- [ ] **Terrenos vacíos** — pendiente. En Carabobo y en Parque Chas, lotes del tamaño de una o dos casas sin casa: con
  basura y yuyos, o sólo basura.

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
- [ ] **La fuente tira agua** — pendiente. La fuente de la rotonda tira agua hacia arriba, un metro más o menos, con
  `ParticleEmitter`.

## Piso

- [ ] **Veredas parejas** — hecho (2bfae69): una por manzana. En f00925d era una por lado de cuadra, y en una misma manzana
  se mezclaban. Ahora el editor arma las manzanas (lo que queda adentro de las calles, en una grilla de 1 m) y cada una lleva un solo
  tipo de vereda (el que más frente ocupa entre sus lotes), en todas las veredas que la rodean.
- [ ] **Veredas sin plantas en el medio** — hecho (2bfae69). Los yuyos «de las grietas» iban en cualquier punto del
  ancho de la vereda: ahora junto al cordón o al pie de la pared.
- [ ] **Veredas y calles más anchas** — hecho (2bfae69). Knob `ancho` (1,5): multiplica calzadas y veredas (también las
  de un barrio real y la calzada de la rotonda). La franja de pasto junto al cordón mide un tercio de la vereda (entre 1 y
  2,2 m; antes 1 m fijo). Parque Chas: 3379 casas (antes 4140; las manzanas quedaron más chicas).
- [ ] **Gente caminando por la calzada de la rotonda** — pendiente, revisar. Con las calles más anchas, en la rotonda de Parque
  Chas se ve mucha gente caminando por la calzada.
- [ ] **Calles parejas** — hecho (f00925d). Un solo material por calle (asfalto, asfalto roto, adoquín, tierra), el
  que más largo tenía entre sus cuadras. Una calle son las cuadras del mismo nombre; sin nombre, las que siguen derecho en
  la esquina.

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
- [ ] **Plazas sin juegos ni bancos de Gemini** — pendiente. Con los objetos de Gemini se fueron los juegos (hamacas, tobogán,
  subibaja, calesita), el monumento, la glorieta, el bebedero, el ping-pong, el ajedrez y las manchas del piso; los packs de
  `arte/objetos` no traen nada de eso. Se podrían armar en 3D en el editor, como los postes (`Houses.poste`), u otro pack.
- [ ] **Atlas de las caras con mucho repetido** — pendiente. Cada pared es una textura propia aunque sea casi la misma (ladrillo,
  revoque, con su ruido, sus manchas y sus ventanas pintadas), y cada techo guarda su material en su propia medida. Reusar
  pedazos: paredes con una baldosa de material compartida (como los techos) y ventanas, puertas y carteles como piezas aparte,
  también compartidas; techos con una sola baldosa por material, repetida.

## Formato

- [ ] **Un solo formato** — pendiente. El editor exporta y la escena lee un único formato, sin compatibilidad hacia atrás ni
  caminos de repuesto: fuera las casas en franjas (knob `skew`, `w.franjas`, hojas `casas*`), los flowfields en `.json`
  (knob `ffBinario`, `META.ffExt`) y el número de `formato`. Las lámparas de los faroles de Gemini (`LAMPARAS`) ya se fueron
  (fffa219). Los tres barrios ya están en lo nuevo (caras con skew, `.bin`).

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
