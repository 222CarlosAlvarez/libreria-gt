const API = window.location.origin;

const token = localStorage.getItem('token');

const role = localStorage.getItem('role');


let productosGlobal = [];

// CARGAR CATEGORIAS DINAMICAS
function cargarCategorias(productos) {

    // FILTRO BUSQUEDA
    const filtro =
        document.getElementById('filtroCategoria');

    // SELECT FORMULARIO
    const selectCategoria =
        document.getElementById('categoriaExistente');

    // LIMPIAR
    filtro.innerHTML = `
    
        <option value="todas">
            Todas las categorías
        </option>
    `;

    selectCategoria.innerHTML = `
    
        <option value="">
            Seleccionar categoría
        </option>
    `;

    // CATEGORIAS UNICAS
    const categorias = [];

    productos.forEach(producto => {

        if (
            producto.categoria &&
            !categorias.includes(producto.categoria)
        ) {

            categorias.push(producto.categoria);
        }
    });

    // CREAR OPCIONES
    categorias.forEach(categoria => {

        // FILTRO
        filtro.innerHTML += `
        
            <option value="${categoria}">
                ${categoria}
            </option>
        `;

        // FORMULARIO
        selectCategoria.innerHTML += `
        
            <option value="${categoria}">
                ${categoria}
            </option>
        `;
    });
}

// CARGAR PRODUCTOS
async function cargarProductos() {

    try {

        const response = await fetch(`${API}/api/productos`, {
            headers: {
                Authorization: token
            }
        });

        const productos = await response.json();

        productosGlobal = productos;

        mostrarProductos(productos);

        mostrarTablaInventario(productos);

        cargarCategorias(productos);

    } catch (error) {

        console.log(error);

    }
}

// MOSTRAR PRODUCTOS
function mostrarProductos(productos) {

    const div = document.getElementById('productos');

    div.innerHTML = '';

    productos.forEach(producto => {

        div.innerHTML += `
        
        <div class="producto">

            <h3>${producto.nombre}</h3>

            <img
    src="${
        producto.imagen
        ?
        producto.imagen
        :
        'https://via.placeholder.com/250'
    }"

    onclick="verImagen(this.src)"

    style="cursor:pointer;"
>

            <p>${producto.descripcion}</p>

            <p>Precio: Q${producto.precio}</p>

            <p>Stock: ${producto.cantidad}</p>

            <button onclick="editarProducto(${producto.id})">
                Editar
            </button>

            ${role === 'admin' ? `
            
            <button onclick="eliminarProducto(${producto.id})">
                Eliminar
            </button>

            ` : ''}

        </div>
        `;
    });
}

function formatearFecha(fecha) {

    if (!fecha) {

        return 'Sin fecha';
    }

    const nuevaFecha = new Date(
        fecha.replace(' ', 'T')
    );

    return nuevaFecha.toLocaleString(
        'es-GT',
        {
            timeZone: 'America/Guatemala'
        }
    );
}

function mostrarTablaInventario(productos) {

    const tbody =
        document.getElementById('tablaBody');

    tbody.innerHTML = '';

    // ORDENAR ALFABETICAMENTE
    productos.sort((a, b) =>

        a.nombre.localeCompare(b.nombre)
    );

    productos.forEach((producto, index) => {

        let estado = '';

        // ESTADOS STOCK
        if (producto.cantidad <= 0) {

            estado =
                '<span class="stock-agotado">Agotado</span>';

        } else if (producto.cantidad <= 3) {

            estado =
                '<span class="stock-bajo">Bajo Stock</span>';

        } else {

            estado =
                '<span class="stock-ok">Disponible</span>';
        }

        tbody.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${producto.nombre}</td>

                <td>${producto.categoria}</td>

                <td>${producto.marca}</td>

                <td>Q${producto.precio}</td>

                <td>${producto.cantidad}</td>

                <td>${estado}</td>

                <td>
    ${formatearFecha(producto.fecha_creacion)}
</td>

<td>
    ${formatearFecha(producto.fecha_actualizacion)}
</td>

                <td>

                    <button
                        onclick="editarProducto(${producto.id})"
                    >
                        Editar
                    </button>

                    ${
                        role === 'admin'

                        ?

                        `
                        <button
                            onclick="eliminarProducto(${producto.id})"
                        >
                            Eliminar
                        </button>
                        `

                        :

                        ''
                    }

                </td>

            </tr>
        `;
    });
}

// FILTRAR
function filtrarProductos() {

    const texto = document
        .getElementById('busqueda')
        .value
        .toLowerCase();

    const categoria = document
        .getElementById('filtroCategoria')
        .value;

    // FILTRAR
    const filtrados = productosGlobal.filter(producto => {

        // BUSCAR POR NOMBRE
        const coincideNombre =

            producto.nombre
            .toLowerCase()
            .includes(texto);

        // BUSCAR POR CATEGORIA
        const coincideCategoria =

            categoria === 'todas'

            ||

            producto.categoria === categoria;

        return coincideNombre &&
               coincideCategoria;
    });

    // ACTUALIZAR CATALOGO
    mostrarProductos(filtrados);

    // ACTUALIZAR TABLA
    mostrarTablaInventario(filtrados);
}

// AGREGAR
async function agregarProducto() {

    const sku = document.getElementById('sku').value.trim().toUpperCase();

    const skuInput = document.getElementById('sku').value.trim();

const sku = skuInput
    ? skuInput.toUpperCase()
    : 'SKU-' + Date.now();

    const nombre =
        document.getElementById('nombre').value;

    const marca =
        document.getElementById('marca').value;

    const categoriaExistente =
        document.getElementById('categoriaExistente').value;

    const nuevaCategoria =
        document.getElementById('nuevaCategoria').value;

    const descripcion =
        document.getElementById('descripcion').value;

    const precio =
        document.getElementById('precio').value;

    const cantidad =
        document.getElementById('cantidad').value;

    const imagenURL =
        document.getElementById('imagen').value;

    const archivoImagen =
        document.getElementById('archivoImagen').files[0];

    const tipoMovimiento =
        document.getElementById('tipoMovimiento').value;

    // CATEGORIA FINAL
    const categoria =
        nuevaCategoria || categoriaExistente;

    // FORM DATA
    const formData = new FormData();

    formData.append('sku', sku || '');

    formData.append('nombre', nombre);

    formData.append('marca', marca);

    formData.append('categoria', categoria);

    formData.append('descripcion', descripcion);

    formData.append('precio', precio);

    formData.append('cantidad', cantidad);

    formData.append('tipoMovimiento', tipoMovimiento);

    // URL IMAGEN
    formData.append('imagenURL', imagenURL);

    // ARCHIVO IMAGEN
    if (archivoImagen) {

        formData.append(
            'imagen',
            archivoImagen
        );
    }

    if (!sku) {
    alert('El SKU es obligatorio');
    return;
}

    const response = await fetch(
        '/api/productos',
        {

            method: 'POST',

            headers: {

                Authorization:
                    localStorage.getItem('token')
            },

            body: formData
        }
    );

    const data =
        await response.json();

    alert(data.mensaje);

    cargarProductos();
}

// EDITAR
function editarProducto(id) {

    const producto = productosGlobal.find(
        p => p.id === id
    );

    // ABRIR MODAL
    document.getElementById('modalEditar')
        .style.display = 'block';

    // LLENAR DATOS
    document.getElementById('editId').value =
        producto.id;

    document.getElementById('editNombre').value =
        producto.nombre;

    document.getElementById('editMarca').value =
        producto.marca;

    document.getElementById('editCategoria').value =
        producto.categoria;

    document.getElementById('editDescripcion').value =
        producto.descripcion;

    document.getElementById('editPrecio').value =
        producto.precio;

    document.getElementById('editCantidad').value =
        producto.cantidad;

    document.getElementById('editImagen').value =
        producto.imagen;
}

async function guardarEdicion() {

    const id =
        document.getElementById('editId').value;

    const response = await fetch(

        `${API}/api/productos/${id}`,

        {

            method: 'PUT',

            headers: {

                'Content-Type': 'application/json',

                Authorization: token
            },

            body: JSON.stringify({

                nombre:
                    document.getElementById(
                        'editNombre'
                    ).value,

                marca:
                    document.getElementById(
                        'editMarca'
                    ).value,

                categoria:
                    document.getElementById(
                        'editCategoria'
                    ).value,

                descripcion:
                    document.getElementById(
                        'editDescripcion'
                    ).value,

                precio:
                    document.getElementById(
                        'editPrecio'
                    ).value,

                cantidad:
                    document.getElementById(
                        'editCantidad'
                    ).value,

                imagen:
                    document.getElementById(
                        'editImagen'
                    ).value
            })
        }
    );

    const result = await response.json();

    alert(result.message);

    cerrarModal();

    cargarProductos();
}

function cerrarModal() {

    document.getElementById('modalEditar')
        .style.display = 'none';
}
// ELIMINAR
async function eliminarProducto(id) {

    const response = await fetch(`${API}/api/productos/${id}`, {

        method: 'DELETE',

        headers: {
            Authorization: token
        }
    });

    const result = await response.json();

    alert(result.message);

    cargarProductos();
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

cargarProductos();