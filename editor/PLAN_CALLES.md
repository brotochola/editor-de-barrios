# Plan: dibujar calles en el editor, y que las manzanas salgan solas

Pedido del dueño (12/11): que el editor permita dibujar calles y que las manzanas se generen solas. Está en el
`BACKLOG.md` («Editor») y va con «Este repo pasa a ser el editor de barrios».

**La idea:** un barrio pasa a ser un grafo de esquinas y cuadras que se dibuja en el editor. De ahí salen los `segs` de
siempre, y el generador de hoy (`World.generate`) arma lotes, casas y manzanas sin cambios.

## Cómo está hoy

El camino de un barrio real:

1. `herramientas/gcba_osm.py`: datos abiertos de la Ciudad (callejero, censo de arbolado) → `editor/recursos/osm_<barrio>.json`.
2. `herramientas/osm_real.py --barrio <barrio>`: gira y recorta la ventana, clasifica las calles y las encaja en los 48
   rumbos de los autos (mínimos cuadrados con scipy, función `encajar`) → `editor/recursos/real_<barrio>.js`
   (`window.REALES.<barrio>`).
3. El editor (`World.generate` en `editor/js/world.js`, rama del barrio real): `real()` pasa los `segs` a la red; `addSeg`
   les pone ancho, vereda y material; `classify` dice si un punto es calzada, vereda o nada. Los lotes se ponen recorriendo
   los dos lados de cada calle, con el fondo hasta la mitad de la manzana (un rayo hasta la calle de enfrente), y las
   ochavas, en los cruces casi en escuadra.
4. 📦 Exportar, o `herramientas/reexportar.js <barrio>` → `<barrio>/` (`mundo.json`, `piso.bin`, `ff_*.bin`, `transito.bin`,
   `meta.json`); `herramientas/barrios.js` → `barrios.js`, que la escena lee para elegir con `?barrio=`.

`real_parquechas.js` trae `segs` (tramos rectos: `[ax, ay, bx, by, tipo, nombre, medio ancho, medio cantero, banderas]`, en
metros), `parques`, `rotondas`, `esquinas`, `arboles`, `pois` y `estilo`. **Las manzanas no se guardan en ningún lado:**
salen de las calles. El paso de «veredas parejas» las encuentra al final, como partes conexas de lo que no es calzada ni
vereda en una grilla de 1 m, y sólo las usa para que cada manzana tenga un solo tipo de vereda.

Medido el 12/11:

| Barrio | Tramos | Esquinas | Largo de tramo (mín / p10 / mediana / p90 / máx) | Puntas en T a mitad de otro tramo |
|---|---|---|---|---|
| Parque Chas | 370 | 259 | 5,1 / 23,0 / 59,1 / 123,3 / 176,5 m | 0 |
| Carabobo | 1140 | 1057 | 1,5 / 4,6 / 13,8 / 50,8 / 231,9 m | 3 |

En Parque Chas cada tramo ya es una cuadra entre dos esquinas: pasarlo a grafo no parte nada.

Lo que ya existe y se reusa:

- `World.ANG`, `angIdx`, `snapAng`: los 48 rumbos.
- `limpiarRed` (`world.js`): de tramos sueltos a grafo plano. Pega a una calle las puntas que caen a menos de 2,5 m de ella,
  corta en cada cruce y junta las esquinas a menos de 1,5 m. Después aplica las reglas de Buenos Aires (esquinas de 3 o 4
  calles, ángulos de al menos 35°, nada de dos esquinas a menos de 14 m, nada de callejones sin salida), que con calles
  dibujadas a mano no siempre van (ver «A charlar»).
- `segInter`, `inside`, `polyArea`, `centroid`, `clipSeg`.
- La rama del barrio real de `World.generate`: `parques`, `villas` y `complejos` como polígonos, `rotondas`, `esquinas`.
- El inspector (`inspectAt`, `hover` en `main.js`): ya pasa de pantalla a mundo con la cámara girada.

Lo que hoy está fijo para dos barrios: la lista `["", "carabobo", "parquechas"]` en `World.generate`, la perilla `real`
(de 0 a 2) en `config.js`, las carpetas de `herramientas/barrios.js` y los nombres que acepta `herramientas/reexportar.js`.

## Formato: el barrio como grafo

Un archivo por barrio, `editor/recursos/barrio_<carpeta>.json`:

```json
{
  "nombre": "Parque Chas", "carpeta": "parquechas",
  "PW": 950, "PH": 870, "MG": 40, "inicio": [793, 347], "estilo": {},
  "nombres": ["Altolaguirre", "Andonaegui"],
  "nodos": [[1070.0, 306.7], [1059.1, 308.4]],
  "calles": [[0, 1, 1, 7, 4.6, 0, 2]],
  "manzanas": [{ "x": 720, "y": 530, "uso": "plaza" }],
  "parques": [], "villas": [], "complejos": [], "rotondas": [], "esquinas": [], "pois": [],
  "especies": [], "arboles": []
}
```

- `nodos`: las esquinas (y las puntas que salen del mapa), en metros del mundo del editor.
- `calles`: una por cuadra, `[esquina a, esquina b, tipo, nombre, medio ancho, medio cantero, banderas]`. Es un tramo de
  `segs` con los dos puntos cambiados por esquinas: mover una esquina mueve todas sus cuadras.
- `manzanas`: lo que es cada manzana (`plaza`, `villa`, `complejo`, `riqueza`…), con **un punto adentro**. El punto
  sobrevive a que se editen las calles de alrededor; un número de cara no.
- Lo demás, igual que en `real_<barrio>.js`.

Al generar, `calles` se pasa a `segs` **en el mismo orden**, una cuadra por tramo. Esto importa: el generador saca sus
sorteos en el orden de los tramos, y cambiar el orden cambia todas las casas.

Guardar: con la File System Access API (Chrome y Edge), el editor escribe el archivo en su lugar; si no la hay, lo descarga.

## Etapas

Cada etapa se cierra con su prueba antes de pasar a la siguiente.

### 0. Medir y abrir la lista de barrios

- Medir cuánto tarda `build()` (en `main.js`) con Parque Chas y con Carabobo. Eso dice si alcanza con regenerar todo al
  soltar el mouse o si la vista rápida (etapa 2) tiene que estar desde el principio.
- Sacar las listas fijas: los barrios salen de lo que está cargado (`REALES` y los `barrio_*.json`). La perilla `real` sigue
  siendo un número (1 Carabobo, 2 Parque Chas, los nuevos después), así los `meta.json` de hoy siguen valiendo.
  `herramientas/barrios.js` y `herramientas/reexportar.js` leen las carpetas que haya.
- **Hecho cuando** `reexportar.js parquechas --sal …` y `reexportar.js carabobo --sal …` dan los mismos archivos antes y
  después del cambio (la comparación que `reexportar.js` ya hace, sin la fecha de `meta`).

### 1. Los barrios reales como grafo

- `herramientas/a_grafo.js` (Node, sin dependencias): de `real_<barrio>.js` a `barrio_<barrio>.json`. Junta las puntas de
  los tramos que caen en el mismo punto (a 0,1 m, como redondea `osm_real.py`). Las 3 puntas en T de Carabobo quedan como
  esquinas sueltas sobre la cuadra, igual que hoy.
- El editor carga `barrio_*.json` y genera desde ahí: `real()` arma la red con `nodos` y `calles`.
- **Hecho cuando** Parque Chas y Carabobo, cargados desde el grafo, exportan lo mismo que desde `real_*.js`, archivo por
  archivo. Desde ahí el grafo es la fuente de verdad, y `real_*.js` queda sólo como salida de `osm_real.py`.

### 2. La herramienta «Calles»

- Un modo nuevo en la barra del editor. Click: una esquina nueva, o la que está cerca (imán de unos 12 px de pantalla).
  Siguiente click: la cuadra. Arrastrar una esquina la mueve; Suprimir borra; Ctrl+Z y Ctrl+Y.
- **Imán a los 48 rumbos mientras se dibuja:** la cuadra sale en el rumbo más cercano (`snapAng`) y la esquina nueva cae
  sobre esa recta, como el modo orto de un programa de CAD. Una tecla suelta el imán, y esa cuadra queda marcada como torcida.
- Si una cuadra cruza otra calle, se parte y aparece la esquina (`segInter`). Una punta que cae a menos de 2,5 m de una calle
  se pega a ella (el primer paso de `limpiarRed`).
- Panel de la cuadra elegida: tipo (avenida, calle, pasaje, pasillo), nombre (de la lista o nuevo: «calles parejas» agrupa
  por nombre), ancho, cantero central, tierra, bulevar. Elegir un nombre selecciona la calle entera.
- Vista rápida, sin casas: esquinas, ejes, calzada y vereda con su ancho de verdad, y las cuadras torcidas en rojo. Se
  redibuja sola; el barrio entero se regenera con el botón «Generar» (o al soltar, si la etapa 0 dice que alcanza).
- Barrio nuevo: tamaño (`PW`, `PH`), estilo de base (copiado del de Parque Chas o del de Carabobo) y dónde arranca el juego
  (`inicio`).
- **Hecho cuando** se dibuja un barrio de cero (un par de cuadrículas giradas y una diagonal), se guarda, se vuelve a abrir
  igual, se exporta y el juego lo carga con `?barrio=`.

### 3. Encaje a los 48 rumbos al cerrar vueltas

Con el imán, una vuelta de manzana no cierra justo: la última cuadra llega torcida. Se pasa `encajar` de `osm_real.py` a
JS, con los mismos pesos: cada cuadra en su rumbo (fuerte, 6), su largo a lo largo del rumbo (suave, 0,6) y cada esquina
cerca de donde estaba (suave, 0,25). Se resuelve con gradientes conjugados sobre las ecuaciones normales: son unos cientos
de esquinas, milisegundos y sin scipy. Corre sólo sobre las esquinas tocadas y sus vecinas, así retocar una esquina no
mueve el resto del barrio.

- De paso, `osm_real.py` podría usar el mismo encaje (en esta máquina no hay Python), pero eso no entra en esta etapa.
- **Hecho cuando** un barrio dibujado a mano queda sin cuadras torcidas (más de 2,5° fuera de su rumbo, el umbral de
  `osm_real.py`) y ninguna esquina se mueve más de 1 m de donde se puso.

### 4. Manzanas como polígonos

- Las caras del grafo plano: en cada esquina se ordenan sus cuadras por ángulo, y doblando siempre a la izquierda se recorre
  cada manzana. La cara de afuera (la de área negativa) se descarta.
- El contorno de la manzana (la línea municipal): la cara corrida hacia adentro el medio ancho más la vereda de cada cuadra,
  lado por lado, cortando cada lado con el siguiente.
- La vista rápida muestra las manzanas. Click en una: qué es (plaza, villa, complejo, baldío entero, más o menos rica). La
  etiqueta se guarda como un punto (`manzanas`) y al generar va a las listas que ya existen: plaza → `parques` (con senderos
  en cruz, como las plazas sin senderos de OSM), villa → `villas`, complejo → `complejos`; la riqueza, a `wealthAt` dentro
  de `real()`.
- El generador de lotes no cambia en esta etapa: sigue con el rayo hasta la calle de enfrente.
- **Hecho cuando** en Parque Chas las manzanas del grafo coinciden con las del paso de «veredas parejas» (la misma cantidad,
  cada una adentro de la suya), y marcar una manzana como plaza la convierte en plaza al generar.

### 5. Curvas y rotondas

- Curva: se dibuja con tres puntos (o arrastrando el medio de una cuadra) y se parte en cuadras rectas con rumbos de a 7,5°,
  de 20 m como mínimo. En Parque Chas el p10 del largo es 23 m; `addSeg` tira los tramos de menos de 3 m, y en los cortos
  casi no entran lotes.
- Rotonda: en una esquina, con el radio de la isla y el de la calzada (`rotondas`), como la fuente de Parque Chas.
- **Hecho cuando** se dibuja un anillo como los de Parque Chas y una rotonda, y sus lotes y casas salen como en el barrio real.

### 6. Después (charlar antes)

- Lotes desde el polígono de la manzana, en vez del rayo: fondos más parejos, y las manzanas raras (triangulares, en curva)
  mejor llenas.
- Regenerar sólo la zona tocada, en vez de todo el barrio.

## Cuidados

- **El orden de los sorteos.** Todo lo que cambie el orden de los tramos o agregue un sorteo cambia el barrio entero. Por eso
  las etapas 0 y 1 se prueban archivo por archivo.
- **Rumbos y atlas.** Las casas se hornean por diseño y rumbo: cuantos más rumbos distintos use un barrio, más claves tiene el
  catálogo y más grande sale el atlas de caras. Medirlo en el primer barrio dibujado.
- **Esquinas.** Las ochavas van sólo en cruces casi en escuadra (de 78° a 102°); de 25° a 78° y de 102° a 155°, las casas de
  esquina con forma (`Houses.chas`). En un cruce más cerrado no entra ninguna de las dos: avisarlo en la vista rápida.
- **Bordes.** Las calles que salen del mapa siguen hasta el margen (`MG`, la ciudad del otro lado del paredón).
- **El juego no se entera.** El editor exporta el mismo formato; la escena ya elige cualquier barrio que esté en `barrios.js`.

## A charlar

- ¿Barrios de cero, retocar Parque Chas y Carabobo, o las dos cosas? El plan sirve para las dos; la etapa 1 es la que permite
  retocar los reales.
- Las reglas de Buenos Aires de `limpiarRed`, con calles dibujadas a mano: ¿se aplican, se avisan o se respeta lo dibujado?
  El plan propone avisar y no borrar nada.
- ¿Riqueza por manzana (pintada a mano) o la de siempre, del ruido y del estilo del barrio?
- ¿Guardar en el lugar (File System Access, sólo Chrome y Edge) o descargar el archivo?
