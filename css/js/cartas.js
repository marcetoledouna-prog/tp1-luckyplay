// =========================================================
// cartas.js - "Duelo de Palos": juego de cartas inventado
// El jugador y la máquina juegan una carta por ronda y gana
// la que mejor combine con la carta de mesa.
// =========================================================

// ---------- Constantes del juego ----------
const PALOS = ['corazones', 'diamantes', 'treboles', 'picas'];
const VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARTAS_EN_MANO = 5;
const TOTAL_RONDAS = 8;
const BONUS_ESPEJO = 10;

// ---------- Estado del juego ----------
let mazo = [];
let manoJugador = [];
let manoMaquina = [];
let cartaMesa = null;
let ronda = 1;
let puntosJugador = 0;
let puntosMaquina = 0;
let comodinUsado = false;
let jugando = false; // true mientras se resuelve una ronda (no se puede tocar otra carta)

// ---------- Elementos del DOM ----------
const spanRonda = document.querySelector('#ronda');
const spanPuntosJugador = document.querySelector('#puntos-jugador');
const spanPuntosMaquina = document.querySelector('#puntos-maquina');
const spanMazo = document.querySelector('#mazo-restante');
const mensaje = document.querySelector('#mensaje');
const divCartaMesa = document.querySelector('#carta-mesa');
const divJugadaJugador = document.querySelector('#jugada-jugador');
const divJugadaMaquina = document.querySelector('#jugada-maquina');
const divManoJugador = document.querySelector('#mano-jugador');
const divManoMaquina = document.querySelector('#mano-maquina');
const zonaFinal = document.querySelector('#zona-final');
const btnCambiar = document.querySelector('#btn-cambiar');
const btnSiguiente = document.querySelector('#btn-siguiente');
const btnNueva = document.querySelector('#btn-nueva');

// ---------- Mazo ----------

// Crea las 52 cartas como objetos y las guarda en un array.
// numero: As = 1 ... K = 13 (es la posición en VALORES + 1)
function crearMazo() {
  const nuevoMazo = [];
  for (let p = 0; p < PALOS.length; p++) {
    let color = 'negro';
    if (PALOS[p] === 'corazones' || PALOS[p] === 'diamantes') {
      color = 'rojo';
    }
    for (let v = 0; v < VALORES.length; v++) {
      nuevoMazo.push({
        valor: VALORES[v],
        numero: v + 1,
        palo: PALOS[p],
        color: color,
        imagen: `img/cartas/${PALOS[p]}-${VALORES[v]}.svg`
      });
    }
  }
  return nuevoMazo;
}

// La función mezclar() está en comun.js porque también la usa la Trivia

// Saca la última carta del mazo
function sacarCarta() {
  const carta = mazo.pop();
  spanMazo.innerText = mazo.length;
  return carta;
}

// Completa una mano hasta tener 5 cartas (si quedan en el mazo)
function completarMano(mano) {
  while (mano.length < CARTAS_EN_MANO && mazo.length > 0) {
    mano.push(sacarCarta());
  }
}

// ---------- Puntos ----------

// Calcula cuánto vale una carta comparada con la carta de mesa
function puntosCarta(carta) {
  let puntos = 0;
  if (carta.palo === cartaMesa.palo) {
    puntos = carta.numero * 2;        // mismo palo: el doble
  } else if (carta.color === cartaMesa.color) {
    puntos = carta.numero;            // mismo color: su número
  }
  if (carta.numero === cartaMesa.numero) {
    puntos += BONUS_ESPEJO;           // espejo: mismo número
  }
  return puntos;
}

// La máquina elige la carta de su mano que más puntos vale
// (patrón de búsqueda del máximo)
function elegirCartaMaquina() {
  let mejorPosicion = 0;
  let mejorPuntos = puntosCarta(manoMaquina[0]);
  for (let i = 1; i < manoMaquina.length; i++) {
    const puntos = puntosCarta(manoMaquina[i]);
    if (puntos > mejorPuntos) {
      mejorPuntos = puntos;
      mejorPosicion = i;
    }
  }
  return mejorPosicion;
}

// ---------- Interfaz ----------

// Devuelve el código HTML de la imagen de una carta
function imagenCarta(carta) {
  return `<img src="${carta.imagen}" alt="${carta.valor} de ${carta.palo}">`;
}

function actualizarEstado() {
  spanRonda.innerText = `${ronda} / ${TOTAL_RONDAS}`;
  spanPuntosJugador.innerText = puntosJugador;
  spanPuntosMaquina.innerText = puntosMaquina;
  spanMazo.innerText = mazo.length;
}

function mostrarMensaje(texto, tipo) {
  mensaje.innerText = texto;
  mensaje.classList.remove('mensaje-ok');
  mensaje.classList.remove('mensaje-error');
  if (tipo === 'ok') {
    mensaje.classList.add('mensaje-ok');
  } else if (tipo === 'error') {
    mensaje.classList.add('mensaje-error');
  }
}

// Muestra una carta (o el dorso) dentro de un contenedor
function dibujarCarta(contenedor, carta, bocaAbajo) {
  const divCarta = document.createElement('div');
  divCarta.classList.add('carta');
  if (bocaAbajo) {
    divCarta.innerHTML = '<img src="img/cartas/dorso.svg" alt="Carta boca abajo">';
  } else {
    divCarta.innerHTML = imagenCarta(carta);
  }
  contenedor.append(divCarta);
  return divCarta;
}

// Dibuja la mano del jugador: cada carta es un botón que se puede tocar
function dibujarManoJugador() {
  divManoJugador.replaceChildren();
  for (let i = 0; i < manoJugador.length; i++) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.classList.add('carta-boton');
    boton.innerHTML = imagenCarta(manoJugador[i]);
    boton.disabled = jugando;
    boton.addEventListener('click', () => {
      jugarCarta(i);
    });
    divManoJugador.append(boton);
  }
}

// La mano de la máquina se muestra boca abajo
function dibujarManoMaquina() {
  divManoMaquina.replaceChildren();
  for (let i = 0; i < manoMaquina.length; i++) {
    dibujarCarta(divManoMaquina, null, true);
  }
}

// ---------- Desarrollo de la partida ----------

function nuevaRonda() {
  jugando = false;
  cartaMesa = sacarCarta();

  divCartaMesa.replaceChildren();
  divJugadaJugador.replaceChildren();
  divJugadaMaquina.replaceChildren();
  dibujarCarta(divCartaMesa, cartaMesa, false);
  dibujarManoJugador();
  dibujarManoMaquina();

  btnSiguiente.classList.add('oculto');
  btnCambiar.disabled = comodinUsado;
  actualizarEstado();
  mostrarMensaje(`Ronda ${ronda}: la carta de mesa es ${cartaMesa.valor} de ${cartaMesa.palo}. Tocá una carta de tu mano para jugarla.`);
}

function jugarCarta(posicion) {
  if (jugando) {
    return;
  }
  jugando = true;
  btnCambiar.disabled = true;

  // splice saca la carta de la mano y la devuelve dentro de un array
  const cartaJugador = manoJugador.splice(posicion, 1)[0];
  const cartaMaquina = manoMaquina.splice(elegirCartaMaquina(), 1)[0];

  dibujarCarta(divJugadaJugador, cartaJugador, false);
  const cartaOculta = dibujarCarta(divJugadaMaquina, cartaMaquina, true);
  dibujarManoJugador();
  dibujarManoMaquina();
  mostrarMensaje('La máquina está eligiendo su carta...');

  // Después de un momento se da vuelta la carta de la máquina
  setTimeout(() => {
    cartaOculta.innerHTML = imagenCarta(cartaMaquina);
    resolverRonda(cartaJugador, cartaMaquina);
  }, 900);
}

function resolverRonda(cartaJugador, cartaMaquina) {
  const pj = puntosCarta(cartaJugador);
  const pm = puntosCarta(cartaMaquina);
  const detalle = `Tu carta vale ${pj} y la de la máquina ${pm}.`;

  if (pj > pm) {
    puntosJugador += pj + pm;
    mostrarMensaje(`${detalle} ¡Ganaste la ronda y te llevás ${pj + pm} puntos!`, 'ok');
  } else if (pm > pj) {
    puntosMaquina += pj + pm;
    mostrarMensaje(`${detalle} La máquina gana la ronda y se lleva ${pj + pm} puntos.`, 'error');
  } else {
    puntosJugador += pj;
    puntosMaquina += pm;
    mostrarMensaje(`${detalle} Empate: cada uno suma sus puntos.`);
  }

  // Cada uno levanta una carta nueva
  completarMano(manoJugador);
  completarMano(manoMaquina);
  dibujarManoJugador();
  dibujarManoMaquina();
  actualizarEstado();

  if (ronda === TOTAL_RONDAS) {
    terminarPartida();
  } else {
    btnSiguiente.classList.remove('oculto');
    btnSiguiente.focus();
  }
}

function siguienteRonda() {
  ronda++;
  nuevaRonda();
}

// Comodín: cambia toda la mano por 5 cartas nuevas (una vez por partida)
function cambiarMano() {
  if (comodinUsado || jugando) {
    return;
  }
  comodinUsado = true;
  btnCambiar.disabled = true;
  manoJugador = [];
  completarMano(manoJugador);
  dibujarManoJugador();
  actualizarEstado();
  mostrarMensaje('Cambiaste tu mano. Ya no podés volver a usar el comodín.');
}

// ---------- Fin de partida ----------

function terminarPartida() {
  btnCambiar.disabled = true;
  btnSiguiente.classList.add('oculto');
  btnNueva.classList.remove('oculto');
  contarPartida('cartas');

  const resumen = document.createElement('p');
  resumen.classList.add('mensaje');
  let resultado;
  if (puntosJugador > puntosMaquina) {
    resultado = 'le ganó a la máquina';
    resumen.classList.add('mensaje-ok');
    resumen.innerText = `¡Ganaste el duelo! ${puntosJugador} a ${puntosMaquina}.`;
  } else if (puntosJugador < puntosMaquina) {
    resultado = 'perdió con la máquina';
    resumen.classList.add('mensaje-error');
    resumen.innerText = `La máquina ganó el duelo: ${puntosMaquina} a ${puntosJugador}.`;
  } else {
    resultado = 'empate';
    resumen.innerText = `¡Empate! Los dos terminaron con ${puntosJugador} puntos.`;
  }
  zonaFinal.append(resumen);

  if (puntosJugador > 0) {
    mostrarFormularioRecord(zonaFinal, 'cartas', puntosJugador, resultado, ultimoNombre());
  }
}

function nuevaPartida() {
  mazo = crearMazo();
  mezclar(mazo);
  manoJugador = [];
  manoMaquina = [];
  completarMano(manoJugador);
  completarMano(manoMaquina);
  ronda = 1;
  puntosJugador = 0;
  puntosMaquina = 0;
  comodinUsado = false;

  zonaFinal.replaceChildren();
  btnNueva.classList.add('oculto');
  nuevaRonda();
}

// ---------- Eventos ----------

btnCambiar.addEventListener('click', cambiarMano);
btnSiguiente.addEventListener('click', siguienteRonda);
btnNueva.addEventListener('click', nuevaPartida);

// Al cargar la página se prepara la primera partida
nuevaPartida();
