# Barrio Conurbano · WeedJS

El mismo barrio de la versión Pixi/Three, armado como escena de WeedJS 0.13.0 más la rama `dx/face-normals` (sus bundles, en `weed/`) con los patrones de `carScene` y `littleCity`.

## Cómo correrlo

WeedJS usa `SharedArrayBuffer`, así que la página tiene que estar "aislada" (encabezados COOP/COEP).

- **En tu compu:** `python3 servir.py` (o `node herramientas/servir.js`, si no hay Python) y abrí `http://localhost:8000/`.
- **Publicado:** subí la carpeta entera a cualquier hosting estático con HTTPS (por ejemplo GitHub Pages). `weed-sw.js` pone los encabezados: la primera visita recarga una vez sola.
- `?gente=N` fija la cantidad de gente (si no, se ajusta sola).
- `?prueba=x,y;x,y,p;x,y,u_cono` pone faroles (o la prop que digas, o `p` = una persona quieta) en esas coordenadas de mundo, para revisar a mano el orden de dibujo.
- `?debug` en la URL abre el panel de WeedJS (rendimiento por worker, entidades, capas, etc.). Sin `?debug` el juego carga el bundle de producción, más rápido.

## Controles

| Acción | Cómo |
|---|---|
| Mover la cámara | arrastrar, WASD o flechas |
| Zoom | rueda, pellizco, o los botones − + |
| Manejar | V o el botón 🚗 (WASD / flechas; espacio frena). En el celu aparecen botones. |
| Cambiar la hora | botón 🌗 (salta a mediodía, atardecer, noche y amanecer) |

## Cómo está armado

- **Mundo de WeedJS = píxeles de la proyección oblicua** (18 px/m de ancho, 9 px/m de profundidad, corrimiento K = 0,16), igual que littleCity. La física de Box2D corre en ese espacio.
- **Piso:** una capa `worldRect` con un shader (`shaders/piso.frag`) que pinta calles, veredas, sendas, cordones, canteros, baches y patios en la GPU, píxel por píxel, con el mismo algoritmo que la versión Pixi. Los datos van en texturas compartidas (`PisoData`): celdas de 0,5 m con las calles candidatas, la tabla de calles en punto fijo de 16 bits, la riqueza y el ruido.
- **Casas, tapiales y postes:** sprites horneados con R3 (luz, sombras, contornos), en un catálogo compartido entre lotes (`img/obj*.png`). Las calles y las casas usan sólo los 48 rumbos de pantalla de los autos (cada 7,5°), pasados a ángulos del mundo: así los autos quedan paralelos a la calle y las casas a su vereda. Cada grilla usa un par de esos rumbos que queda casi en escuadra (error menor a 1,6°). Cada casa es una entidad estática con colisionador poligonal (la envolvente de las cajas que apoyan en el piso, de hasta 8 vértices; antes era el lote entero y tapaba la vereda) y su sombra al piso es una malla en la capa `sombrasCasas`.
- **Orden de dibujo (ySort) de las casas:** cada casa se dibuja en franjas verticales. En la proyección oblicua la altura sólo sube en pantalla, así que cada columna del sprite es un pedazo fijo de piso, y su profundidad es la base de la pared ahí. El horneado calcula esa base desde las cajas 3D apoyadas en el piso, y junta columnas mientras la base no cambie más de 8 px (64 px de ancho como máximo). Cada franja es una entidad `Franja` ubicada en la base, de donde sale su y de orden. Lleva colgadas piezas de 64 px de alto como decoraciones: se ordenan con la y del padre, pero se recortan cada una por su propio centro, así las paredes altas no desaparecen en el borde al hacer zoom. Las piezas se pisan 1 px para que no queden rayas. La entidad `Casa` sólo tiene el colisionador y la luz de la ventana.
- **Casas por caras con skew** (parámetro `skew` del editor, 1 por defecto; necesita WeedJS con DX-DECOSKEW, PR #7). En vez de hornear la casa entera una vez por rumbo, cada diseño se arma una sola vez en R3, sin rumbo, y se hornean sus caras planas. El juego dibuja cada cara con escala y skew, porque una cara plana vista en la proyección oblicua es un paralelogramo.
  - **Qué va al atlas:**
    - las paredes de material (revoque, ladrillo, ladrillo hueco, salpicré, hormigón, piedra) no van enteras. En el editor salen de una baldosa compartida que se repite (`houses.js`, modo kit); al hornear se separa lo que se dibujó encima:
      - el fondo: un patrón, baldosas de 6 × 3 m de su material repetidas y estiradas (`scale`), las mismas en todas las paredes; la de revoque, salpicré y hormigón es gris y la pieza la tiñe del color de la pared. Recortes sólo de media baldosa a lo ancho o un tercio de alto (paredes angostas, petiles bajos). Sin manchas: la humedad y la sombra del piso van horneadas en lo dibujado (el zócalo, las puertas);
      - lo dibujado encima: cada cosa en su recuadro (una ventana, una puerta, un cartel, una pintada), cortado en franjas regulares desde su borde, así la misma cosa da las mismas franjas en cualquier pared. Las rayas que cruzan la pared (cornisas, bordes de zócalo) van en su propia tira. Lo que es la pared oscurecida pareja (el vano de una ventana, una sombra) va como negro translúcido, que sirve sobre cualquier color; ventanas, puertas y cortinas sacan su azar de su tamaño y de una de tres variantes. Se ordena encima del fondo que tiene debajo;
      - las piezas de fachada de Gemini (ventanas, puertas, frentes de local, cortinas): la imagen original, una sola vez, escalada a cada uso;
      - las pintadas (`graffiti.js`): en una capa aparte, de una de 16 variantes por ancho; la misma se repite igual;
      - el borde, sólo a los costados (las esquinas de la casa).
      Cada pieza se recorta a lo que tiene. Parque Chas: el atlas de caras pasó de 12,9 Mpx en 4 hojas (20,7 MB) a 4,2 Mpx en 2 (3,8 MB); Carabobo, de 9,6 a 3,4 Mpx en una hoja. El costo: más piezas (Parque Chas, de 232 a 344 mil). WeedJS numera las decoraciones con 19 bits: más de 524 287 no carga (con baldosas de 3 m Parque Chas pedía 536 mil; ahora, 441 mil). Por eso el fondo de una pared se corta con la columna que pide esa pared (una copia por nivel: son chicas), y las paredes que llegan al piso llevan borde sólo a los costados;
    - las caras con dibujo propio que no son de material (rejas, triángulos, lo chico), con su contorno y la oclusión del piso, en piezas de hasta 128 px (en una pared que corre hacia el fondo, columnas más finas: ver el orden de dibujo);
    - una pieza igual a otra (los mismos pixeles) va una sola vez;
    - los techos, una baldosa de 6 × 6 m por material, compartida por todas las casas, repetida y estirada (media baldosa para los chicos);
    - los tanques (en una de cada seis casas), aires, antenas y macetas, como un sprite compartido cada uno, como el tanque de los props;
    - las caras de color liso no van al atlas: se dibujan con la textura blanca del motor, teñida (en `mundo.json`, `"_white"` por su nombre: con `null`, WeedJS les daba la textura 0, que es `_empty`, transparente); los triángulos lisos (techos en abanico), con un medio cuadrado blanco compartido, también teñido.
  - **Luz:** la pone WeedJS (`lighting.faces`). Cada pieza dice hacia dónde mira su cara (la normal, ya girada con el rumbo) y a qué altura está su centro, y el motor la ilumina como una superficie: un farol alumbra la pared que lo mira y no la de atrás, una pared a la que no le llega luz queda oscura, y el sol ilumina cada cara según su ángulo, a cada hora. El exportador sólo les pone el tinte de una superficie plana al sol. `?caras=0` lo apaga, para medir lo que cuesta. No hay sombras proyectadas sobre las paredes.
  - **Orden de dibujo:**
    - dentro de la casa, el de pintor entre las caras (`innerZ`);
    - con el resto (la gente, los árboles, los objetos): una pared, el punto del piso que tiene debajo; un techo, el borde de adelante de su pieza sobre el piso (lo que se le superpone en pantalla está siempre más lejos); un piso al ras o una tira fina en alto (tapa de muro, alero), su borde de atrás; subida lo justo para no quedar detrás de una pieza de la misma casa que la tapa. Una pared que corre hacia el fondo va en columnas en las que su pie no cambia más de 8 px (las lisas también: no van en una pieza sola), así la gente parada al pie, adelante, no queda detrás. Cada textura se corta una sola vez, con la columna más fina que pida cualquiera de sus usos.
  - **En el juego:** las piezas son decoraciones del mundo, no colgadas (la casa no se mueve), así no pasan por el paso de las decoraciones colgadas en cada cuadro. Se cargan con un solo objeto de configuración reusado.
- **Árboles:** salen del editor (esqueleto tipo L-system, hojas en rosetas), de otoño: ramas finas (`RAMA_FINA`, 0,6 de lo que les tocaba) y pocas hojas (la mitad de los racimos del medio de las ramas pelados y a cada racimo le queda un cuarto de sus hojas), así se ve a través de la copa. Cada uno es una entidad `Arbol`: el tronco es su sprite y cada rama es una decoración colgada, anclada en su base, que se mece (`sway`, apenas).
  - **Ramas compartidas:** cada especie dibuja una vez una librería de 4 ramas y su cima, paradas (su dibujo girado sobre su base antes de pintarlo, así queda nítido y en la caja más chica). Cada tipo de árbol (su esqueleto: de dónde salen sus ramas y hacia dónde van) usa para cada rama la de largo más parecido, girada a su ángulo (`rotation` de la decoración), una sí y una no en espejo, y estirada a su largo. El tronco es uno solo para todos (y otro a la cal), recto, estirado al alto y al grosor de cada árbol. Parque Chas: la hoja `arboles` pasó de 215 cuadros (2,7 Mpx) a 74 (1,0 Mpx).
  - **Ninguna hoja flota:** de cada racimo salen de 3 a 5 ramitas finas (1 px de corteza) y las rosetas van sobre ellas. Toda rama termina en hojas: los racimos de las puntas y la cima nunca quedan pelados, y la punta de cada ramita lleva su roseta.
- **Gente:** de 3500 a más de 15 000 personas LPC con cuerpo de Box2D, según el aparato. Arranca con 6000 en un celu de 8 núcleos (3500 en uno más chico, 10 000 en compu) y durante el primer minuto se ajusta sola. Mira los fps del render y de cada worker. Si sobra, suma de a 10 %; si no da, saca de a 12 %, siempre fuera de cámara. Si sacar gente no mejora nada (el freno es la GPU), la devuelve y deja de tocar. `?gente=8000` en la URL fija la cantidad. Los lugares (~23 000 en las veredas) están en `data/gente.bin` (`node herramientas/hornear_gente.js`). Siguen 6 flowfields estáticos con costos (vereda 10, calle 220), así que cruzan por las sendas y no caminan por la calle. Se separan entre sí y esquivan autos.
- **Autos:**
  - 23 modelos del paquete «TopDown Vehicles» v1.17 de MinZiin: hatch, sedán, pickup, compacto, micro, rural, coupé, de lujo, deportivo, superauto, muscle car, jeep, SUV, monovolumen, utilitario, limusina, camión, volcadora, casa rodante, colectivo, ambulancia, patrullero y taxi. Casi todos vienen en 2 colores (hatch, sedán y pickup en 3). Hay además 8 chatarras, quemadas o abandonadas.
  - `node herramientas/hornear_autos.js "<carpeta del paquete>"` arma `img/autos/`. Toma un cuadro quieto por rumbo de pantalla (48, cada 7,5°; la chatarra trae 8) y lo centra en el punto donde el vehículo apoya en el piso, así el ancla no salta entre cuadros. Guarda sólo los rumbos que miran a la derecha (25 de 48): los que miran a la izquierda se dibujan espejados (`flipX`). También escribe `autos.js` con el largo y el ancho de cada modelo.
  - El editor sólo da el lugar, el rumbo, si circula y un color (`poli` es patrullero, `burnt` es chatarra). El juego elige el modelo por peso y por la riqueza de la zona: los de lujo van en zonas ricas y los viejos en las pobres. Si el modelo tiene el color del editor, lo usa. Un vehículo largo queda sólo donde entra sin pisar a otro. Siempre circulan al menos 2 ambulancias, 4 colectivos, 2 volcadoras y 2 camiones.
  - Cada modelo tiene su colisionador. La IA frena y la gente esquiva según el tamaño de cada uno.
  - Los que andan solos siguen el flowfield `calles`, que apunta a lo largo de cada carril (mano derecha) y tira hacia su centro. Frenan si tienen gente o autos adelante.
  - **Respetan la ley de tránsito** (Ley Nacional 24.449 y Código de Tránsito de CABA). El editor exporta `transito.bin`, una grilla de 1 m con la velocidad máxima, la zona de cada cruce (los 7 m antes de la senda y la caja del cruce) y qué cruce es; `mundo.json` trae los cruces (si tienen semáforo y el rumbo de cada calle).
    - **Velocidad máxima** (art. 51): 40 km/h en las calles, 60 en las avenidas, 30 al llegar a un cruce sin semáforo y 20 en las calles de tierra y los pasajes. Cada conductor anda entre el 80 y el 97 % del máximo.
    - **Semáforos:** ciclo de 40 s (17 verde, 3 amarillo, 20 rojo para cada calle), con un desfase por cruce. Los autos frenan antes de la senda en amarillo y en rojo, y las lámparas del semáforo se prenden con la misma fase.
    - **Prioridad de la derecha** (art. 41) en las esquinas sin semáforo: el que viene por la derecha pasa primero. Si nadie se mueve en 4 s, el que espera arranca, para que no se traben los cuatro.
    - **No bloquear el cruce:** no entran si el auto de adelante está parado del otro lado.
    - **Peatones primero:** en las sendas y en el cruce frenan antes por la gente que cruza.
    - Cuesta 2 bytes por metro cuadrado del mapa y una lectura de la grilla por auto y por cuadro.
  - Los estacionados se pueden empujar.
  - Los 48 cuadros del paquete van en rumbos de pantalla parejos, así que el cuadro sale directo del rumbo del cuerpo. (Del paquete, los que miran a la izquierda no son el espejo exacto de los de la derecha; los espejos que usa el juego dejan las dos mitades simétricas.)
- **Luz y sombras (como `predatorScene`):** `config.lighting` con el sol y el ciclo de día de WeedJS (8 minutos; arranca a las 17:30) y una luz de noche propia (`lighting.sun.night`): una luna azulada que se suma a la escena sin tocar `Sun.intensity`, así que las sombras del sol se apagan solas de noche y los faroles siguen cálidos. El sol anda del lado de la cámara (`shadowAngleOffset: 0`: las sombras caen hacia el fondo; si no, las caras que se ven estarían siempre a contraluz) y sube hasta 60° (`maxElevation`; a 90, al mediodía no le daría a ninguna pared). Gente, árboles y postes tienen `ShadowCaster`: proyectan sombra del sol y de las luces cercanas. El árbol proyecta su silueta entera como textura de sombra (`ShadowCaster.setTexture`; las ramas son decoraciones, y en WeedJS las decoraciones no proyectan) y su sprite es el tronco; con `?siltex=0`, la silueta vuelve a ser un sprite invisible. Las casas y los autos proyectan sombras de volumen con `VolumeShadowCaster` de WeedJS: dicen qué son, y la placa corre la sombra con el sol en cada cuadro. Cada casa es el volumen convexo de sus cajas, armado al cargar con los puntos que exporta el editor (`sp` en `mundo.json`). El editor saca los puntos que casi no mueven la sombra (tanques, cumbreras bajas, parapetos: ninguna sombra de 73 posiciones del sol pierde más del 1 % de su área), así el volumen tiene unos 10 vértices y 15 triángulos en vez de 17 y 27. Cada auto es su caja (`setBox`, con el alto de `sombraAuto.js`), que la placa gira con él: doblar no toca ningún vértice. Esa capa y la de las sombras horneadas de los objetos siguen al sol con `alphaBySun`: las de casas y autos son tan oscuras como la sombra de una persona, no oscurecen doble donde se pisan y se apagan de noche. Faroles, postes con lámpara y faros de autos se prenden a su hora (`LuzHora`: cada uno entre las 18 y las 19, al azar, y se apagan entre las 6 y las 7). Los faroles alumbran desde la lámpara (`sourceHeight`) con charcos elípticos como el piso (`groundScaleY` 0,5); los faros son la luz del propio auto, corrida adelante (`LightEmitter.offsetX`). Los brillos de los faros van con las entidades, ordenados por y (y los de WeedJS, con `lighting.lightGlow: 'sprite'`): una casa o un árbol que está delante los tapa, y los faros de un auto que da la espalda quedan detrás de la carrocería. Los de las lámparas de los faroles siguen en una capa aditiva (debajo de la luz casi no se veían), y el farol cuya lámpara queda detrás de una casa va sin brillo (se calcula al cargar). `?raycast=1` prueba luces que no atraviesan las casas (`lighting.raycasted`: cada farol, poste y auto arma un polígono de visibilidad contra las plantas de las casas, que llevan `LightOccluder`). Medido en una PC con GPU, a las 22 h, con la cámara fija: 60 fps con y sin, pero el pre-render sube un 20 a 40 % (0,3 a 1,8 ms) y en Carabobo también Pixi (+0,6 y +1,4 ms en 2 pares); en la vista oblicua casi no se nota (los faroles están delante de las casas) y WeedJS apaga en ese modo las sombras proyectadas de gente y árboles. Por eso queda apagado. `sombras.html` es un banco de pruebas de las sombras: piso liso, sol quieto y una grilla de autos, gente y árboles (`?hora=`, `?autos=viejo`, `?piso=shader`); `herramientas/capturas.js` saca capturas del juego a varias horas con el mismo encuadre, para comparar antes y después de un cambio.
- **Árboles, faroles y semáforos** son entidades con colisionador. El mobiliario chico, las sombras de los props y los cables son `Decoration`; los cables van en una capa propia por encima de todo.
- **Cables:** postes de madera a un costado de cada cuadra, cada 24 a 32 m. De poste a poste van los tres cables de luz de la cruceta y, a media altura, dos de teléfono y tele, más gruesos y más combados. Si la calle sigue derecho, la línea cruza la esquina hasta el poste de la cuadra siguiente; si no, el último poste lleva su rienda al piso. De cada poste bajan cables a la fachada de una o dos casas de su lado (a la altura del techo de la planta baja; en un chalet, a la casa, detrás del jardín). Cada tramo dice su estilo (`mundo.json` cables[i][4]: 0 luz, 1 teléfono o tele, 2 bajada, 3 rienda) y la escena le da su grosor y su tono.

## Otro barrio: el editor de barrios

`editor/` es el editor de barrios (la versión Three.js con todos los knobs). Se abre en `http://localhost:8000/editor/`.

1. Tocás los knobs (mapa, loteos, riqueza, calles, casas, árboles, gente y autos opcionales, luz) y elegís la semilla con 🎲.
2. **📦 Exportar** baja `barrio_<semilla>.zip`. Adentro está la carpeta del barrio (`carabobo/` o `parquechas/`):
   - `meta.js`/`meta.json`: tamaños y cantidades;
   - `mundo.json`: casas, árboles, props, autos y cables;
   - `piso.bin`;
   - flowfields `ff_*.bin`: peatones, veredas (vuelta manzana) y calles, en el formato binario de WeedJS (con gzip: un 3 o 4 % de lo que pesarían en `.json`, y el juego no los parsea);
   - hojas de sprites en `img/`: las caras de las casas (`caras*`), los árboles y los grafitis de las paredes.
3. Reemplazás la carpeta del juego por esa (o, sin manos: `node herramientas/reexportar.js <carabobo|parquechas>`, más abajo).

El editor arma sólo las hojas del barrio (casas, árboles, piso). Los objetos están en `img/objetos/`, comunes a todos los barrios. El
juego carga las hojas enteras y WeedJS arma el bigAtlas al cargar.

## El barrio real: Av. Carabobo al 1500 y la villa 1-11-14 (Bajo Flores)

El juego tiene dos barrios, los dos **reales**: Carabobo (`carabobo/`) y Parque Chas (`parquechas/`). El inventado (`barrio/`) se
borró el 12/11 (el dueño: sólo importan estos dos). Se elige con `?barrio=carabobo` o `?barrio=parquechas` en la URL (si no, el
último que se jugó, o Parque Chas) y el botón 🗺️ pasa al otro. Una sola escena sirve para todos: `barrios.js` junta los `meta.json` de cada carpeta (`node herramientas/barrios.js`,
después de exportar) y la escena toma el que diga su URL.

En el editor, con el parámetro `real` en 1 o 2 no se inventa el barrio: se arma con datos de verdad y el zip trae la carpeta
`carabobo/` o `parquechas/`. Con `real` en 0 el editor todavía inventa uno (en `barrio/`), pero el juego ya no lo trae.

- **Qué entra:** una franja de 480 × 1080 m jugables (más 40 m de margen), girada 15,5° para que la grilla de Bajo Flores quede casi derecha en pantalla. Arriba, Av. Carabobo con Balbastro, Lautaro y Saraza (el juego arranca en Carabobo al 1500); en el medio, Av. Castañares, Bonorino y el Barrio Rivadavia I con sus pasajes peatonales; abajo, la villa 1-11-14 hasta Av. Riestra.
- **Calles:** las de OSM, clasificadas (avenida, calle, pasaje, pasillo de villa), con su ancho, y encajadas en los 48 rumbos de los autos: cada tramo toma el rumbo más cercano y los nodos se mueven por mínimos cuadrados (en promedio 1,7 m), así las esquinas son las mismas.
- **Villa:** las manzanas de la 1-11-14 mapeadas en OSM, con sus pasillos. Las casillas son de ladrillo, de 2 a 4 pisos, pegadas, con contrapiso y tierra entre medio.
- **Barrio Coreano:** los locales sobre Carabobo tienen frente coreano (supermercado, restaurante, ropa, peluquería, panadería, iglesia, karaoke, almacén; piezas de fachada de Gemini, `arte/fachadas/gemini/locales_02`).
- **Plazas y canchas** de OSM: las plazas con sus senderos, las canchas con arcos y líneas pintadas.
- **Rehacerlo:** `editor/recursos/osm_carabobo.json` son los datos bajados de la API de OSM (calles, usos del suelo, edificios, comercios, en metros); `python3 herramientas/osm_real.py --png vista.png` escribe `editor/recursos/real_carabobo.js` (ventana, giro y tamaño arriba del archivo). Después, exportar desde el editor como siempre.

## El barrio real: Parque Chas, el laberinto

El barrio de Frehner y Guerrico (1925): calles en anillos alrededor de la esquina de seis (Av. Victorica, Ávalos y Gándara), con
nombres de ciudades europeas (Berlín, Ginebra, La Haya, Londres, Cádiz…), y cuadrícula hacia La Pampa, Triunvirato y Av. de los Incas.

- **Qué entra:** 950 × 870 m jugables (más 40 m de margen): los anillos enteros y las cinco plazas del barrio (Éxodo Jujeño y
  Cap. Domingo F. Sarmiento adentro de los anillos; Alfredo Nobel, Andrés Chazarreta y Jamaica al sur), Av. Victorica de punta a punta
  y un tramo de Av. de los Incas. El juego arranca sobre Victorica, a 40 m de la fuente. Girado 265,25°: tan bueno como el mejor para
  los rumbos de los autos y deja de frente a la cámara el Café Chas sobre Ávalos y Keops sobre Gándara.
- **Calles y plazoletas:** del callejero de la Ciudad (red vial, una línea por cuadra con nombre, tipo y jerarquía). Las curvas se
  encajan en los 48 rumbos como las rectas (los nodos se mueven 5 m en promedio, 20 m como mucho en los anillos). Las plazoletas son
  la manzana que encierra a los árboles de cada espacio verde del censo.
- **Árboles de vereda:** uno por uno, del censo de arbolado público lineal de la Ciudad (2017-2018), con su especie: fresnos (casi la
  mitad), plátanos, ficus, paraísos, tilos, crespones, jacarandás, liquidámbares, tipas y algún palo borracho. Se corren con las calles
  al encajarlas y se plantan sobre el cordón del tramo más cercano. Tilo, crespón y ficus son especies nuevas (sólo salen donde el
  barrio las pide).
- **Casas:** bajas, de los años 30 a 60: casas de una y dos plantas y PH, algún chalet y casi sin comercio adentro (los locales van
  sobre las avenidas). Un 28 % de las casas tiene techo de tejas (`estilo.tejas`); las tejas son un material compartido del horneado
  con skew, como los techos planos y la chapa.
- **La esquina de seis:** una rotonda con una fuente en el medio (la de `arte/objetos`), que tira un chorro de un metro: gotas que
  caen en la taza de arriba, partículas de GPU que tira una entidad `Chorro` (el editor dice de dónde sale y adónde cae cada dibujo de
  fuente: `chorro` en `herramientas/objetos.js`, `META.fuentes`). Los autos le dan la vuelta en sentido antihorario y cada uno elige por qué calle sale.
- **Las seis esquinas de la fuente, copiadas a mano** de la foto 360° desde la fuente (Hernán Apaza, 2018) y de las fotos de Google
  Maps (`ESQUINAS` en `osm_real.py`, `Houses.chas`): cada una con la planta de la esquina (la ochava frente a la fuente) y su edificio.
  Victorica y Gándara: la Pizzería Keops (roja, tres plantas, cartel amarillo con las pirámides); Gándara y Ávalos al este: ladrillo
  rosado con el balcón cerrado blanco; Ávalos y Victorica al sudeste: la casa negra nueva; Victorica y Gándara al sudoeste: la casa
  gris con garaje; Gándara y Ávalos al oeste: el edificio blanco art déco de esquina redonda con el Café Chas abajo (Ávalos 1554:
  vidrieras de marco verde con reja de rombos, pilares de granito, letras blancas y las mesas en la vereda); Ávalos y Victorica al
  noroeste: la casa crema con balaustrada. Con la cámara fija, de cada esquina se ven los lados que miran al sur.
- **Veredas y patios:** veredas de 4,2 m (la mediana del censo de arbolado); casi sin pasto (patios de baldosa y de cemento, manzanas
  llenas con más construcciones al fondo) y sin baldíos.
- **Exportado** con skew: 4092 casas, 2445 árboles, 219 mil piezas de pared y techo.
- **Rehacerlo:** los datos salen del portal data.buenosaires.gob.ar (red vial, arbolado público lineal y arbolado en espacios verdes;
  no se guardan acá, pesan 100 MB). `python3 herramientas/gcba_osm.py --barrio parquechas --red red-vial-CABA.geojson
  --arbolado arbolado_lineal.csv --verdes arbolado_verdes.csv` escribe `editor/recursos/osm_parquechas.json` en el formato de OSM;
  `python3 herramientas/osm_real.py --barrio parquechas --png vista.png` escribe `editor/recursos/real_parquechas.js`. El estilo del
  barrio (tipos de casa, riqueza, árboles de plaza, tejas, variedad) está en `BARRIOS` de `osm_real.py`.

## Cómo se arma la ciudad (editor/js/world.js)

- **Grilla continua:** en un mapa chico, una sola grilla (como Flores). En uno grande, zonas de loteos de distintas épocas separadas por rectas, que son avenidas o calles. Las calles siguen derecho de una cuadra a la otra.
- **Avenidas** rectas cada 4 a 6 cuadras. **Pasajes** de una cuadra, de calle a calle.
- **La red se limpia como grafo:** esquinas de 3 o 4 calles, ángulos de 35° o más, dos T enfrentadas a menos de 14 m se juntan en un cruce, y las calles que terminan en la nada se estiran hasta la próxima o se sacan.
- **Villas:** grupos de 2 a 5 manzanas en la zona más pobre, rodeadas de calles comunes (como la 1-11-14). Adentro tienen calles de tierra entre manzanas y pasillos que serpentean y salen a la calle.
- **Plazas:** una manzana entera cada 5 o 6 cuadras, con senderos de baldosa roja, la fuente en el medio, árboles, faroles y bancos (los juegos y el monumento esperan un dibujo: los packs no traen).
- **Lotes** hasta la mitad de la manzana. En los hondos casi siempre hay algo construido en el fondo.
- **Fondos de las manzanas:** cada patio, cerrado: una medianera de 1,8 m (tapia de revoque o de ladrillo) o un alambrado a cada costado y al fondo, y si la casa deja un pasillo a un costado, la medianera arranca en el frente y un pedazo de pared lo cierra sobre la vereda. Lo que queda entre lotes (en la Capital, baldosa de patio), donde toca la vereda, va detrás de una pared corrida. Cada fondo, de su semilla: un jardín lindo (plantas a lo largo de los bordes, un árbol, sillas, ropa colgada), abandonado (yuyos crecidos, basura, escombro) o el de siempre; más lindos en lo rico y más abandonados en lo pobre.
- **Calles y veredas parejas:** cada calle lleva un solo material de punta a punta (asfalto, asfalto roto, adoquín o tierra: el que más largo tiene entre sus cuadras). Una calle son las cuadras del mismo nombre o, sin nombre, las que siguen derecho en la esquina. Cada lado de cada cuadra lleva un solo tipo de vereda (el que más frente ocupa entre sus lotes), también donde no hay lote.
- **Plantas:** macetas contra los frentes, plantas en los patios (en uno de baldosa o cemento van en maceta, y no salen yuyos ni árboles del piso), canteros y cazuelas de vereda, y enredaderas, jardineras y helechos colgados en las fachadas. El parámetro `plantas` (1,8× por defecto) multiplica todas esas chances.
- **Esquinas con ochava:** en las esquinas de manzana casi en escuadra (no en la villa ni en calles de tierra) va una casa de esquina de 10 × 10 m con la ochava a 45°: el negocio en la ochava (almacén, bar, kiosco, farmacia, pizzería, panadería, café…) con cartel y a veces toldo, vidrieras sobre las dos calles, uno o dos pisos. Los bares y cafés sacan mesitas a la vereda. Parámetro `ochavas`.
- **Esquinas que no son en escuadra** (entre 25° y 78°, o entre 102° y 155°): una casa con la forma de la esquina, como las de la rotonda de Parque Chas (`Houses.chas`): una ochava de 2,8 m, un frente de 10 m sobre cada calle y el fondo donde se cruzan las medianeras (a lo sumo 14 m). Frentes y ochava miden siempre lo mismo y las medianeras son lisas, así todas las esquinas de un estilo comparten sus texturas y el atlas no crece con cada esquina. Las paredes de estas casas tienen espesor: una tapa arriba y el parapeto corrido hacia adentro.
- **Calles y veredas:** el knob `ancho` (1,5) multiplica calzadas y veredas, también las de un barrio real y la calzada de su rotonda (los pasillos no). La franja de pasto junto al cordón, cuando la hay, mide un tercio de la vereda (entre 1 y 2,2 m). En medio de la vereda no hay plantas: los yuyos salen junto al cordón o al pie de las paredes.
- **Borde del mapa:** el área jugable (`mapW` × `mapH`) está cerrada por un **paredón** de 3 m con pilares, pintadas y alambre de púas, con colisionador. Del otro lado se genera ciudad, `margen` m de cada lado (45 por defecto), sin gente, sin autos andando y sin yuyos, para no cargar el juego. Los lotes que el paredón cruza quedan vacíos.
  - Los flowfields de la gente y de los autos sólo tienen dirección adentro, así que nadie aparece ni camina afuera.
  - La cámara libre no deja que la vista salga del mapa: en pantalla el mapa es un paralelogramo y la vista entera tiene que quedar adentro (`limitarVista`). Por eso nunca se ve el borde del mundo.
- **Pintadas** (`editor/js/graffiti.js`), según un relevamiento de las paredes porteñas: mensajes personales en aerosol ("PATO TE AMO", "VALE CALLATE", cumpleaños), barras y fútbol (en Bajo Flores, San Lorenzo: CASLA, "VOLVEMOS A BOEDO"), bandas (Los Redondos, La Renga, Callejeros), consignas de pintor sobre pared blanqueada a la cal ("NUNCA MÁS", "NI UNA MENOS", "URBANIZACIÓN YA"), poesía de pared (fondo blanco y letra negra fina, frases escritas para el juego), firmas y bombas de grafiteros, avisos (SE VENDE con un teléfono) y, en la villa, la fe de cada comunidad (Gauchito Gil, Virgen de Caacupé, Señor de los Milagros, el Padre Ricciardelli). Trazo de aerosol con niebla y chorreadas, renglones torcidos, y un color que se vea sobre esa pared.
- **Autos estacionados:** por cada calle tienen que poder pasar dos autos (2,45 m cada uno); se estaciona sólo si entran tres (de un lado) o cuatro (de los dos). Y como manda el Código de Tránsito de CABA: no en las avenidas de doble mano (prohibido de 7 a 21), ni en la esquina (hasta 5 m después de la vereda de la otra calle), ni en la parada del colectivo, ni junto a un hidrante.
- **Cazuelas** de tierra (con borde de ladrillo, de cemento o sin borde) alrededor de los árboles de vereda, a veces con plantas o yuyos.

## Objetos (`arte/objetos`): plantas, macetas, basura, sillas, obra, faroles y grafitis

Los objetos sueltos del barrio salen de `arte/objetos/`: dibujos de varios packs (0-mem0ry, Cainos, GandalfHardcore, LPC Revised,
karsiori), elegidos y unificados con los personajes LPC (misma escala, 31,25 px/m; misma saturación; el contorno con la regla de los
personajes; sin sombras dibujadas). `arte/objetos/indice.csv` los lista y `CREDITOS_Y_LICENCIAS.txt` dice de quién es cada uno. Los
objetos que había dibujado Gemini se borraron (estaban a otra escala y no gustaban); de Gemini quedan sólo las piezas de fachada (abajo).

1. `node herramientas/hojas.js` (con el juego servido en el 8010) arma las hojas que lee el juego, `img/objetos/<pack>.png|json`: una por
   pack de `arte/objetos` (según `indice.csv`), con los dibujos tal cual, y `viejos`, lo que queda de la hoja vieja del editor y se
   sigue usando (carteles, piletas, pizarras, el semáforo y las sombras). También `img/objetos/hojas.js`, la lista de hojas que importa
   la escena, y la hoja de fachadas del editor. Después corre el paso 2.
2. `node herramientas/objetos.js` arma `editor/recursos/objetos.js`: los cuadros (nombre, hoja, dónde está, tamaño) y qué objeto del
   juego hace cada uno. El editor sigue pidiendo los objetos por su nombre de siempre (`u_farola`, `pl_malvon`, `yy_avena`…), que ahora es un
   **rol**: cada rol sale de una o más listas con su peso, y el cuadro sale del lugar (no del sorteo), así el resto del barrio no
   cambia. Las medidas (cuánto ocupa, si choca, su sombra) siguen siendo las del rol.
   - **Macetas armadas:** un recipiente (balde, tambor, goma, inodoro) y una planta encima (flores, hojas, huerta, brotes), elegidos
     cada uno por su lado: salen cientos de macetas distintas. La planta va subida hasta la tierra del recipiente (`tierra`, medida a ojo
     en px del dibujo; en `mundo.json`, `o` en px de mundo) y se mece; el recipiente queda quieto. Las macetas de las casas de más plata
     son las que ya traen su planta (y alguna armada); las de lo pobre, baldes, gomas y tambores.
   - **Nombres:** `yy_z_*` yuyos y pasto, `plm_z_*` plantas en la tierra, `plm_t_*` plantas de maceta (las tres se mecen),
     `u_farol_*` faroles, `z_*` lo demás (quieto).
   - **Faroles:** el farol de hierro, apagado de día y con el vidrio prendido mientras su luz está prendida (el juego cambia el cuadro a la
     hora de la luz). `META.lamparas` dice dónde está la lámpara, a qué altura (2,3 m) y cuál es el cuadro prendido.
   - `META.props` le dice al juego, por cada objeto que usa el barrio, su hoja y su cuadro, su ancla, su escala (si no es 1) y si se mece.
   - Lo que era de Gemini y no tiene reemplazo en los packs no se pone: contenedores, kioscos, paradas, motos, bicis, puestos, volquetes,
     mesas, parrillas, el Gauchito, la Virgen (`OBJETOS.quitar`), y tampoco los juegos, bancos, monumentos y glorietas de las plazas ni
     las manchas del piso (no tienen dibujo). La fuente de las plazas y de la rotonda es la de `arte/objetos`.
   - Las casas ya no traen la soga con ropa pintada en las paredes; la ropa colgada son los tendederos de `arte/objetos`, en los patios.
   - Ni balcones que salgan de la pared (dejaban pedazos de pared en medio de la vereda): las ventanas que daban a ellos son ventanas comunes.
   - Son de frente, como la gente: van en cualquier lado y no tienen vista de atrás. El juego los muestra tal cual, a la escala de la
     gente (0,6).
3. **Grafitis en las paredes, casa por casa** (`editor/js/paredes.js`): las casas salen de un catálogo compartido, así que lo que se
   pinta en el diseño se repite en cada casa igual. Los grafitis de `arte/objetos` (9 grandes, en 6 colores cada uno; letras sueltas
   que se juntan en firmas teñidas; 6 carteles que se pegan de a varios) van aparte, como piezas de cada casa (`casas[].g` en
   `mundo.json`), encima de su pared, con la misma escala, skew, luz y orden que ella. Van en una hoja del barrio, `img/grafitis`.
   - Dónde: `caras.js` marca en cada pared que llega al piso (lisa o con dibujo) las celdas de 4 texeles que son pared (del color de la
     pared: sin aberturas, carteles, murales ni pintadas), entre 0,25 y 3,4 m, y sin nada de la casa adelante.
   - Cuántos: más en lo pobre (3 de 4 paredes), en tapiales y paredones (y varios por paredón), menos en lo rico; knob `grafitis`.
   - **Enredaderas en su espaldera** (las plantas con tutor de `arte/objetos`): van igual, casa por casa, paradas en el piso contra la pared y
     quietas; más en las casas de más plata (knob `plantas`). No salen sueltas en la vereda.
   - Sin que se note la repetición: el mismo dibujo no se repite a menos de 45 m, ni el mismo dibujo y color a menos de 160 m; entre los
     que se pueden, el menos usado. Unos más gastados que otros. Las firmas y los grupos de carteles salen distintos cada vez.
   - El visor del editor no los muestra: salen al exportar. Las pintadas con frases (`graffiti.js`) siguen como estaban.

## Piezas de fachada (Gemini)

Ventanas, puertas, rejas, cortinas, carteles, aires acondicionados, murales y los frentes de los locales coreanos: piezas dibujadas por
Gemini, de frente, a 30 px/m, que R3 pega en las caras de las casas (sin suavizar).

- `arte/fachadas/fd_*.png`: las piezas, ya limpias (sin fondo y en la grilla de pixeles de Gemini). `arte/fachadas/gemini/`: las hojas
  originales de Gemini (1376×768, fondo plano) con el JSON que decía qué pieza es cada recorte y cuánto mide, y `camara_juego.png`, la
  vista del juego que se le pasaba de referencia. Estilo: pixel art duro con contorno de color (el más oscuro de cada material, nunca
  negro), sombreado de 3 a 5 tonos que tira a violeta en la sombra y a amarillo en la luz, luz desde arriba a la izquierda.
- `node herramientas/hojas.js` las junta en `editor/recursos/fachada.png|js` (estantes de 1024 px); si la hoja sale igual pixel por
  pixel, no reescribe el PNG.
- Las herramientas que limpiaban y achicaban lo de Gemini (`pixelar.py`, `achicar.py`, `armar_hd.py`, `variantes.py`) se borraron
  con los objetos; si hiciera falta limpiar una pieza nueva, están en la historia de git.

## Rehacer un barrio

`node herramientas/reexportar.js <barrio|carabobo|parquechas>`, con el juego servido en `http://127.0.0.1:8010` (o `--url …`). Lee
la semilla y los knobs del `meta.json` del barrio, abre el editor con ellos en Chromium sin ventana, exporta, descomprime sobre la
carpeta, borra lo que el exportador ya no escribe, corre `barrios.js` y dice qué archivos cambiaron y cuánto tardó (un barrio entero,
menos de 2 minutos). Sale igual byte a byte salvo lo que haya cambiado en el código (`fecha` aparte). `--sal <carpeta>` escribe en
otro lado y no toca el barrio, para ver qué cambiaría. Usa el Playwright de WeedJS si el juego no tiene uno a mano
(`herramientas/playwright.js`; otra carpeta con `WEED_REPO`).

## Límites conocidos

- Nada se pone delante de una puerta o un portón (las puertas salen del dibujo de cada casa). No hay animales.
- Contorno: las casas y los árboles llevan el mismo borde fino, del color de la cosa oscurecido (las caras lisas y los techos de
  material, con una tira de 1 px); los objetos de `arte/objetos`, el que trae el dibujo; los personajes y los autos, el suyo, más marcado. Los
  personajes LPC van un 6 % más angostos.

- El catálogo de casas se reparte entre lotes para entrar en el atlas único de WeedJS. Por eso algunas casas son un poco más angostas que su lote y quedan pasillos laterales.
- Ese atlas (hasta 8192×4096 píxeles, lo arma WeedJS al cargar) lleva casas, gente, árboles, objetos y autos. Con WeedJS ff32c939 o posterior no hay tope de cuadros (antes, con más de 8192, no se dibujaba ningún sprite: N-111). Si un barrio no entra en los píxeles, el juego no carga («Could not fit … into atlas»): bajá la «variedad» de casas.
- Sin giro de cámara, porque los sprites están horneados para una sola vista.
- Manejando, la cámara sigue al auto sin el límite de la cámara libre: muy alejado y en una esquina del paredón se puede llegar a ver el borde del mundo.
- Las texturas float (`rgba32float`) de las capas worldRect no suben bien en WebGL en esta versión de WeedJS: se suben como bytes con tipo FLOAT. Por eso la tabla de calles va en RGBA8 con punto fijo.

## Créditos

- Mapa de Carabobo: © colaboradores de OpenStreetMap (https://www.openstreetmap.org/copyright), licencia ODbL.
- Parque Chas: callejero (red vial), arbolado público lineal y arbolado en espacios verdes del Gobierno de la Ciudad de Buenos Aires
  (https://data.buenosaires.gob.ar), licencia CC BY 2.5 AR.

- Autos: «TopDown Vehicles» v1.17 de MinZiin (https://minzinn.itch.io/), licencia Creative Commons Atribución 4.0.
- Objetos (plantas, macetas, basura, muebles, obra, faroles, grafitis y carteles): 0-mem0ry (https://0-mem0ry.itch.io/), Cainos
  (https://cainos.itch.io/), GandalfHardcore, karsiori (https://karsiori.itch.io/) y LPC Revised (https://github.com/ElizaWy/LPC,
  CC-BY 3.0 / OGA-BY 3.0; sus autores, en `arte/objetos/CREDITS_LPC_*.txt`). Usados con permiso de sus autores; de quién es cada
  uno y qué deja hacer cada licencia, en `arte/objetos/CREDITOS_Y_LICENCIAS.txt`.
