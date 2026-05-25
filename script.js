
const imagenesGaleria = document.querySelectorAll('.card img');
const lightbox = document.getElementById('lightbox');
const imagenLightbox = document.getElementById('imagen-lightbox');
const botonCerrar = document.getElementById('cerrar-lightbox');

imagenesGaleria.forEach(imagen => {
    imagen.addEventListener('click', () => {
        
        imagenLightbox.src = imagen.src;
        
        lightbox.classList.remove('lightbox-oculto');
    });
});


botonCerrar.addEventListener('click', () => {
    lightbox.classList.add('lightbox-oculto');
});


lightbox.addEventListener('click', (evento) => {
    if (evento.target === lightbox) {
        lightbox.classList.add('lightbox-oculto');
    }
});

const btnMenu = document.getElementById('btn-menu');
const menuEnlaces = document.getElementById('menu-enlaces');

btnMenu.addEventListener('click', () => {
    menuEnlaces.classList.toggle('mostrar');
});
