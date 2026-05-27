// ============================================================
// Fera.DV — script.js
// Sistema de Reseñas con Base de Datos en localStorage
// Estructura de datos:
//   localStorage["resenas_camara_X"] = JSON.stringify([
//     { usuario, calificacion, texto, fecha }
//   ])
// ============================================================

// ─── Menú hamburguesa (código original) ─────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const btnMenu = document.getElementById('btn-menu');
  const menuEnlaces = document.getElementById('menu-enlaces');

  if (btnMenu && menuEnlaces) {
    btnMenu.addEventListener('click', function () {
      menuEnlaces.classList.toggle('activo');
    });
  }

  // Inicializar el sistema de reseñas para todas las cámaras
  const camaras = ['camara_1', 'camara_2', 'camara_3', 'camara_4', 'camara_5'];
  camaras.forEach(function (idCamara) {
    if (document.getElementById('lista-' + idCamara)) {
      renderizarResenas(idCamara);
    }
  });
});

// ─── BASE DE DATOS (localStorage) ───────────────────────────

/**
 * Carga las reseñas de una cámara desde localStorage.
 * @param {string} idCamara - Ej: "camara_1"
 * @returns {Array} Array de objetos de reseña
 */
function cargarResenas(idCamara) {
  var datos = localStorage.getItem('resenas_' + idCamara);
  if (!datos) return [];
  try {
    return JSON.parse(datos);
  } catch (e) {
    return [];
  }
}

/**
 * Guarda el array de reseñas de una cámara en localStorage.
 * @param {string} idCamara
 * @param {Array} resenas
 */
function guardarResenas(idCamara, resenas) {
  localStorage.setItem('resenas_' + idCamara, JSON.stringify(resenas));
}

/**
 * Agrega una nueva reseña a la base de datos local.
 * @param {string} idCamara
 * @param {string} usuario
 * @param {number} calificacion - Número del 1 al 5
 * @param {string} texto
 */
function agregarResena(idCamara, usuario, calificacion, texto) {
  var resenas = cargarResenas(idCamara);
  var nuevaResena = {
    usuario: usuario.trim(),
    calificacion: parseInt(calificacion),
    texto: texto.trim(),
    fecha: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
  resenas.push(nuevaResena);
  guardarResenas(idCamara, resenas);
}

/**
 * Calcula el promedio de calificaciones de una cámara.
 * @param {string} idCamara
 * @returns {number} Promedio con 1 decimal, o 0 si no hay reseñas
 */
function calcularPromedio(idCamara) {
  var resenas = cargarResenas(idCamara);
  if (resenas.length === 0) return 0;
  var suma = resenas.reduce(function (acc, r) {
    return acc + r.calificacion;
  }, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}

// ─── RENDERIZADO ─────────────────────────────────────────────

/**
 * Genera una cadena de estrellas visuales (★ llenas y ☆ vacías).
 * @param {number} calificacion - Número del 1 al 5
 * @returns {string} Cadena de estrellas HTML
 */
function generarEstrellas(calificacion) {
  var resultado = '';
  for (var i = 1; i <= 5; i++) {
    resultado += i <= calificacion ? '★' : '☆';
  }
  return resultado;
}

/**
 * Renderiza el badge de promedio y la lista de reseñas de una cámara.
 * @param {string} idCamara
 */
function renderizarResenas(idCamara) {
  var resenas = cargarResenas(idCamara);
  var promedio = calcularPromedio(idCamara);

  // Actualizar badge de promedio
  var badge = document.getElementById('badge-' + idCamara);
  var totalLabel = document.getElementById('total-' + idCamara);

  if (badge) {
    if (resenas.length === 0) {
      badge.innerHTML = '<span class="sin-resenas">Sin reseñas aún</span>';
    } else {
      badge.innerHTML =
        '<span class="estrellas-display">' + generarEstrellas(Math.round(promedio)) + '</span>' +
        '<span>' + promedio.toFixed(1) + ' / 5.0</span>';
    }
  }

  if (totalLabel) {
    totalLabel.textContent = resenas.length > 0
      ? resenas.length + (resenas.length === 1 ? ' reseña' : ' reseñas')
      : '';
  }

  // Renderizar lista de reseñas
  var lista = document.getElementById('lista-' + idCamara);
  if (!lista) return;

  if (resenas.length === 0) {
    lista.innerHTML = '<p class="sin-resenas-msg">Aún no hay reseñas para esta cámara. ¡Sé el primero!</p>';
    return;
  }

  // Mostrar las reseñas de más reciente a más antigua
  var html = '';
  var resenasOrdenadas = resenas.slice().reverse();
  resenasOrdenadas.forEach(function (r) {
    html +=
      '<div class="resena-item">' +
        '<div class="resena-meta">' +
          '<span class="resena-usuario">@' + escapeHtml(r.usuario) + '</span>' +
          '<span class="resena-estrellas">' + generarEstrellas(r.calificacion) + ' (' + r.calificacion + '/5)</span>' +
          '<span class="resena-fecha">' + r.fecha + '</span>' +
        '</div>' +
        '<p class="resena-texto">' + escapeHtml(r.texto) + '</p>' +
      '</div>';
  });
  lista.innerHTML = html;
}

// ─── ENVÍO DEL FORMULARIO ────────────────────────────────────

/**
 * Maneja el envío de una nueva reseña desde el formulario.
 * @param {string} idCamara
 */
function enviarResena(idCamara) {
  var usuarioInput = document.getElementById('usuario-' + idCamara);
  var textoInput = document.getElementById('texto-' + idCamara);
  var msgExito = document.getElementById('exito-' + idCamara);
  var msgError = document.getElementById('error-' + idCamara);

  // Obtener calificación seleccionada
  var starSeleccionada = document.querySelector(
    'input[name="stars-' + idCamara + '"]:checked'
  );

  var usuario = usuarioInput ? usuarioInput.value.trim() : '';
  var texto = textoInput ? textoInput.value.trim() : '';
  var calificacion = starSeleccionada ? parseInt(starSeleccionada.value) : 0;

  // Ocultar mensajes previos
  if (msgExito) msgExito.style.display = 'none';
  if (msgError) msgError.style.display = 'none';

  // Validación
  if (!usuario || !texto || calificacion < 1) {
    if (msgError) msgError.style.display = 'block';
    return;
  }

  // Guardar en la base de datos local
  agregarResena(idCamara, usuario, calificacion, texto);

  // Limpiar formulario
  if (usuarioInput) usuarioInput.value = '';
  if (textoInput) textoInput.value = '';
  if (starSeleccionada) starSeleccionada.checked = false;

  // Mostrar mensaje de éxito
  if (msgExito) {
    msgExito.style.display = 'block';
    setTimeout(function () {
      msgExito.style.display = 'none';
    }, 3000);
  }

  // Actualizar la interfaz
  renderizarResenas(idCamara);
}

// ─── UTILIDADES ──────────────────────────────────────────────

/**
 * Escapa caracteres HTML para prevenir inyección de código.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
