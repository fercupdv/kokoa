// ============================================================
// Fera.DV — script.js
// Sistema de Reseñas con Firebase Firestore
// ============================================================

// ─── Configuración de Firebase ──────────────────────────────
// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tu configuración de Firebase (proporcionada por el usuario)
const firebaseConfig = {
  apiKey: "AIzaSyBJ1aFZ-kq5lD9_UXQ9ZVDTfLm7TNGu1W4",
  authDomain: "kokoa-res.firebaseapp.com",
  projectId: "kokoa-res",
  storageBucket: "kokoa-res.firebasestorage.app",
  messagingSenderId: "242554255229",
  appId: "1:242554255229:web:d8ca3136075ff3817bbe14",
  measurementId: "G-X2F40DBVWC"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Menú hamburguesa ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const btnMenu = document.getElementById("btn-menu");
  const menuEnlaces = document.getElementById("menu-enlaces");

  if (btnMenu && menuEnlaces) {
    btnMenu.addEventListener("click", function () {
      menuEnlaces.classList.toggle("mostrar");
    });
  }

  // Inicializar el sistema de reseñas para todas las cámaras
  const camaras = ["camara_1", "camara_2", "camara_3", "camara_4", "camara_5"];
  camaras.forEach(function (idCamara) {
    // Solo si el elemento existe en la página
    if (document.getElementById("lista-" + idCamara)) {
      escucharResenas(idCamara); // Escucha cambios en Firestore
    }
  });
});

// ─── BASE DE DATOS (Firebase Firestore) ─────────────────────

/**
 * Escucha cambios en las reseñas de una cámara en Firestore y las renderiza.
 * @param {string} idCamara - Ej: "camara_1"
 */
async function escucharResenas(idCamara) {
  const q = query(collection(db, "resenas"), where("idCamara", "==", idCamara), orderBy("fecha", "desc"));

  onSnapshot(q, (querySnapshot) => {
    const resenas = [];
    querySnapshot.forEach((doc) => {
      resenas.push(doc.data());
    });
    renderizarResenas(idCamara, resenas);
  });
}

/**
 * Agrega una nueva reseña a Firestore.
 * @param {string} idCamara
 * @param {string} usuario
 * @param {number} calificacion - Número del 1 al 5
 * @param {string} texto
 */
async function agregarResena(idCamara, usuario, calificacion, texto) {
  try {
    await addDoc(collection(db, "resenas"), {
      idCamara: idCamara,
      usuario: usuario.trim(),
      calificacion: parseInt(calificacion),
      texto: texto.trim(),
      fecha: new Date().toISOString(), // Guarda la fecha en formato ISO
    });
    console.log("Reseña agregada con éxito a Firestore!");
  } catch (e) {
    console.error("Error al agregar reseña: ", e);
  }
}

/**
 * Calcula el promedio de calificaciones de una cámara.
 * @param {Array} resenas - Array de objetos de reseña
 * @returns {number} Promedio con 1 decimal, o 0 si no hay reseñas
 */
function calcularPromedio(resenas) {
  if (resenas.length === 0) return 0;
  const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}

// ─── RENDERIZADO ─────────────────────────────────────────────

/**
 * Genera una cadena de estrellas visuales (★ llenas y ☆ vacías).
 * @param {number} calificacion - Número del 1 al 5
 * @returns {string} Cadena de estrellas HTML
 */
function generarEstrellas(calificacion) {
  let resultado = "";
  for (let i = 1; i <= 5; i++) {
    resultado += i <= calificacion ? "★" : "☆";
  }
  return resultado;
}

/**
 * Renderiza el badge de promedio y la lista de reseñas de una cámara.
 * @param {string} idCamara
 * @param {Array} resenas - Array de objetos de reseña de Firestore
 */
function renderizarResenas(idCamara, resenas) {
  const promedio = calcularPromedio(resenas);

  // Actualizar badge de promedio
  const badge = document.getElementById("badge-" + idCamara);
  const totalLabel = document.getElementById("total-" + idCamara);

  if (badge) {
    if (resenas.length === 0) {
      badge.innerHTML = 
        `<span class="sin-resenas">Sin reseñas aún</span>`;
    } else {
      badge.innerHTML =
        `<span class="estrellas-display">${generarEstrellas(Math.round(promedio))}</span>` +
        `<span>${promedio.toFixed(1)} / 5.0</span>`;
    }
  }

  if (totalLabel) {
    totalLabel.textContent = resenas.length > 0
      ? `${resenas.length} ${resenas.length === 1 ? "reseña" : "reseñas"}`
      : "";
  }

  // Renderizar lista de reseñas
  const lista = document.getElementById("lista-" + idCamara);
  if (!lista) return;

  if (resenas.length === 0) {
    lista.innerHTML = 
      `<p class="sin-resenas-msg">Aún no hay reseñas para esta cámara. ¡Sé el primero!</p>`;
    return;
  }

  let html = "";
  resenas.forEach(function (r) {
    const fechaFormateada = new Date(r.fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    html +=
      `<div class="resena-item">` +
        `<div class="resena-meta">` +
          `<span class="resena-usuario">@${escapeHtml(r.usuario)}</span>` +
          `<span class="resena-estrellas">${generarEstrellas(r.calificacion)} (${r.calificacion}/5)</span>` +
          `<span class="resena-fecha">${fechaFormateada}</span>` +
        `</div>` +
        `<p class="resena-texto">${escapeHtml(r.texto)}</p>` +
      `</div>`;
  });
  lista.innerHTML = html;
}

// ─── ENVÍO DEL FORMULARIO ────────────────────────────────────

/**
 * Maneja el envío de una nueva reseña desde el formulario.
 * @param {string} idCamara
 */
window.enviarResena = async function (idCamara) {
  const usuarioInput = document.getElementById("usuario-" + idCamara);
  const textoInput = document.getElementById("texto-" + idCamara);
  const msgExito = document.getElementById("exito-" + idCamara);
  const msgError = document.getElementById("error-" + idCamara);

  // Obtener calificación seleccionada
  const starSeleccionada = document.querySelector(
    `input[name="stars-${idCamara}"]:checked`
  );

  const usuario = usuarioInput ? usuarioInput.value.trim() : "";
  const texto = textoInput ? textoInput.value.trim() : "";
  const calificacion = starSeleccionada ? parseInt(starSeleccionada.value) : 0;

  // Ocultar mensajes previos
  if (msgExito) msgExito.style.display = "none";
  if (msgError) msgError.style.display = "none";

  // Validación
  if (!usuario || !texto || calificacion < 1) {
    if (msgError) msgError.style.display = "block";
    return;
  }

  // Guardar en Firebase Firestore
  await agregarResena(idCamara, usuario, calificacion, texto);

  // Limpiar formulario
  if (usuarioInput) usuarioInput.value = "";
  if (textoInput) textoInput.value = "";
  if (starSeleccionada) starSeleccionada.checked = false;
  // Desmarcar todas las estrellas visualmente
  document.querySelectorAll(`input[name="stars-${idCamara}"]`).forEach(radio => radio.checked = false);

  // Mostrar mensaje de éxito
  if (msgExito) {
    msgExito.style.display = "block";
    setTimeout(function () {
      msgExito.style.display = "none";
    }, 3000);
  }

  // La interfaz se actualizará automáticamente gracias a onSnapshot
}

// ─── UTILIDADES ──────────────────────────────────────────────

/**
 * Escapa caracteres HTML para prevenir inyección de código.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
