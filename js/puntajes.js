// =========================================================
// puntajes.js - Muestra los récords guardados en localStorage
// =========================================================

// Datos de cada juego para armar las listas de récords
const JUEGOS = [
  { clave: 'cartas', titulo: 'Duelo de Palos (cartas)', unidad: 'puntos', pagina: 'cartas.html' },
  { clave: 'dados', titulo: 'Blanco (dados)', unidad: 'puntos', pagina: 'dados.html' },
  { clave: 'preguntas', titulo: 'Trivia (preguntas)', unidad: 'puntos', pagina: 'preguntas.html' }
];

const grilla = document.querySelector('#grilla-puntajes');
const estadisticas = document.querySelector('#estadisticas');
const accionesBorrar = document.querySelector('#acciones-borrar');
const confirmarBorrar = document.querySelector('#confirmar-borrar');

function mostrarPuntajes() {
  grilla.replaceChildren();
  estadisticas.replaceChildren();

  JUEGOS.forEach((juego) => {
    const lista = leerRecords(juego.clave);

    // ---- Lista de récords del juego ----
    const seccion = document.createElement('section');
    seccion.classList.add('panel');
    const titulo = document.createElement('h2');
    titulo.innerText = juego.titulo;
    seccion.append(titulo);

    if (lista.length === 0) {
      const vacio = document.createElement('p');
      vacio.classList.add('sin-datos');
      vacio.innerHTML = `Todavía no hay récords. <a href="${juego.pagina}">¡Jugá la primera partida!</a>`;
      seccion.append(vacio);
    } else {
      // Usamos una lista ordenada <ol>: el navegador numera los puestos
      const listaHtml = document.createElement('ol');
      listaHtml.classList.add('lista-records');
      for (let i = 0; i < lista.length; i++) {
        const item = document.createElement('li');
        // Nombre y detalle a la izquierda, puntaje a la derecha.
        // innerText muestra el nombre tal cual lo escribió el jugador
        const nombre = document.createElement('span');
        nombre.classList.add('record-nombre');
        nombre.innerText = lista[i].nombre;
        const detalle = document.createElement('small');
        detalle.innerText = lista[i].detalle;
        nombre.append(detalle);
        const puntaje = document.createElement('span');
        puntaje.classList.add('record-puntaje');
        puntaje.innerText = `${lista[i].puntaje} ${juego.unidad}`;
        item.append(nombre, puntaje);
        listaHtml.append(item);
      }
      seccion.append(listaHtml);
    }
    grilla.append(seccion);

    // ---- Estadísticas del juego ----
    let promedio = 0;
    if (lista.length > 0) {
      let suma = 0;
      for (let i = 0; i < lista.length; i++) {
        suma += lista[i].puntaje;
      }
      promedio = Math.round(suma / lista.length);
    }
    const item = document.createElement('div');
    item.classList.add('estado-item');
    item.innerHTML = `<span>${juego.titulo}</span><strong>${leerPartidas(juego.clave)}</strong> partidas jugadas · promedio del top: ${promedio}`;
    estadisticas.append(item);
  });
}

document.querySelector('#btn-borrar').addEventListener('click', () => {
  accionesBorrar.classList.add('oculto');
  confirmarBorrar.classList.remove('oculto');
});

document.querySelector('#btn-cancelar').addEventListener('click', () => {
  confirmarBorrar.classList.add('oculto');
  accionesBorrar.classList.remove('oculto');
});

// Borra los récords y las partidas de los tres juegos
document.querySelector('#btn-confirmar').addEventListener('click', () => {
  JUEGOS.forEach((juego) => {
    localStorage.removeItem(PREFIJO_RECORDS + juego.clave);
    localStorage.removeItem(PREFIJO_PARTIDAS + juego.clave);
  });
  confirmarBorrar.classList.add('oculto');
  accionesBorrar.classList.remove('oculto');
  mostrarPuntajes();
});

mostrarPuntajes();
