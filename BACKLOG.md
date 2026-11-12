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
- [ ] **Casas de esquina con la forma de la esquina** — pendiente. En una esquina que no es de 90°, la casa es una caja
  rectangular y queda un triángulo de vereda vacío, rarísimo. Tiene que tomar la forma de la esquina, aunque sea
  irregular, como las casas del centro de Parque Chas (las de la rotonda).
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

## Piso

- [ ] **Veredas parejas** — hecho (f00925d). Cada lado de cada cuadra lleva un solo tipo de vereda (el que más
  frente ocupaba entre sus lotes), también donde no hay lote.
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

- [ ] **Cables que salen del aire** — en curso. Los cables tienen que salir de algo (un poste, una casa) y llegar a algo,
  y verse más reales y más lindos (con su comba, de a varios, del color del cable).

## Árboles

- [ ] **Ramas más angostas y menos hojas** — pendiente. Que se vea más a través de los árboles.

## Movimiento

- [ ] **Menos vaivén** — hecho (f00925d). Árboles y plantas se mecen la mitad (o menos) que antes, y un poco más
  lento.

## Sombras

- [ ] **Sombras con skew, no giradas** — charlar, motor. La sombra de un objeto de frente (un tendedero, por ejemplo)
  tendría que ser el dibujo inclinado sobre el piso (skew: la base fija, lo de arriba corrido hacia donde cae la sombra),
  no el dibujo girado. Las sombras de los sprites las hace WeedJS (rota el dibujo); los objetos sueltos son decoraciones
  con una sombra horneada fija.

## Formato

- [ ] **Un solo formato** — pendiente. El editor exporta y la escena lee un único formato, sin compatibilidad hacia atrás ni
  caminos de repuesto: fuera las casas en franjas (knob `skew`, `w.franjas`, hojas `casas*`), los flowfields en `.json`
  (knob `ffBinario`, `META.ffExt`), las lámparas de los faroles de Gemini (`LAMPARAS`) y el número de `formato`. Los
  tres barrios ya están en lo nuevo (caras con skew, `.bin`); el barrio inventado y Carabobo hay que reexportarlos igual.

## Barrios y rama

- [ ] **Reexportar el barrio inventado y Carabobo** — pendiente. Todavía tienen los objetos de Gemini y nada de lo de arriba.
- [x] **Rama `objetos-zip`** — mergeada a main el 12/11 (sin subir a GitHub).
