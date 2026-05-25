const API = window.location.origin;

const token = localStorage.getItem('token');

async function cargarProductos() {

    try {

        const response = await fetch(
            `${API}/api/productos`,
            {
                headers: {
                    Authorization: token
                }
            }
        );

        const productos = await response.json();

        // ⚠️ Validación por seguridad
        if (!Array.isArray(productos)) {
            console.log('Respuesta inválida:', productos);
            return;
        }

        mostrarProductos(productos);

        // 📦 Total de productos
        const totalEl = document.getElementById('totalProductos');
        if (totalEl) {
            totalEl.innerText = productos.length;
        }

        // 📊 Stock total (suma de cantidades)
        const stockTotal = productos.reduce((total, p) => {
            return total + (parseInt(p.cantidad) || 0);
        }, 0);

        const stockEl = document.getElementById('stockTotal');
        if (stockEl) {
            stockEl.innerText = stockTotal;
        }

    } catch (error) {

        console.log('Error cargando productos:', error);
    }
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

router.get(
    '/buscar',
    verifyToken,
    async (req, res) => {

        try {

            const { q, categoria } = req.query;

            let productos;

            // =========================
            // FILTRO POR CATEGORIA
            // =========================
            if (categoria && categoria !== 'todas') {

                productos = await all(

                    `
                    SELECT * FROM productos
                    WHERE LOWER(categoria)=LOWER(?)
                    `,

                    `
                    SELECT * FROM productos
                    WHERE LOWER(categoria)=LOWER($1)
                    `,

                    [categoria]
                );

            // =========================
            // BUSQUEDA POR NOMBRE
            // =========================
            } else if (q) {

                productos = await all(

                    `
                    SELECT * FROM productos
                    WHERE LOWER(nombre) LIKE LOWER(?)
                    `,

                    `
                    SELECT * FROM productos
                    WHERE LOWER(nombre) LIKE LOWER($1)
                    `,

                    [`%${q}%`]
                );

            // =========================
            // TODOS
            // =========================
            } else {

                productos = await all(

                    `
                    SELECT * FROM productos
                    `,

                    `
                    SELECT * FROM productos
                    `,

                    []
                );
            }

            res.json(productos);

        } catch (err) {

            console.log(err);

            res.status(500).json({

                mensaje: 'Error buscando productos'
            });
        }
    }
);

async function buscarProductos() {

    const q = document.getElementById('buscador').value;
    const categoria = document.getElementById('categoria').value;

    const token = localStorage.getItem('token');

    const res = await fetch(
        `/productos/buscar?q=${q}&categoria=${categoria}`,
        {
            headers: {
                Authorization: token
            }
        }
    );

    const data = await res.json();

    renderProductos(data); // tu función que dibuja la tabla
    actualizarStats(data);
}

function renderProductos(productos) {

    const tbody = document.getElementById('tabla-productos');

    // LIMPIAR TABLA
    tbody.innerHTML = '';

    // SI NO HAY PRODUCTOS
    if (!productos || productos.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No hay productos
                </td>
            </tr>
        `;
        return;
    }

    // RECORRER PRODUCTOS
    productos.forEach(p => {

        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${p.sku || 'N/A'}</td>
            <td>${p.nombre || ''}</td>
            <td>${p.marca || ''}</td>
            <td>${p.categoria || ''}</td>
            <td>Q ${p.precio || 0}</td>
            <td>${p.cantidad || 0}</td>

            <td>
                <button onclick="editarProducto('${p.id}')">
                    Editar
                </button>

                <button onclick="eliminarProducto('${p.id}')">
                    Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

function actualizarStats(productos) {

    const total = productos.length;

    const stock = productos.reduce((acc, p) => {
        return acc + (parseInt(p.cantidad) || 0);
    }, 0);

    document.getElementById('totalProductos').innerText = total;
    document.getElementById('stockTotal').innerText = stock; 
}

document.addEventListener('DOMContentLoaded', () => {
    buscarProductos();
});


cargarProductos();