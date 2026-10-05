# LukyPlay

Tres juegos originales —cartas, dados y una trivia de arte— hechos con HTML, CSS y JavaScript, sin frameworks ni librerías. Los récords se guardan en el navegador y la trivia arma sus preguntas con la API de Wikipedia.

- **Repositorio:** https://github.com/marcetoledouna-prog/tp1-luckyplay
- **Sitio:** https://marcetoledouna-prog.github.io/tp1-luckyplay/

**Materia:** Informática General 2026 · TN · Trabajo Práctico 1 · UNA Multimedia
**Cátedra:** Valeria Drelichman, Pedro Paleo, Leonardo Nadel, Norma Morales
**Integrantes:** Marcela Toledo · André Palacios · Agustina Pol Diez

## Cómo correrlo

Son archivos estáticos, no hay que instalar nada. Abrí `index.html` o serví la carpeta con cualquier servidor estático (por ejemplo, Live Server). La trivia necesita internet.

## Estructura

```
index.html        Portada y selector de juegos (inicio.js muestra el mejor récord)
cartas.html       Duelo de Palos              → js/cartas.js
dados.html        Blanco                      → js/dados.js
preguntas.html    Trivia de arte              → js/datos-arte.js + js/preguntas.js
puntajes.html     Top 10, estadísticas, borrar → js/puntajes.js
nosotros.html     Equipo, proceso, mapa del sitio y tecnologías
css/estilos.css   Única hoja de estilos
js/comun.js       Compartido: récords, formulario de récord, ventana de reglas, mezclar
js/interaccion.js Decorativo: revelado al hacer scroll y header
img/cartas/       52 cartas + dorso, SVG propios: {palo}-{valor}.svg
img/dados/        dado-1..6.svg y dado-rojo-1..6.svg
```

Los scripts son clásicos, sin módulos, y se cargan al final del `<body>` en este orden: `comun.js` → `interaccion.js` → el script del juego. Comparten el ámbito global, así que **un `const` de primer nivel no puede repetir un nombre de `comun.js`**: si se repite, el juego no carga.

## Los juegos

### Duelo de Palos (cartas): 1 jugador contra la máquina, 8 rondas

Cada uno juega una carta de su mano de 5. Cada carta vale según cómo combina con la carta de mesa: **mismo palo** = doble de su número, **mismo color** = su número, **otro color** = 0, y **espejo** (mismo número que la mesa) suma +10. La carta que más vale se lleva los puntos de las dos. El comodín cambia la mano entera una vez por partida.

- El mazo es un array de 52 objetos `{ valor, numero, palo, color, imagen }` y se mezcla con `mezclar()`.
- La máquina juega siempre la carta que más vale contra la mesa (`elegirCartaMaquina()`).
- `setTimeout` da vuelta la carta de la máquina a los 900 ms. El flag `jugando` evita jugar dos cartas a la vez.

### Blanco (dados): 2 jugadores, 10 rondas, 3 vidas

La máquina tira 3 dados rojos y su suma es el objetivo. Cada jugador tira 3 dados blancos hasta 3 veces, puede guardar dados entre tiros y se planta cuando quiere.

| Diferencia con el objetivo | 0 | 1 | 2 | 3 | 4 o más |
| --- | --- | --- | --- | --- | --- |
| Puntos | 20 | 12 | 6 | 2 | 0 y −1 vida |

Bonus: trío +10 y escalerita +5. Cada tiro extra cuesta 2 puntos.

- Los jugadores son objetos `{ nombre, puntos, vidas }`. Se valida que los nombres no estén vacíos ni repetidos.
- Los dados son arrays paralelos: `dados`, `retenidos` y `botonesDados`. La animación usa `setInterval` + `clearInterval`.
- `proximoJugadorConVidas()` saltea a los eliminados. Se guarda el récord del ganador.

### Trivia de arte: 1 jugador, 5/10/15 preguntas, 15 s cada una, 3 vidas

Hay que reconocer quién hizo una obra o quién es un artista, entre 4 opciones. Una respuesta correcta vale **10 + los segundos que sobraron**. Una incorrecta o el tiempo agotado cuestan una vida. El comodín 50:50 elimina dos opciones incorrectas.

- `datos-arte.js` tiene 45 artistas y 26 obras con su página de Wikipedia. Las respuestas correctas son datos propios, y la API aporta imagen, pista y dato curioso.
- La interfaz tiene 5 estados (`config`, `cargando`, `error`, `juego`, `final`) y `mostrarSeccion()` muestra uno solo.

## API: Wikipedia en español

`GET https://es.wikipedia.org/api/rest_v1/page/summary/{página}`. Es pública, sin clave y con CORS ([ejemplo](https://es.wikipedia.org/api/rest_v1/page/summary/Frida_Kahlo)).

| Campo | Uso |
| --- | --- |
| `thumbnail.source` | Imagen de la pregunta (sin imagen, se descarta) |
| `title` | Nombre de la obra |
| `description` | Pista en las preguntas de artista |
| `extract` | Dato curioso después de responder |
| `type` | Si no es `"standard"`, se descarta |

`cargarPreguntas()` pide las páginas **una por una** con `fetch` + `await` hasta juntar la cantidad elegida, salteando las que no sirven. Los errores de red se atrapan con `try/catch`: a los 3 errores se corta la carga y se muestra la pantalla con **Reintentar**. Todo se carga antes de empezar, así el timer no corre mientras se espera la red.

## Récords: `localStorage` + JSON

| Clave | Contenido |
| --- | --- |
| `lukyplay-records-{cartas,dados,preguntas}` | Array JSON con el top 10: `{ nombre, puntaje, detalle }` |
| `lukyplay-partidas-{juego}` | Partidas jugadas |
| `lukyplay-nombre` | Último nombre usado |

`guardarRecord()` inserta el récord ordenado con `splice` y recorta la lista a 10. `puntajes.js` arma las tablas con `createElement` y muestra los nombres con `innerText`, para que no se interprete HTML.

## Timers

- **Trivia:** 15 s por pregunta (`setInterval` cada 1 s). Al llegar a 0 se pierde una vida, y lo que sobra suma puntos. Siempre se hace `clearInterval` antes de iniciar otro, y el flag `respondida` evita contar dos veces la misma pregunta.
- **Dados:** animación de la tirada. **Cartas:** pausa antes de dar vuelta la carta de la máquina.

## CSS y diseño

- **Organización:** una sola hoja, `estilos.css`, en secciones numeradas con índice al principio. Colores, tipografías, espacios y tamaños de cartas y dados son variables en `:root`.
- **Paleta:** blanco y negro. El color solo comunica algo: verde para acierto y rojo para error o vidas.
- **Páginas de juego:** cabecera compacta, tablero visible sin scroll en una notebook de 1280×800, y reglas en un `<dialog>` que abre el botón "Cómo se juega".
- **Selector de juegos de la portada:** al pasar el mouse (o con foco de teclado), la tarjeta elegida se ilumina y las otras se apagan. El botón "Cómo funciona" de la portada abre la misma ventana que usan los juegos.
- **Responsive y accesibilidad:** Flexbox y Grid, media queries por ancho y por alto, y estados `:hover`, `:focus-visible` y `:disabled`. Se respeta `prefers-reduced-motion`.

## Tecnologías

HTML5 semántico · CSS3 (variables, Flexbox, Grid) · JavaScript (`fetch`, `async/await`, `localStorage`, JSON, `IntersectionObserver`, `<dialog>`) · API de Wikipedia · Google Fonts (Geist) · Git, GitHub y GitHub Pages.

## Decisiones técnicas

- **JavaScript sin frameworks,** para trabajar el DOM y los eventos directamente y poder explicar cada línea.
- **Un script por juego + `comun.js`** para lo que usan los tres.
- **Mismo orden en cada script:** constantes → estado (`let`) → elementos del DOM → funciones de dibujo → funciones de juego → eventos. La pantalla se vuelve a dibujar desde el estado después de cada acción.
- **Clases en lugar de estilos en línea** (`.oculto`, `.retenido`, `.correcta`…): JS decide el estado y CSS cómo se ve.
- **Flags** (`jugando`, `girando`, `respondida`) para bloquear acciones fuera de lugar.
- **Respuestas propias + datos de la API:** la trivia no depende de interpretar texto libre de Wikipedia.
- **SVG propios con nombres predecibles,** así la ruta de cada imagen se arma desde los datos.

## Limitaciones conocidas

- Los récords son por navegador.
- `validarNombre()` acepta un nombre formado solo por espacios.
- Si un artículo de Wikipedia pierde su imagen, esa pregunta se descarta.

## Declaración de uso de IA

> ✏️ **Completar por el grupo:** herramientas, etapas, ejemplos y qué se aceptó, modificó o descartó.

| Etapa | Uso de la IA | Decisión del grupo |
| --- | --- | --- |
| _Planificación de los juegos_ | _Completar_ | _Completar_ |
| _Programación de los juegos_ | _Completar_ | _Completar_ |
| Rediseño final (Claude Code) | Paleta en blanco y negro, mapa del sitio y tabla de récords minimalistas, selector de juegos con hover | _Completar_ |
| Errores y UX (Claude Code) | Arregló la lista de reglas que partía el texto en negrita, integró `puntajes.html` desde el remoto y reacomodó los juegos para jugar sin scroll con las reglas en `<dialog>` | _Completar_ |
| Documentación (Claude Code) | Comparó el sitio con la consigna y redactó un borrador de este README | _Completar_ |
