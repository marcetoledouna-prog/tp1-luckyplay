// =========================================================
// interaccion.js - Movimiento compartido por todas las páginas
// - Revelado suave de los bloques al entrar en pantalla
// - Header que gana fondo al hacer scroll
// Todo es decorativo: si este archivo no carga, el sitio funciona igual.
// =========================================================

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

// ---------- Revelado al entrar en pantalla ----------
const SELECTOR_REVELAR = [
  '.cabecera > *',
  '.bloque-titulo',
  '.tarjeta-juego',
  '.pasos li',
  '.intro-juego .panel',
  '.integrante',
  '.grilla-puntajes .panel',
  '.cifras li',
  '.proceso li',
  '.stack li'
].join(', ');

if (!sinMovimiento && 'IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('is-visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll(SELECTOR_REVELAR).forEach((elemento) => {
    // Escalonado entre hermanos: cada uno espera un poco más que el anterior
    const hermanos = Array.from(elemento.parentElement.children);
    elemento.style.setProperty('--i', hermanos.indexOf(elemento));
    elemento.classList.add('revelar');
    observador.observe(elemento);
  });
}

// ---------- Header al hacer scroll ----------
const encabezado = document.querySelector('.encabezado');

function revisarScroll() {
  encabezado.classList.toggle('is-scrolled', window.scrollY > 8);
}

if (encabezado !== null) {
  revisarScroll();
  window.addEventListener('scroll', revisarScroll, { passive: true });
}
