// =========================================================
// puntajes.js - Muestra los récords guardados en localStorage
// =========================================================

// Datos de cada juego para armar las listas de récords
const JUEGOS = [
  { clave: 'cartas', tipo: 'Cartas', titulo: 'Duelo de Palos', unidad: 'puntos', pagina: 'cartas.html' },
  { clave: 'dados', tipo: 'Dados', titulo: 'Blanco', unidad: 'puntos', pagina: 'dados.html' },
  { clave: 'preguntas', tipo: 'Preguntas', titulo: 'Trivia de arte', unidad: 'puntos', pagina: 'preguntas.html' }
];

const grilla = document.querySelector('#grilla-puntajes');
const accionesBorrar = document.querySelector('#acciones-borrar');
const confirmarBorrar = document.querySelector('#confirmar-borrar');

// Arma un panel por juego: título, estadísticas y, debajo, el top 10
function mostrarPuntajes() {
  grilla.replaceChildren();
  // Nombre con el que se guardó el último récord: sus puestos se marcan con "Vos"
  const nombreActual = ultimoNombre();

  JUEGOS.forEach((juego) => {
    const lista = leerRecords(juego.clave);

    // ---- Título del juego y link para jugarlo ----
    const seccion = document.createElement('section');
    seccion.classList.add('panel');
    const cabecera = document.createElement('div');
    cabecera.classList.add('ranking-cabecera');
    const textos = document.createElement('div');
    const tipo = document.createElement('span');
    tipo.classList.add('sobretitulo');
    tipo.innerText = juego.tipo;
    const titulo = document.createElement('h2');
    titulo.innerText = juego.titulo;
    textos.append(tipo, titulo);
    const jugar = document.createElement('a');
    jugar.classList.add('link-jugar');
    jugar.href = juego.pagina;
    jugar.innerHTML = `Jugar<span class="solo-lector"> ${juego.titulo}</span> <span aria-hidden="true">→</span>`;
    cabecera.append(textos, jugar);
    seccion.append(cabecera);

    // ---- Estadísticas del juego ----
    let promedio = 0;
    if (lista.length > 0) {
      let suma = 0;
      for (let i = 0; i < lista.length; i++) {
        suma += lista[i].puntaje;
      }
      promedio = Math.round(suma / lista.length);
    }
    const resumen = document.createElement('div');
    resumen.classList.add('estado');
    resumen.innerHTML = `
      <div class="estado-item"><span>Partidas</span><strong>${leerPartidas(juego.clave)}</strong></div>
      <div class="estado-item"><span>Promedio top 10</span><strong>${promedio}</strong></div>`;
    seccion.append(resumen);

    if (lista.length === 0) {
      const vacio = document.createElement('p');
      vacio.classList.add('sin-datos');
      vacio.innerText = 'Sin récords todavía: el primero que juegue se queda con el puesto 1.';
      seccion.append(vacio);
    } else {
      // Rótulos de las columnas: así "puntos" no se repite en cada fila
      const columnas = document.createElement('div');
      columnas.classList.add('lista-columnas');
      columnas.setAttribute('aria-hidden', 'true');
      columnas.innerHTML = `<span>Jugador</span><span>${juego.unidad}</span>`;

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
        if (lista[i].nombre === nombreActual) {
          item.classList.add('record-propio');
          const vos = document.createElement('span');
          vos.classList.add('etiqueta-vos');
          vos.innerText = 'Vos';
          nombre.append(vos);
        }
        const detalle = document.createElement('small');
        detalle.innerText = lista[i].detalle;
        nombre.append(detalle);
        // La unidad queda para el lector de pantalla; a la vista está en el rótulo de la columna
        const puntaje = document.createElement('span');
        puntaje.classList.add('record-puntaje');
        puntaje.innerHTML = `${lista[i].puntaje}<span class="solo-lector"> ${juego.unidad}</span>`;
        item.append(nombre, puntaje);
        listaHtml.append(item);
      }
      seccion.append(columnas, listaHtml);
    }
    grilla.append(seccion);
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
