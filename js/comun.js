// =========================================================
// comun.js - Funciones compartidas por todas las páginas
// - Récords y partidas jugadas (localStorage + JSON)
// - Ventana de reglas de los juegos
// - Mezclar un array
// =========================================================

// Cada juego guarda sus récords en una clave distinta:
// lukyplay-records-cartas, lukyplay-records-dados, lukyplay-records-preguntas
const PREFIJO_RECORDS = 'lukyplay-records-';
// Cantidad de partidas jugadas: lukyplay-partidas-cartas, etc.
const PREFIJO_PARTIDAS = 'lukyplay-partidas-';
// Último nombre que usó el jugador (preferencia del usuario)
const CLAVE_NOMBRE = 'lukyplay-nombre';
// Cantidad máxima de puestos que se guardan por juego
const MAX_PUESTOS = 10;

// ---------- Récords ----------

// Devuelve el array de récords de un juego.
// localStorage solo guarda texto: lo convertimos con JSON.parse()
function leerRecords(juego) {
  const texto = localStorage.getItem(PREFIJO_RECORDS + juego);
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

// Agrega un récord en la posición que le corresponde (de mayor a menor).
// Devuelve el puesto obtenido (1, 2, 3...) o 0 si no entró en el top.
function guardarRecord(juego, nombre, puntaje, detalle) {
  const lista = leerRecords(juego);
  const nuevo = { nombre: nombre, puntaje: puntaje, detalle: detalle };

  // Buscamos la primera posición con un puntaje menor al nuevo
  let posicion = lista.length;
  for (let i = 0; i < lista.length; i++) {
    if (puntaje > lista[i].puntaje) {
      posicion = i;
      break;
    }
  }

  // splice inserta el nuevo récord en esa posición sin borrar nada
  lista.splice(posicion, 0, nuevo);

  // Si la lista supera el máximo, sacamos el último
  if (lista.length > MAX_PUESTOS) {
    lista.pop();
  }

  // Convertimos el array a texto JSON y lo guardamos
  localStorage.setItem(PREFIJO_RECORDS + juego, JSON.stringify(lista));
  localStorage.setItem(CLAVE_NOMBRE, nombre);

  if (posicion < MAX_PUESTOS) {
    return posicion + 1;
  }
  return 0;
}

// Devuelve el mejor récord de un juego, o null si no hay récords
function mejorRecord(juego) {
  const lista = leerRecords(juego);
  if (lista.length === 0) {
    return null;
  }
  return lista[0];
}

// ---------- Partidas jugadas ----------

function leerPartidas(juego) {
  // Si no hay nada guardado, getItem devuelve null y Number(null) es 0
  return Number(localStorage.getItem(PREFIJO_PARTIDAS + juego));
}

function contarPartida(juego) {
  const partidas = leerPartidas(juego) + 1;
  localStorage.setItem(PREFIJO_PARTIDAS + juego, partidas);
}

// ---------- Nombre del jugador ----------

// Devuelve el último nombre que usó el jugador (o texto vacío)
function ultimoNombre() {
  const nombre = localStorage.getItem(CLAVE_NOMBRE);
  if (nombre === null) {
    return '';
  }
  return nombre;
}

// Valida el nombre ingresado.
// Devuelve un texto con el error o un texto vacío si está todo bien.
// (El máximo de 15 caracteres lo controla el atributo maxlength del input.)
function validarNombre(nombre) {
  if (nombre === '') {
    return 'Escribí tu nombre para guardar el récord.';
  }
  return '';
}

// ---------- Formulario de récord ----------

// Arma el formulario para guardar el récord al final de una partida.
// contenedor: elemento donde se agrega el formulario
// juego: 'cartas', 'dados' o 'preguntas'
// puntaje y detalle: lo que se va a guardar
// nombreSugerido: nombre que aparece escrito en el campo
function mostrarFormularioRecord(contenedor, juego, puntaje, detalle, nombreSugerido) {
  const form = document.createElement('form');
  form.classList.add('form-record');
  form.innerHTML = `
    <h3>Guardá tu puntaje: ${puntaje}</h3>
    <div class="fila-form">
      <div class="campo">
        <label for="nombre-record">Tu nombre</label>
        <input type="text" id="nombre-record" maxlength="15" placeholder="Ej: Martina">
      </div>
      <div class="campo">
        <button type="submit" class="btn">Guardar récord</button>
      </div>
    </div>
    <p class="campo-error" id="error-record"></p>
  `;
  contenedor.append(form);

  const input = document.querySelector('#nombre-record');
  const error = document.querySelector('#error-record');
  input.value = nombreSugerido;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = input.value;
    const problema = validarNombre(nombre);
    if (problema !== '') {
      error.innerText = problema;
      return;
    }
    const puesto = guardarRecord(juego, nombre, puntaje, detalle);
    const aviso = document.createElement('p');
    aviso.classList.add('mensaje');
    aviso.classList.add('mensaje-ok');
    if (puesto > 0) {
      aviso.innerHTML = `¡Guardado! Quedaste en el puesto ${puesto}. <a href="puntajes.html">Ver tabla de puntajes</a>`;
    } else {
      aviso.innerHTML = `Puntaje registrado, pero no alcanzó para entrar al top ${MAX_PUESTOS}. <a href="puntajes.html">Ver tabla de puntajes</a>`;
    }
    form.replaceWith(aviso);
  });
}

// ---------- Ventana de reglas ----------

// En las páginas de juego, el botón "Cómo se juega" abre las reglas en un <dialog>.
// El botón Cerrar lo cierra solo (está en un form con method="dialog") y Esc también.
const ventanaReglas = document.querySelector('#ventana-reglas');
const btnReglas = document.querySelector('#btn-reglas');

if (ventanaReglas !== null && btnReglas !== null) {
  btnReglas.addEventListener('click', () => {
    ventanaReglas.showModal();
  });

  // Un clic en el fondo oscuro llega al propio <dialog>, no a su contenido
  ventanaReglas.addEventListener('click', (e) => {
    if (e.target === ventanaReglas) {
      ventanaReglas.close();
    }
  });
}

// ---------- Utilidades ----------

// Mezcla el array recorriéndolo desde el final e intercambiando
// cada posición con otra elegida al azar
function mezclar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const auxiliar = lista[i];
    lista[i] = lista[j];
    lista[j] = auxiliar;
  }
}

