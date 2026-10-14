// SCRIPT DE LA APLICACIÓN MILLE - EDICIÓN CHARLES LECLERC F1

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const imageUpload = document.getElementById('imageUpload');
    const imageCanvas = document.getElementById('imageCanvas');
    const placeholderText = document.getElementById('placeholderText');
    const saveBtn = document.getElementById('saveBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const filterGroups = document.querySelectorAll('.filter-group');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let canvasContext = imageCanvas.getContext('2d');
    let originalImage = null;
    let currentFilter = 'normal';

    // 1. Manejo de Pestañas de Filtros
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            filterGroups.forEach(g => g.classList.remove('active'));

            btn.classList.add('active');
            const tabId = 'group-' + btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 2. Cargar Imagen y Mostrar en el Canvas
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                
                // Configurar dimensiones del canvas proporcionalmente
                let maxWidth = 800;
                let maxHeight = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                imageCanvas.width = width;
                imageCanvas.height = height;

                // Dibujar imagen original
                canvasContext.drawImage(img, 0, 0, width, height);
                
                // Mostrar canvas y ocultar placeholder
                imageCanvas.style.display = 'block';
                placeholderText.style.display = 'none';

                // Aplicar filtro actual si ya estaba seleccionado
                applyFilter(currentFilter);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    // 3. Selección y Aplicación de Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');

            currentFilter = btn.getAttribute('data-filter');
            applyFilter(currentFilter);
        });
    });

    function applyFilter(filterName) {
        if (!originalImage) return;

        // Redibujar imagen limpia antes de aplicar nuevo filtro
        canvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        canvasContext.drawImage(originalImage, 0, 0, imageCanvas.width, imageCanvas.height);

        const imageData = canvasContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        const data = imageData.data;

        switch (filterName) {
            case 'normal':
                // Sin cambios adicionales
                break;

            case 'monaco':
                // Blanco y negro clásico de Mónaco GP
                for (let i = 0; i < data.length; i += 4) {
                    let avg = (data[i] * 0.3) + (data[i + 1] * 0.59) + (data[i + 2] * 0.11);
                    data[i] = avg;     // R
                    data[i + 1] = avg; // G
                    data[i + 2] = avg; // B
                }
                break;

            case 'ferrari-red':
                // Énfasis en el rojo escudería
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.3);     // Aumentar rojo
                    data[i + 1] = data[i + 1] * 0.85;           // Reducir verde ligeramente
                    data[i + 2] = data[i + 2] * 0.8;            // Reducir azul
                }
                break;

            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i], g = data[i+1], b = data[i+2];
                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;

            case 'paddock':
                // Tono cálido atardecer pista
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.15);     // Rojo cálido
                    data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Verde leve
                    data[i + 2] = data[i + 2] * 0.9;            // Menos azul
                }
                break;

            case 'night-race':
                // Efecto nocturno con contraste elevado
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] * 0.8;
                    data[i + 1] = data[i + 1] * 0.85;
                    data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Azul nocturno
                }
                break;

            case 'podium':
                // Tono dorado brillante
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.2);
                    data[i + 1] = Math.min(255, data[i + 1] * 1.15);
                    data[i + 2] = data[i + 2] * 0.85;
                }
                break;

            case 'glow':
                // Brillo de piloto de F1
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] + 25);
                    data[i + 1] = Math.min(255, data[i + 1] + 25);
                    data[i + 2] = Math.min(255, data[i + 2] + 25);
                }
                break;

            case 'smooth':
                // Efecto suavizado estilo piel de porcelana (reducción ligera de ruido simulada)
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.05 + 10);
                    data[i + 1] = Math.min(255, data[i + 1] * 1.05 + 10);
                    data[i + 2] = Math.min(255, data[i + 2] * 1.05 + 10);
                }
                break;

            case 'contrast':
                // Alto contraste HD
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] < 128 ? data[i] * 0.8 : Math.min(255, data[i] * 1.2);
                    data[i + 1] = data[i + 1] < 128 ? data[i + 1] * 0.8 : Math.min(255, data[i + 1] * 1.2);
                    data[i + 2] = data[i + 2] < 128 ? data[i + 2] * 0.8 : Math.min(255, data[i + 2] * 1.2);
                }
                break;

            case 'pixel':
                // Simulación Retro Pixelado / Arcade
                const factor = 10;
                for (let y = 0; y < imageCanvas.height; y += factor) {
                    for (let x = 0; x < imageCanvas.width; x += factor) {
                        const index = (y * imageCanvas.width + x) * 4;
                        const r = data[index];
                        const g = data[index + 1];
                        const b = data[index + 2];

                        for (let py = 0; py < factor && (y + py) < imageCanvas.height; py++) {
                            for (let px = 0; px < factor && (x + px) < imageCanvas.width; px++) {
                                const pIndex = ((y + py) * imageCanvas.width + (x + px)) * 4;
                                data[pIndex] = r;
                                data[pIndex + 1] = g;
                                data[pIndex + 2] = b;
                            }
                        }
                    }
                }
                break;

            case 'hud':
                // HUD Telemetría (Tono verdoso futurista)
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] * 0.6;
                    data[i + 1] = Math.min(255, data[i + 1] * 1.4);
                    data[i + 2] = data[i + 2] * 0.6;
                }
                break;

            case 'glitch':
                // Desplazamiento digital simulado de DRS
                for (let i = 0; i < data.length; i += 8) {
                    if (i + 100 < data.length) {
                        data[i] = data[i + 4]; // Intercambio de canales
                    }
                }
                break;

            case 'cartoon':
                // Posterización para efecto caricatura
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.round(data[i] / 64) * 64;
                    data[i + 1] = Math.round(data[i + 1] / 64) * 64;
                    data[i + 2] = Math.round(data[i + 2] / 64) * 64;
                }
                break;

            case 'distortion':
            case 'neon-funny':
                // Efecto neón divertido
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = Math.min(255, data[i + 1] * 1.5);
                    data[i + 2] = 255 - data[i + 2];
                }
                break;

            case 'eye-gold':
                // Resaltar tonos dorados en general
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.3);
                    data[i + 1] = Math.min(255, data[i + 1] * 1.2);
                }
                break;

            case 'eye-ferrari':
                // Tono rojo intenso en los ojos (efecto simulado de color)
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 150 && data[i+1] > 150 && data[i+2] > 150) {
                        data[i] = 255;
                        data[i + 1] = 50;
                        data[i + 2] = 50;
                    }
                }
                break;

            case 'eye-blue':
                // Tono azul brillante
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 150 && data[i+1] > 150 && data[i+2] > 150) {
                        data[i] = 50;
                        data[i + 1] = 150;
                        data[i + 2] = 255;
                    }
                }
                break;
        }

        canvasContext.putImageData(imageData, 0, 0);

        // Agregar marca de agua oficial "Mille #16" en la esquina inferior
        canvasContext.font = "bold 16px 'Cinzel', serif";
        canvasContext.fillStyle = "#D4AF37";
        canvasContext.fillText("MILLE #16 - Leclerc", 20, imageCanvas.height - 20);
    }

    // 4. Guardar y Descargar Imagen
    downloadBtn.addEventListener('click', () => {
        if (!originalImage) {
            alert('Por favor carga una imagen primero.');
            return;
        }

        const link = document.createElement('a');
        link.download = 'Mille-CharlesLeclerc-F1.png';
        link.href = imageCanvas.toDataURL('image/png');
        link.click();
    });

    saveBtn.addEventListener('click', () => {
        if (!originalImage) {
            alert('Por favor carga una imagen primero.');
            return;
        }
        alert('¡Imagen guardada exitosamente en tu galería de perfil Mille!');
    });

    // 5. Carrusel de Ejemplos
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextBtn = document.querySelector('.carousel-btn.next');
    const prevBtn = document.querySelector('.carousel-btn.prev');

    let slideWidth = slides[0].getBoundingClientRect().width + 24; // ancho + gap
    let currentIndex = 0;

    window.addEventListener('resize', () => {
        slideWidth = slides[0].getBoundingClientRect().width + 24;
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < slides.length - (window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1)) {
            currentIndex++;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        } else {
            currentIndex = 0;
            track.style.transform = `translateX(0px)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
    });
});