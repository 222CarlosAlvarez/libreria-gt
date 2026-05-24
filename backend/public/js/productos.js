const API = window.location.origin;

const token = localStorage.getItem('token');

async function cargarProductos() {

    const response = await fetch(

        `${API}/api/productos`,

        {

            headers: {

                Authorization: token
            }
        }
    );

    const productos = await response.json();

    mostrarProductos(productos);
}

function mostrarProductos(productos) {

    const contenedor =
        document.getElementById('productos');

    contenedor.innerHTML = '';

    productos.forEach(producto => {

        contenedor.innerHTML += `

            <div class="producto-card">

                <img
    src="${producto.imagen || 'https://via.placeholder.com/250'}"
    onclick="verImagen(this.src)"
    style="cursor:pointer;"
>

                <h3>${producto.nombre}</h3>

                <p><strong>SKU:</strong> ${producto.sku}</p>

                <p>
                    <strong>Categoría:</strong>
                    ${producto.categoria}
                </p>

                <p>
                    <strong>Marca:</strong>
                    ${producto.marca}
                </p>

                <p>
                    <strong>Precio:</strong>
                    Q${producto.precio}
                </p>

                <p>
                    <strong>Stock:</strong>
                    ${producto.cantidad}
                </p>

            </div>
        `;
    });
}

// ABRIR IMAGEN EN GRANDE

let zoom = 1;
let posX = 0;
let posY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

// ABRIR IMAGEN
function verImagen(src) {

    const modal =
        document.getElementById('modalImagen');

    const img =
        document.getElementById('imgZoom');

    img.src = src;

    zoom = 1;
    posX = 0;
    posY = 0;

    img.style.transform =
        `translate(0px, 0px) scale(1)`;

    modal.style.display = 'flex';
}

// CERRAR
function cerrarImagen() {

    document.getElementById('modalImagen')
        .style.display = 'none';
}

// ZOOM CON RUEDA
document.addEventListener('wheel', function (e) {

    const modal =
        document.getElementById('modalImagen');

    const img =
        document.getElementById('imgZoom');

    if (modal.style.display === 'flex') {

        e.preventDefault();

        if (e.deltaY < 0) {

            zoom += 0.1;

        } else {

            zoom -= 0.1;
        }

        if (zoom < 1) zoom = 1;

        if (zoom > 4) zoom = 4;

        updateTransform();
    }

}, { passive: false });

// INICIO DRAG
document.addEventListener('mousedown', function (e) {

    const modal =
        document.getElementById('modalImagen');

    if (modal.style.display === 'flex') {

        isDragging = true;

        startX = e.clientX - posX;

        startY = e.clientY - posY;

        document.getElementById('imgZoom')
            .style.cursor = 'grabbing';
    }
});

// MOVIMIENTO
document.addEventListener('mousemove', function (e) {

    if (!isDragging) return;

    posX = e.clientX - startX;

    posY = e.clientY - startY;

    updateTransform();
});

// SOLTAR
document.addEventListener('mouseup', function () {

    isDragging = false;

    const img =
        document.getElementById('imgZoom');

    img.style.cursor = 'grab';
});

// ACTUALIZAR TRANSFORMACION
function updateTransform() {

    const img =
        document.getElementById('imgZoom');

    img.style.transform =
        `translate(${posX}px, ${posY}px) scale(${zoom})`;
}

//es nueva funcion de resets
function resetZoom(e) {

    // evitar que cierre modal
    e.stopPropagation();

    zoom = 1;
    posX = 0;
    posY = 0;

    const img =
        document.getElementById('imgZoom');

    img.style.transform =
        `translate(0px, 0px) scale(1)`;
}

async function exportarExcel() {

    try {

        const token =
            localStorage.getItem('token');

        const response = await fetch(

            '/api/productos/export/excel',

            {
                method: 'GET',

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                'Error descargando Excel'
            );
        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const a =
            document.createElement('a');

        a.href = url;

        a.download =
            'productos.xlsx';

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.log(error);

        alert(
            'Error exportando Excel'
        );
    }
}

async function exportarPDF() {

    try {

        const token =
            localStorage.getItem('token');

        const response = await fetch(

            '/api/productos/export/pdf',

            {
                method: 'GET',

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                'Error exportando PDF'
            );
        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const a =
            document.createElement('a');

        a.href = url;

        a.download =
            'inventario.pdf';

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.log(error);

        alert(
            'Error exportando PDF'
        );
    }
}

// IMPORTAR EXCEL
async function importarExcel() {

    const archivo =
        document.getElementById('excelFile').files[0];

    if (!archivo) {

        alert('Selecciona un archivo Excel');

        return;
    }

    const formData = new FormData();

    formData.append('excel', archivo);

    try {

        const response = await fetch(
            '/api/productos/importar-excel',
            {
                method: 'POST',

                headers: {
                    Authorization:
                        localStorage.getItem('token')
                },

                body: formData
            }
        );

        const result =
            await response.json();

        alert(result.message);

        cargarProductos();

    } catch (error) {

        console.log(error);

        alert('Error importando Excel');
    }
}

cargarProductos();