// =========================================================
// inicio.js - Muestra el mejor récord de cada juego en la portada
// =========================================================

const juegosPortada = [
  { clave: 'cartas', unidad: 'puntos', parrafo: document.querySelector('#record-cartas') },
  { clave: 'dados', unidad: 'puntos', parrafo: document.querySelector('#record-dados') },
  { clave: 'preguntas', unidad: 'puntos', parrafo: document.querySelector('#record-preguntas') }
];

juegosPortada.forEach((juego) => {
  const mejor = mejorRecord(juego.clave);
  if (mejor === null) {
    juego.parrafo.innerText = 'Récord: todavía nadie jugó. ¡Sé el primero!';
  } else {
    juego.parrafo.innerText = `Récord: ${mejor.puntaje} ${juego.unidad} (${mejor.nombre})`;
  }
});
