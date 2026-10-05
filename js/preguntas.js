// =========================================================
// preguntas.js - Trivia de arte con la API de Wikipedia en español
// Documentación de la API: https://es.wikipedia.org/api/rest_v1/
// Las listas ARTISTAS y OBRAS están en datos-arte.js
// =========================================================

// ---------- Constantes ----------
// A esta dirección se le agrega el nombre de la página. Por ejemplo:
// https://es.wikipedia.org/api/rest_v1/page/summary/Frida_Kahlo
const URL_API = 'https://es.wikipedia.org/api/rest_v1/page/summary/';
const SEGUNDOS_POR_PREGUNTA = 15;
const VIDAS_INICIALES = 3;
const PUNTOS_ACIERTO = 10;

// ---------- Estado del juego ----------
let preguntas = [];        // array de objetos ya procesados
let actual = 0;            // posición de la pregunta actual
let puntos = 0;
let vidas = VIDAS_INICIALES;
let correctas = 0;
let incorrectas = 0;
let tiempoRestante = SEGUNDOS_POR_PREGUNTA;
let temporizador = null;   // identificador del setInterval
let comodinUsado = false;
let respondida = false;
let botonesOpciones = [];  // botones de las opciones de la pregunta actual

// ---------- Elementos del DOM ----------

// Cada estado de la interfaz es una sección distinta de la página
const secciones = [
  { nombre: 'config', elemento: document.querySelector('#seccion-config') },
  { nombre: 'cargando', elemento: document.querySelector('#seccion-cargando') },
  { nombre: 'error', elemento: document.querySelector('#seccion-error') },
  { nombre: 'juego', elemento: document.querySelector('#seccion-juego') },
  { nombre: 'final', elemento: document.querySelector('#seccion-final') }
];

const formConfig = document.querySelector('#form-config');
const selectModo = document.querySelector('#modo');
const selectCantidad = document.querySelector('#cantidad');
const textoCargando = document.querySelector('#texto-cargando');
const textoError = document.querySelector('#texto-error');

const spanNumero = document.querySelector('#numero-pregunta');
const spanPuntos = document.querySelector('#puntos');
const spanVidas = document.querySelector('#vidas');
const spanTiempo = document.querySelector('#tiempo');
const barraTiempo = document.querySelector('#barra-tiempo');
const divImagen = document.querySelector('#pregunta-imagen');
const chipTipo = document.querySelector('#chip-tipo');
const textoPregunta = document.querySelector('#texto-pregunta');
const textoPista = document.querySelector('#pista');
const divOpciones = document.querySelector('#opciones');
const mensaje = document.querySelector('#mensaje');
const textoDato = document.querySelector('#dato');
const btnComodin = document.querySelector('#btn-comodin');
const btnSiguiente = document.querySelector('#btn-siguiente');

const textoFinal = document.querySelector('#texto-final');
const finalPuntos = document.querySelector('#final-puntos');
const finalCorrectas = document.querySelector('#final-correctas');
const finalIncorrectas = document.querySelector('#final-incorrectas');
const zonaRecord = document.querySelector('#zona-record');

// Muestra una sola sección y oculta las demás (estados de la interfaz)
function mostrarSeccion(nombre) {
  secciones.forEach((seccion) => {
    if (seccion.nombre === nombre) {
      seccion.elemento.classList.remove('oculto');
    } else {
      seccion.elemento.classList.add('oculto');
    }
  });
}

// ---------- Armado de las preguntas ----------

// Arma la lista de posibles preguntas según el tipo elegido.
// Cada elemento indica qué página consultar y cuál es la respuesta correcta.
function armarPozo(modo) {
  const pozo = [];
  if (modo === 'obras' || modo === 'mezcla') {
    for (let i = 0; i < OBRAS.length; i++) {
      pozo.push({ tipo: 'obra', pagina: OBRAS[i].pagina, respuesta: OBRAS[i].artista });
    }
  }
  if (modo === 'artistas' || modo === 'mezcla') {
    for (let i = 0; i < ARTISTAS.length; i++) {
      pozo.push({ tipo: 'artista', pagina: ARTISTAS[i].pagina, respuesta: ARTISTAS[i].nombre });
    }
  }
  mezclar(pozo);
  return pozo;
}

// Devuelve 4 opciones mezcladas: la correcta y 3 artistas elegidos al azar
function crearOpciones(correcta) {
  const otros = [];
  for (let i = 0; i < ARTISTAS.length; i++) {
    if (ARTISTAS[i].nombre !== correcta) {
      otros.push(ARTISTAS[i].nombre);
    }
  }
  mezclar(otros);
  const opciones = otros.slice(0, 3);
  opciones.push(correcta);
  mezclar(opciones);
  return opciones;
}

// ---------- Consulta a la API ----------

// Pide a Wikipedia los datos de una página y arma una pregunta.
// La respuesta de la API es un objeto con, entre otras, estas propiedades:
//   title: título de la página
//   description: descripción corta (por ejemplo "pintora mexicana")
//   extract: resumen del artículo
//   thumbnail.source: dirección de la imagen principal
//   type: 'standard' si es un artículo normal
// Devuelve null si la página no se pudo usar.
async function pedirPregunta(item) {
  const respuesta = await fetch(URL_API + item.pagina);
  if (!respuesta.ok) {
    return null;
  }
  const datos = await respuesta.json();

  // Sin imagen la pregunta no se puede responder, así que la descartamos
  if (datos.type !== 'standard' || !datos.thumbnail) {
    return null;
  }

  // Algunas páginas no tienen descripción corta
  let descripcion = '';
  if (datos.description) {
    descripcion = datos.description;
  }

  const opciones = crearOpciones(item.respuesta);
  let posicionCorrecta = 0;
  for (let i = 0; i < opciones.length; i++) {
    if (opciones[i] === item.respuesta) {
      posicionCorrecta = i;
    }
  }

  return {
    tipo: item.tipo,
    titulo: datos.title,
    descripcion: descripcion,
    imagen: datos.thumbnail.source,
    dato: datos.extract,
    opciones: opciones,
    correcta: posicionCorrecta
  };
}

// Carga una por una las preguntas necesarias.
// Si alguna página falla, se pasa a la siguiente del pozo.
async function cargarPreguntas() {
  mostrarSeccion('cargando');
  const cantidad = Number(selectCantidad.value);
  const pozo = armarPozo(selectModo.value);
  preguntas = [];

  let posicion = 0;
  let errores = 0;
  while (preguntas.length < cantidad && posicion < pozo.length) {
    textoCargando.innerText = `Buscando obras y artistas en Wikipedia... (${preguntas.length} de ${cantidad})`;
    try {
      const pregunta = await pedirPregunta(pozo[posicion]);
      if (pregunta !== null) {
        preguntas.push(pregunta);
      }
    } catch (error) {
      // Error de conexión: no hay internet o la API no responde
      errores++;
      if (errores === 3) {
        break;
      }
    }
    posicion++;
  }

  if (preguntas.length === 0) {
    mostrarError('No se pudo conectar con Wikipedia. Revisá tu conexión a internet y volvé a intentar.');
  } else {
    empezarPartida();
  }
}

function mostrarError(texto) {
  textoError.innerText = texto;
  mostrarSeccion('error');
}

// ---------- Partida ----------

function empezarPartida() {
  actual = 0;
  puntos = 0;
  vidas = VIDAS_INICIALES;
  correctas = 0;
  incorrectas = 0;
  comodinUsado = false;
  mostrarSeccion('juego');
  mostrarPregunta();
}

function actualizarEstado() {
  spanNumero.innerText = `${actual + 1} / ${preguntas.length}`;
  spanPuntos.innerText = puntos;
  let corazones = '';
  for (let i = 0; i < VIDAS_INICIALES; i++) {
    corazones += i < vidas ? '♥\uFE0E' : '♡\uFE0E';
  }
  spanVidas.innerText = corazones;
}

function mostrarPregunta() {
  const pregunta = preguntas[actual];
  respondida = false;

  if (pregunta.tipo === 'obra') {
    chipTipo.innerText = 'Obra';
    textoPregunta.innerText = `¿Quién hizo «${pregunta.titulo}»?`;
    textoPista.innerText = '';
    divImagen.innerHTML = `<img src="${pregunta.imagen}" alt="Obra: ${pregunta.titulo}">`;
  } else {
    chipTipo.innerText = 'Artista';
    textoPregunta.innerText = '¿Quién es este artista?';
    textoPista.innerText = pregunta.descripcion === '' ? '' : `Pista: ${pregunta.descripcion}`;
    divImagen.innerHTML = `<img src="${pregunta.imagen}" alt="Imagen del artista a adivinar">`;
  }

  // Creamos un botón por cada opción y los guardamos en un array
  divOpciones.replaceChildren();
  botonesOpciones = [];
  for (let i = 0; i < pregunta.opciones.length; i++) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.classList.add('opcion');
    boton.innerText = pregunta.opciones[i];
    boton.addEventListener('click', () => {
      responder(i);
    });
    divOpciones.append(boton);
    botonesOpciones.push(boton);
  }

  mensaje.classList.add('oculto');
  textoDato.classList.add('oculto');
  btnSiguiente.classList.add('oculto');
  btnComodin.disabled = comodinUsado;
  actualizarEstado();
  iniciarTemporizador();
}

// ---------- Temporizador ----------

function iniciarTemporizador() {
  tiempoRestante = SEGUNDOS_POR_PREGUNTA;
  dibujarTiempo();
  clearInterval(temporizador);
  temporizador = setInterval(() => {
    tiempoRestante--;
    dibujarTiempo();
    if (tiempoRestante === 0) {
      clearInterval(temporizador);
      tiempoAgotado();
    }
  }, 1000);
}

function dibujarTiempo() {
  spanTiempo.innerText = tiempoRestante;
  barraTiempo.style.width = `${(tiempoRestante / SEGUNDOS_POR_PREGUNTA) * 100}%`;
  if (tiempoRestante <= 5) {
    barraTiempo.classList.add('alerta');
  } else {
    barraTiempo.classList.remove('alerta');
  }
}

function tiempoAgotado() {
  if (respondida) {
    return;
  }
  respondida = true;
  vidas--;
  incorrectas++;
  marcarOpciones(-1);
  mostrarMensaje('¡Se terminó el tiempo! Perdiste una vida.', 'error');
  prepararSiguiente();
}

// ---------- Respuestas ----------

function responder(elegida) {
  if (respondida) {
    return;
  }
  respondida = true;
  clearInterval(temporizador);

  const pregunta = preguntas[actual];
  marcarOpciones(elegida);

  if (elegida === pregunta.correcta) {
    const ganados = PUNTOS_ACIERTO + tiempoRestante;
    puntos += ganados;
    correctas++;
    mostrarMensaje(`¡Correcto! +${ganados} puntos (${PUNTOS_ACIERTO} por acertar y ${tiempoRestante} por el tiempo).`, 'ok');
  } else {
    vidas--;
    incorrectas++;
    mostrarMensaje(`Incorrecto. La respuesta era ${pregunta.opciones[pregunta.correcta]}. Perdiste una vida.`, 'error');
  }
  prepararSiguiente();
}

// Pinta de verde la correcta, de rojo la elegida (si es incorrecta)
// y deshabilita todas las opciones
function marcarOpciones(elegida) {
  const correcta = preguntas[actual].correcta;
  for (let i = 0; i < botonesOpciones.length; i++) {
    botonesOpciones[i].disabled = true;
    if (i === correcta) {
      botonesOpciones[i].classList.add('correcta');
    } else if (i === elegida) {
      botonesOpciones[i].classList.add('incorrecta');
    }
  }
  btnComodin.disabled = true;
}

// Muestra el resumen de Wikipedia como dato curioso y el botón para seguir
function prepararSiguiente() {
  actualizarEstado();
  textoDato.innerText = preguntas[actual].dato;
  textoDato.classList.remove('oculto');
  if (vidas === 0 || actual === preguntas.length - 1) {
    btnSiguiente.innerText = 'Ver resultado';
  } else {
    btnSiguiente.innerText = 'Siguiente pregunta';
  }
  btnSiguiente.classList.remove('oculto');
  btnSiguiente.focus();
}

function mostrarMensaje(texto, tipo) {
  mensaje.innerText = texto;
  mensaje.classList.remove('oculto');
  mensaje.classList.remove('mensaje-ok');
  mensaje.classList.remove('mensaje-error');
  mensaje.classList.add(tipo === 'ok' ? 'mensaje-ok' : 'mensaje-error');
}

// Comodín 50:50: descarta dos opciones incorrectas elegidas al azar
function usarComodin() {
  if (comodinUsado || respondida) {
    return;
  }
  comodinUsado = true;
  btnComodin.disabled = true;

  const correcta = preguntas[actual].correcta;

  // Guardamos las posiciones incorrectas en un array y lo mezclamos
  const posicionesIncorrectas = [];
  for (let i = 0; i < botonesOpciones.length; i++) {
    if (i !== correcta) {
      posicionesIncorrectas.push(i);
    }
  }
  mezclar(posicionesIncorrectas);

  // Las dos primeras posiciones mezcladas se descartan
  for (let k = 0; k < 2; k++) {
    const boton = botonesOpciones[posicionesIncorrectas[k]];
    boton.disabled = true;
    boton.classList.add('descartada');
  }
}

function siguiente() {
  if (vidas === 0 || actual === preguntas.length - 1) {
    terminarPartida();
  } else {
    actual++;
    mostrarPregunta();
  }
}

// ---------- Fin de la partida ----------

function terminarPartida() {
  clearInterval(temporizador);
  contarPartida('preguntas');
  mostrarSeccion('final');

  finalPuntos.innerText = puntos;
  finalCorrectas.innerText = `${correctas} / ${preguntas.length}`;
  finalIncorrectas.innerText = incorrectas;

  textoFinal.classList.remove('mensaje-ok');
  textoFinal.classList.remove('mensaje-error');
  if (vidas === 0) {
    textoFinal.innerText = `Te quedaste sin vidas en la pregunta ${actual + 1} de ${preguntas.length}.`;
    textoFinal.classList.add('mensaje-error');
  } else {
    textoFinal.innerText = `¡Completaste la trivia con ${vidas} ${vidas === 1 ? 'vida' : 'vidas'} de sobra!`;
    textoFinal.classList.add('mensaje-ok');
  }

  zonaRecord.replaceChildren();
  if (puntos > 0) {
    mostrarFormularioRecord(zonaRecord, 'preguntas', puntos, `${correctas} correctas de ${preguntas.length}`, ultimoNombre());
  }
}

// ---------- Eventos ----------

formConfig.addEventListener('submit', (e) => {
  e.preventDefault();
  cargarPreguntas();
});

document.querySelector('#btn-reintentar').addEventListener('click', cargarPreguntas);
document.querySelector('#btn-volver-config').addEventListener('click', () => {
  mostrarSeccion('config');
});
document.querySelector('#btn-jugar-otra').addEventListener('click', () => {
  mostrarSeccion('config');
});
btnComodin.addEventListener('click', usarComodin);
btnSiguiente.addEventListener('click', siguiente);
