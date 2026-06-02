// ============================================================
// Fera.DV — script.js (CORREGIDO PARA GITHUB PAGES)
// Sistema de Reseñas con Firebase Firestore
// ============================================================

// Esperar a que Firebase esté disponible globalmente
if (typeof firebase === 'undefined') {
  console.error('Firebase no está cargado. Verifica que el script de Firebase esté en el HTML.');
}

// ─── Inicialización de Firebase ─────────────────────────────
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
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("✓ Firebase inicializado correctamente");
} catch (error) {
  console.error("✗ Error al inicializar Firebase:", error);
}

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
    if (document.getElementById("lista-" + idCamara)) {
      escucharResenas(idCamara);
    }
  });
});

// ─── BASE DE DATOS (Firebase Firestore) ─────────────────────

/**
 * Escucha cambios en las reseñas de una cámara en Firestore y las renderiza.
 */
function escucharResenas(idCamara) {
  if (!db) {
    console.error("Firebase no está disponible para:", idCamara);
    return;
  }

  try {
    db.collection("resenas")
      .where("idCamara", "==", idCamara)
      .orderBy("fecha", "desc")
      .onSnapshot(
        function (querySnapshot) {
          const resenas = [];
          querySnapshot.forEach(function (doc) {
            resenas.push(doc.data());
          });
          renderizarResenas(idCamara, resenas);
        },
        function (error) {
          console.error("Error al escuchar reseñas de " + idCamara + ":", error);
        }
      );
  } catch (error) {
    console.error("Error en escucharResenas:", error);
  }
}

/**
 * Agrega una nueva reseña a Firestore.
 */
function agregarResena(idCamara, usuario, calificacion, texto) {
  if (!db) {
    console.error("Firebase no está disponible");
    return Promise.reject("Firebase no inicializado");
  }

  return db.collection("resenas")
    .add({
      idCamara: idCamara,
      usuario: usuario.trim(),
      calificacion: parseInt(calificacion),
      texto: texto.trim(),
      fecha: new Date()
    })
    .then(function () {
      console.log("✓ Reseña agregada con éxito a Firestore");
    })
    .catch(function (error) {
      console.error("✗ Error al agregar reseña:", error);
      throw error;
    });
}

/**
 * Calcula el promedio de calificaciones.
 */
function calcularPromedio(resenas) {
  if (resenas.length === 0) return 0;
  const suma = resenas.reduce(function (acc, r) {
    return acc + r.calificacion;
  }, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}

// ─── RENDERIZADO ─────────────────────────────────────────────

/**
 * Genera una cadena de estrellas visuales.
 */
function generarEstrellas(calificacion) {
  let resultado = "";
  for (let i = 1; i <= 5; i++) {
    resultado += i <= calificacion ? "★" : "☆";
  }
  return resultado;
}

/**
 * Renderiza el badge de promedio y la lista de reseñas.
 */
function renderizarResenas(idCamara, resenas) {
  const promedio = calcularPromedio(resenas);

  // Actualizar badge
  const badge = document.getElementById("badge-" + idCamara);
  const totalLabel = document.getElementById("total-" + idCamara);

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
      ? resenas.length + (resenas.length === 1 ? " reseña" : " reseñas")
      : "";
  }

  // Renderizar lista
  const lista = document.getElementById("lista-" + idCamara);
  if (!lista) return;

  if (resenas.length === 0) {
    lista.innerHTML = '<p class="sin-resenas-msg">Aún no hay reseñas para esta cámara. ¡Sé el primero!</p>';
    return;
  }

  let html = "";
  resenas.forEach(function (r) {
    const fecha = r.fecha && r.fecha.toDate 
      ? r.fecha.toDate().toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      : "Fecha desconocida";

    html +=
      '<div class="resena-item">' +
        '<div class="resena-meta">' +
          '<span class="resena-usuario">@' + escapeHtml(r.usuario) + '</span>' +
          '<span class="resena-estrellas">' + generarEstrellas(r.calificacion) + ' (' + r.calificacion + '/5)</span>' +
          '<span class="resena-fecha">' + fecha + '</span>' +
        '</div>' +
        '<p class="resena-texto">' + escapeHtml(r.texto) + '</p>' +
      '</div>';
  });
  lista.innerHTML = html;
}

// ─── ENVÍO DEL FORMULARIO ────────────────────────────────────

/**
 * Maneja el envío de una nueva reseña.
 */
window.enviarResena = async function (idCamara) {
  const usuarioInput = document.getElementById("usuario-" + idCamara);
  const textoInput = document.getElementById("texto-" + idCamara);
  const msgExito = document.getElementById("exito-" + idCamara);
  const msgError = document.getElementById("error-" + idCamara);

  const starSeleccionada = document.querySelector(
    'input[name="stars-' + idCamara + '"]:checked'
  );

  const usuario = usuarioInput ? usuarioInput.value.trim() : "";
  const texto = textoInput ? textoInput.value.trim() : "";
  const calificacion = starSeleccionada ? parseInt(starSeleccionada.value) : 0;

  if (msgExito) msgExito.style.display = "none";
  if (msgError) msgError.style.display = "none";

  // Validación
  if (!usuario || !texto || calificacion < 1) {
    if (msgError) msgError.style.display = "block";
    return;
  }

  try {
    // Guardar en Firebase
    await agregarResena(idCamara, usuario, calificacion, texto);

    // Limpiar formulario
    if (usuarioInput) usuarioInput.value = "";
    if (textoInput) textoInput.value = "";
    document.querySelectorAll('input[name="stars-' + idCamara + '"]').forEach(function (radio) {
      radio.checked = false;
    });

    // Mostrar éxito
    if (msgExito) {
      msgExito.style.display = "block";
      setTimeout(function () {
        msgExito.style.display = "none";
      }, 3000);
    }
  } catch (error) {
    console.error("Error al enviar reseña:", error);
    if (msgError) {
      msgError.textContent = "⚠ Error al guardar. Intenta de nuevo.";
      msgError.style.display = "block";
    }
  }
};

// ─── UTILIDADES ──────────────────────────────────────────────

/**
 * Escapa caracteres HTML.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
