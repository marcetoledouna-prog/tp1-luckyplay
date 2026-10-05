// =========================================================
// dados.js - "Blanco": juego de dados inventado, para 2 jugadores
// La máquina tira 3 dados rojos (objetivo) y cada jugador, en su
// turno, intenta igualar esa suma con sus 3 dados blancos.
// =========================================================

// ---------- Constantes del juego ----------
const CANTIDAD_DADOS = 3;
const TIROS_POR_TURNO = 3;
const TOTAL_RONDAS = 10;
const VIDAS_INICIALES = 3;
const COSTO_TIRO_EXTRA = 2;
const BONUS_TRIO = 10;
const BONUS_ESCALERITA = 5;

// ---------- Estado del juego ----------
let jugadores = [];      // array de objetos { nombre, puntos, vidas }
let turno = 0;           // posición del jugador que está jugando
let dadosObjetivo = [1, 1, 1];
let dados = [1, 1, 1];
let retenidos = [false, false, false];
let objetivo = 0;
let tiro = 0;
let ronda = 1;
let girando = false;        // true mientras dura una animación de tirada
let turnoTerminado = false; // true cuando el jugador ya se plantó
let botonesDados = [];      // los botones de los dados del jugador

// ---------- Elementos del DOM ----------
const seccionConfig = document.querySelector('#seccion-config');
const seccionJuego = document.querySelector('#seccion-juego');
const formConfig = document.querySelector('#form-config');
const inputNombre1 = document.querySelector('#nombre-1');
const inputNombre2 = document.querySelector('#nombre-2');
const errorConfig = document.querySelector('#error-config');

const spanRonda = document.querySelector('#ronda');
const spanTurno = document.querySelector('#turno-de');
const spanTiro = document.querySelector('#tiro');
const divMarcador = document.querySelector('#marcador');
const spanObjetivo = document.querySelector('#objetivo');
const spanSuma = document.querySelector('#suma');
const mensaje = document.querySelector('#mensaje');
const divObjetivo = document.querySelector('#dados-objetivo');
const zonaDados = document.querySelector('#zona-dados');
const btnTirar = document.querySelector('#btn-tirar');
const btnPlantarse = document.querySelector('#btn-plantarse');
const btnSiguiente = document.querySelector('#btn-siguiente');
const btnNueva = document.querySelector('#btn-nueva');
const zonaFinal = document.querySelector('#zona-final');

// ---------- Configuración de los jugadores ----------

inputNombre1.value = ultimoNombre();

formConfig.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre1 = inputNombre1.value;
  const nombre2 = inputNombre2.value;

  // Validaciones de los nombres
  if (nombre1 === '' || nombre2 === '') {
    errorConfig.innerText = 'Escribí el nombre de los dos jugadores.';
    return;
  }
  if (nombre1 === nombre2) {
    errorConfig.innerText = 'Los dos jugadores tienen que tener nombres distintos.';
    return;
  }
  errorConfig.innerText = '';

  jugadores = [
    { nombre: nombre1, puntos: 0, vidas: VIDAS_INICIALES },
    { nombre: nombre2, puntos: 0, vidas: VIDAS_INICIALES }
  ];
  empezarPartida();
});

// ---------- Utilidades ----------

function numeroAlAzar() {
  return Math.floor(Math.random() * 6) + 1;
}

// Suma los valores de un array de dados (acumulador)
function sumar(valores) {
  let total = 0;
  for (let i = 0; i < valores.length; i++) {
    total += valores[i];
  }
  return total;
}

// Devuelve la posición del próximo jugador con vidas a partir de "desde",
// o -1 si no queda ninguno en esta ronda
function proximoJugadorConVidas(desde) {
  for (let j = desde; j < jugadores.length; j++) {
    if (jugadores[j].vidas > 0) {
      return j;
    }
  }
  return -1;
}

// ---------- Dibujo ----------

// Muestra los dados rojos de la máquina
function dibujarObjetivo() {
  let html = '';
  for (let i = 0; i < CANTIDAD_DADOS; i++) {
    html += `<img class="dado-imagen" src="img/dados/dado-rojo-${dadosObjetivo[i]}.svg" alt="Dado rojo: ${dadosObjetivo[i]}">`;
  }
  divObjetivo.innerHTML = html;
}

// Crea los 3 botones donde se muestran los dados del jugador
function crearDados() {
  zonaDados.replaceChildren();
  botonesDados = [];
  for (let i = 0; i < CANTIDAD_DADOS; i++) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.classList.add('dado');
    zonaDados.append(boton);
    botonesDados.push(boton);

    boton.addEventListener('click', () => {
      alternarRetenido(i);
    });
  }
}

function dibujarDados() {
  for (let i = 0; i < CANTIDAD_DADOS; i++) {
    const boton = botonesDados[i];
    let textoAlt = `Dado ${i + 1}: ${dados[i]}`;

    if (retenidos[i]) {
      boton.classList.add('retenido');
      textoAlt += ' (guardado)';
    } else {
      boton.classList.remove('retenido');
    }
    boton.innerHTML = `<img src="img/dados/dado-${dados[i]}.svg" alt="${textoAlt}">`;

    // Solo se pueden guardar dados entre el primer y el último tiro
    boton.disabled = tiro === 0 || tiro === TIROS_POR_TURNO || girando || turnoTerminado;
  }
  spanSuma.innerText = tiro === 0 ? '-' : sumar(dados);
}

// Marcador: una tarjeta por jugador con sus puntos y sus vidas
function dibujarMarcador() {
  divMarcador.replaceChildren();
  for (let j = 0; j < jugadores.length; j++) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('marcador-jugador');
    if (j === turno) {
      tarjeta.classList.add('marcador-activo');
    }
    if (jugadores[j].vidas === 0) {
      tarjeta.classList.add('marcador-afuera');
    }
    let corazones = '';
    for (let v = 0; v < VIDAS_INICIALES; v++) {
      corazones += v < jugadores[j].vidas ? '♥\uFE0E' : '♡\uFE0E';
    }
    const nombre = document.createElement('strong');
    nombre.innerText = jugadores[j].nombre;
    const datos = document.createElement('span');
    datos.innerText = `${jugadores[j].puntos} puntos · ${corazones}`;
    tarjeta.append(nombre);
    tarjeta.append(datos);
    divMarcador.append(tarjeta);
  }
}

function actualizarEstado() {
  spanRonda.innerText = `${ronda} / ${TOTAL_RONDAS}`;
  spanTurno.innerText = turno === -1 ? '-' : jugadores[turno].nombre;
  spanTiro.innerText = `${tiro} / ${TIROS_POR_TURNO}`;
  dibujarMarcador();
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

// ---------- Rondas y turnos ----------

// Empieza una ronda: la máquina tira los dados rojos con animación.
// El objetivo es el mismo para los dos jugadores.
function nuevaRonda() {
  turno = proximoJugadorConVidas(0);
  tiro = 0;
  turnoTerminado = true;   // nadie puede tirar hasta que esté el objetivo
  girando = true;
  btnTirar.disabled = true;
  btnPlantarse.disabled = true;
  btnSiguiente.classList.add('oculto');
  spanObjetivo.innerText = '?';
  actualizarEstado();
  dibujarDados();
  mostrarMensaje('La máquina está tirando los dados rojos...');

  let vueltas = 0;
  const animacion = setInterval(() => {
    for (let i = 0; i < CANTIDAD_DADOS; i++) {
      dadosObjetivo[i] = numeroAlAzar();
    }
    dibujarObjetivo();
    vueltas++;
    if (vueltas === 8) {
      clearInterval(animacion);
      girando = false;
      objetivo = sumar(dadosObjetivo);
      spanObjetivo.innerText = objetivo;
      empezarTurno(turno);
    }
  }, 70);
}

// Prepara el turno de un jugador
function empezarTurno(posicion) {
  turno = posicion;
  tiro = 0;
  retenidos = [false, false, false];
  turnoTerminado = false;
  btnTirar.disabled = false;
  btnPlantarse.disabled = true;
  btnSiguiente.classList.add('oculto');
  actualizarEstado();
  dibujarDados();
  mostrarMensaje(`Turno de ${jugadores[turno].nombre}. El objetivo es ${objetivo}: presioná «Tirar dados».`);
}

function alternarRetenido(posicion) {
  if (tiro === 0 || tiro === TIROS_POR_TURNO || girando || turnoTerminado) {
    return;
  }
  retenidos[posicion] = !retenidos[posicion];
  dibujarDados();
}

// Tira los dados que no están guardados.
// Con setInterval se cambian las caras varias veces para simular el giro
// y con clearInterval se detiene la animación y se fija el resultado.
function tirarDados() {
  if (tiro >= TIROS_POR_TURNO || girando || turnoTerminado) {
    return;
  }

  let todosGuardados = true;
  for (let i = 0; i < CANTIDAD_DADOS; i++) {
    if (!retenidos[i]) {
      todosGuardados = false;
    }
  }
  if (todosGuardados) {
    mostrarMensaje('Guardaste los 3 dados: soltá al menos uno para volver a tirar, o plantate.', 'error');
    return;
  }

  tiro++;
  girando = true;
  btnTirar.disabled = true;
  btnPlantarse.disabled = true;
  dibujarDados();

  let vueltas = 0;
  const animacion = setInterval(() => {
    for (let i = 0; i < CANTIDAD_DADOS; i++) {
      if (!retenidos[i]) {
        dados[i] = numeroAlAzar();
        botonesDados[i].classList.toggle('girando');
      }
    }
    dibujarDados();
    vueltas++;
    if (vueltas === 8) {
      clearInterval(animacion);
      terminarTirada();
    }
  }, 70);
}

function terminarTirada() {
  girando = false;
  botonesDados.forEach((boton) => {
    boton.classList.remove('girando');
  });
  actualizarEstado();
  dibujarDados();

  const suma = sumar(dados);
  if (tiro === TIROS_POR_TURNO) {
    // Después del tercer tiro se planta automáticamente
    plantarse();
  } else {
    btnTirar.disabled = false;
    btnPlantarse.disabled = false;
    mostrarMensaje(`${jugadores[turno].nombre}: tu suma es ${suma} y el objetivo ${objetivo}. Podés plantarte o volver a tirar (cuesta ${COSTO_TIRO_EXTRA} puntos).`);
  }
}

// ---------- Puntaje del turno ----------

// Puntos según la diferencia entre la suma y el objetivo
function puntosPorDiferencia(diferencia) {
  switch (diferencia) {
    case 0:
      return 20;
    case 1:
      return 12;
    case 2:
      return 6;
    case 3:
      return 2;
    default:
      return 0;
  }
}

function esTrio() {
  return dados[0] === dados[1] && dados[1] === dados[2];
}

// Tres números seguidos: todos distintos y el mayor menos el menor es 2
function esEscalerita() {
  const mayor = Math.max(dados[0], dados[1], dados[2]);
  const menor = Math.min(dados[0], dados[1], dados[2]);
  const distintos = dados[0] !== dados[1] && dados[1] !== dados[2] && dados[0] !== dados[2];
  return distintos && mayor - menor === 2;
}

function plantarse() {
  if (tiro === 0 || girando || turnoTerminado) {
    return;
  }
  turnoTerminado = true;
  btnTirar.disabled = true;
  btnPlantarse.disabled = true;
  dibujarDados();

  const jugador = jugadores[turno];
  const suma = sumar(dados);
  let diferencia = objetivo - suma;
  if (suma > objetivo) {
    diferencia = suma - objetivo;
  }

  const base = puntosPorDiferencia(diferencia);
  let bonus = 0;
  let textoBonus = '';
  if (esTrio()) {
    bonus += BONUS_TRIO;
    textoBonus += ` ¡Trío! +${BONUS_TRIO}.`;
  }
  if (esEscalerita()) {
    bonus += BONUS_ESCALERITA;
    textoBonus += ` ¡Escalerita! +${BONUS_ESCALERITA}.`;
  }
  const costo = (tiro - 1) * COSTO_TIRO_EXTRA;
  const ganados = Math.max(0, base + bonus - costo);
  jugador.puntos += ganados;

  let texto = `${jugador.nombre}: suma ${suma}, objetivo ${objetivo} (diferencia ${diferencia}): ${base} puntos.${textoBonus}`;
  if (costo > 0) {
    texto += ` Tiros extra: -${costo}.`;
  }
  texto += ` Total del turno: ${ganados}.`;

  if (diferencia >= 4) {
    jugador.vidas--;
    if (jugador.vidas === 0) {
      mostrarMensaje(`${texto} Perdió su última vida y queda afuera.`, 'error');
    } else {
      mostrarMensaje(`${texto} Se alejó mucho: pierde una vida.`, 'error');
    }
  } else if (diferencia === 0) {
    mostrarMensaje(`¡En el blanco! ${texto}`, 'ok');
  } else {
    mostrarMensaje(texto, 'ok');
  }
  actualizarEstado();
  prepararSiguiente();
}

// Decide qué viene después: el turno del otro jugador, otra ronda o el final
function prepararSiguiente() {
  const siguienteJugador = proximoJugadorConVidas(turno + 1);
  const quedanVivos = proximoJugadorConVidas(0) !== -1;

  if (siguienteJugador !== -1) {
    btnSiguiente.innerText = `Turno de ${jugadores[siguienteJugador].nombre}`;
  } else if (ronda === TOTAL_RONDAS || !quedanVivos) {
    terminarPartida();
    return;
  } else {
    btnSiguiente.innerText = 'Siguiente ronda';
  }
  btnSiguiente.classList.remove('oculto');
  btnSiguiente.focus();
}

function siguiente() {
  const siguienteJugador = proximoJugadorConVidas(turno + 1);
  if (siguienteJugador !== -1) {
    empezarTurno(siguienteJugador);
  } else {
    ronda++;
    nuevaRonda();
  }
}

// ---------- Inicio y fin de partida ----------

function empezarPartida() {
  ronda = 1;
  turno = 0;
  dados = [1, 1, 1];
  seccionConfig.classList.add('oculto');
  seccionJuego.classList.remove('oculto');
  zonaFinal.replaceChildren();
  btnNueva.classList.add('oculto');
  crearDados();
  nuevaRonda();
}

function terminarPartida() {
  btnTirar.disabled = true;
  btnPlantarse.disabled = true;
  btnSiguiente.classList.add('oculto');
  btnNueva.classList.remove('oculto');
  turno = -1;
  actualizarEstado();
  contarPartida('dados');

  const j1 = jugadores[0];
  const j2 = jugadores[1];
  let ganador = j1;
  let perdedor = j2;
  if (j2.puntos > j1.puntos) {
    ganador = j2;
    perdedor = j1;
  }

  const resumen = document.createElement('p');
  resumen.classList.add('mensaje');
  resumen.classList.add('mensaje-ok');
  if (j1.puntos === j2.puntos) {
    resumen.innerText = `¡Empate! Los dos terminaron con ${j1.puntos} puntos.`;
  } else {
    resumen.innerText = `¡${ganador.nombre} gana la partida! ${ganador.puntos} a ${perdedor.puntos}.`;
  }
  zonaFinal.append(resumen);

  if (ganador.puntos > 0) {
    mostrarFormularioRecord(zonaFinal, 'dados', ganador.puntos, `contra ${perdedor.nombre}`, ganador.nombre);
  }
}

// ---------- Eventos ----------

btnTirar.addEventListener('click', tirarDados);
btnPlantarse.addEventListener('click', plantarse);
btnSiguiente.addEventListener('click', siguiente);

btnNueva.addEventListener('click', () => {
  // Vuelve al formulario para poder cambiar los jugadores
  seccionJuego.classList.add('oculto');
  seccionConfig.classList.remove('oculto');
});
