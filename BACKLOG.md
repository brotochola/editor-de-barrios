# Backlog

Lo que falta hacer en el juego y en el editor, en el orden en que llegó. Cuando algo se termina, se marca con su commit; lo
que es del motor (WeedJS) se anota acá y se pide en su repo, no se cambia desde acá.

Estados: **pendiente**, **en curso**, **hecho** (con el commit), **charlar** (hay que decidir antes de hacerlo), **motor**
(necesita algo de WeedJS).

## Objetos y casas

- [ ] **Ropa colgada de las paredes** — hecho, falta el commit. Sale la soga con ropa que las casas traían pintada en las
  paredes; los tendederos sueltos de `arte/objetos` quedan.
- [ ] **Plantas con tutor (enredaderas en espaldera)** — hecho, falta el commit. Van pegadas a las paredes, como los
  grafitis (casa por casa, con el skew y la luz de la pared), paradas en el piso y quietas; más en las casas de más plata
  (knob «plantas»). Ya no salen sueltas en la vereda.
- [ ] **Sin balcones** — hecho, falta el commit. Los balcones que salen de la pared (casas, edificios, balconcitos de las
  casas antiguas) dejaban pedazos de pared en medio de la vereda o de la calle; las ventanas que daban a ellos son
  ventanas comunes. Los que están pintados en la fachada de algunas esquinas son dibujo plano y quedan.
- [ ] **Gente tapada por las paredes** — hecho, falta el commit. Dos causas:
  - La principal: la y de orden de cada pieza se «sube» para no quedar detrás de una pieza de la misma casa que se pinta
    antes y la toca. Techos, pisos, tapas de muros y accesorios se ordenaban por el frente de la casa (o por su centro):
    uno de atrás empujaba a las paredes que se pintan después hasta el frente, y la gente parada al costado quedaba
    detrás. Ahora una pared se ordena por el punto del piso que tiene debajo, y lo demás por su borde de atrás.
  - Las piezas eran anchas: en una pared que corre hacia el fondo, el pie cambiaba hasta 64 px dentro de una pieza.
    Ahora van en columnas donde cambia 8 px como mucho; cada textura se corta una sola vez.
  - En Parque Chas, las piezas bajas de pared ordenadas más de 8 px por delante de su pie bajaron del 23 % al 2,4 %.
    Las piezas de casas pasaron de 223 089 a 276 605 (+24 %), y el atlas de 33,0 a 34,9 MB (7068 × 4094).
- [ ] **Tanques de agua** — hecho, falta el commit. Estaban en todas las casas, todos iguales: ahora en una de cada seis.
- [ ] **Fondos de las manzanas** — pendiente. Las casas dan a la calle, pero sus fondos (lo de adentro de la manzana)
  tienen que ser patios, jardines o la continuación de la casa, separados entre sí por medianeras y rejas (las paredes y
  rejas que el mapa ya genera). Cada fondo, lindo o abandonado:
  - lindo: un jardín bien armado, con plantas lindas, sillas, mesa, ropa colgada;
  - abandonado, como un baldío: yuyos crecidos, basura, escombros.
- [ ] **Terrenos vacíos** — pendiente. En Carabobo y en Parque Chas, lotes del tamaño de una o dos casas sin casa: con
  basura y yuyos, o sólo basura.

## Piso

- [ ] **Veredas parejas** — hecho, falta el commit. Cada lado de cada cuadra lleva un solo tipo de vereda (el que más
  frente ocupaba entre sus lotes), también donde no hay lote.
- [ ] **Calles parejas** — hecho, falta el commit. Un solo material por calle (asfalto, asfalto roto, adoquín, tierra), el
  que más largo tenía entre sus cuadras. Una calle son las cuadras del mismo nombre; sin nombre, las que siguen derecho en
  la esquina.

## Luces

- [ ] **Faros de los autos** — hecho, falta el commit. La luz sale del frente del auto, no 18 px más adelante (la sombra de
  un árbol al costado caía hacia atrás), y el auto ya no lleva destellos.
- [ ] **Brillos ordenados por Y** — motor. Los brillos tienen que ordenarse por Y con lo demás. El brillo propio de cada
  luz (`hasGlowSprite`, con `lightGlow: 'sprite'`) ya va con las entidades, pero la luz de la noche lo multiplica y casi no
  se ve; por eso las lámparas de los faroles y los semáforos llevan su brillo en capas aditivas, encima de todo (la lámpara
  detrás de una casa va sin brillo). Probado: en la capa de entidades la lámpara queda opaca y sin halo. Hace falta que
  WeedJS dibuje un brillo en el orden de las entidades sin que la luz lo oscurezca (por ejemplo, la pasada aditiva de los
  brillos con prueba de profundidad contra las entidades, o un búfer emisivo que se suma después de la luz).
- [ ] **Resolución de la luz para pixel art** — charlar. ¿Tiene sentido `lighting.resolution: .5` en un juego pixel art?

## Movimiento

- [ ] **Menos vaivén** — hecho, falta el commit. Árboles y plantas se mecen la mitad (o menos) que antes, y un poco más
  lento.

## Sombras

- [ ] **Sombras con skew, no giradas** — charlar, motor. La sombra de un objeto de frente (un tendedero, por ejemplo)
  tendría que ser el dibujo inclinado sobre el piso (skew: la base fija, lo de arriba corrido hacia donde cae la sombra),
  no el dibujo girado. Las sombras de los sprites las hace WeedJS (rota el dibujo); los objetos sueltos son decoraciones
  con una sombra horneada fija.

## Barrios y rama

- [ ] **Reexportar el barrio inventado y Carabobo** — pendiente. Todavía tienen los objetos de Gemini y nada de lo de arriba.
- [ ] **Rama `objetos-zip`** — pendiente: mergear a main y subir cuando el dueño diga.
