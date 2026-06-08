const API =
window.location.origin;

let productosGlobal = [];

let letraSeleccionada = 'TODOS';

async function cargarCatalogo() {

    try {

        const response =
            await fetch(
                `${API}/api/productos/public`
            );

        const productos =
            await response.json();

        productosGlobal = productos;

        cargarCategorias(productos);

        mostrarCatalogo(productos);

    } catch(error) {

        console.log(error);
    }
}

function mostrarCatalogo(productos) {

    const catalogo =
        document.getElementById('catalogo');

    catalogo.innerHTML = '';

    productos.forEach(producto => {

        document.getElementById(
    'contadorProductos'
).innerHTML =

`Productos encontrados:
<b>${productos.length}</b>`;

        const estado =

            producto.cantidad > 0

            ? '<span style="color:green;font-weight:bold;">En existencia</span>'

            : '<span style="color:red;font-weight:bold;">Agotado</span>';

        catalogo.innerHTML += `

        <div class="producto-card">

            <img
    src="${producto.imagen || 'https://via.placeholder.com/250'}"
    onclick="abrirImagen(this.src)"
    style="cursor:pointer;"
>

            <h3>${producto.nombre}</h3>

            <p class="descripcion-corta">

    ${
        producto.descripcion.length > 80

        ?

        producto.descripcion.substring(0,80)
        + '...'

        :

        producto.descripcion
    }

</p>

<button
    onclick="verDescripcion(
        \`${producto.descripcion}\`
    )"
>
    Ver más
</button>

            <p>
                Categoría:
                ${producto.categoria}
            </p>

            <p>
                Precio:
                Q${producto.precio}
            </p>

            <p>
                ${estado}
            </p>

        </div>

        `;
    });
}

function cargarCategorias(productos) {

    const select =
        document.getElementById(
            'categoriaFiltro'
        );

    const categorias = [

        ...new Set(

            productos.map(
                p => p.categoria
            )
        )
    ];

    categorias.sort();

    categorias.forEach(categoria => {

        select.innerHTML += `

            <option value="${categoria}">
                ${categoria}
            </option>

        `;
    });
}


function filtrarProductos() {

    const texto =

        document
        .getElementById('buscar')
        .value
        .toLowerCase();

    const categoria =

        document
        .getElementById('categoriaFiltro')
        .value;

    const coincideLetra = (nombre) => {

    if (letraSeleccionada === 'TODOS')
        return true;

    if (letraSeleccionada === '#')
        return /^[0-9]/.test(nombre);

    return nombre
        .toUpperCase()
        .startsWith(letraSeleccionada);
};

    const filtrados =

        productosGlobal.filter(p => {

            const coincideNombre =

                p.nombre
                .toLowerCase()
                .includes(texto);

            const coincideCategoria =

                categoria === ''

                ||

                p.categoria === categoria;

            return (

    coincideNombre &&

    coincideCategoria &&

    coincideLetra(p.nombre)
);
        });

    mostrarCatalogo(filtrados);
}

let zoom = 1;

function abrirImagen(src) {

    document.getElementById(
        'visorImagen'
    ).style.display = 'flex';

    document.getElementById(
        'imagenGrande'
    ).src = src;

    zoom = 1;

    document.getElementById(
        'imagenGrande'
    ).style.transform =
        `scale(${zoom})`;
}

function cerrarImagen() {

    document.getElementById(
        'visorImagen'
    ).style.display = 'none';
}

document.addEventListener(
    'wheel',
    function(e) {

        const visor =

            document.getElementById(
                'visorImagen'
            );

        if (
            visor.style.display !== 'flex'
        ) return;

        e.preventDefault();

        if (e.deltaY < 0) {

            zoom += 0.1;

        } else {

            zoom -= 0.1;
        }

        if (zoom < 0.5)
            zoom = 0.5;

        if (zoom > 5)
            zoom = 5;

        document.getElementById(
            'imagenGrande'
        ).style.transform =

            `scale(${zoom})`;

    },
    { passive: false }
);

function verDescripcion(texto) {

    document.getElementById(
        'textoDescripcion'
    ).innerText = texto;

    document.getElementById(
        'modalDescripcion'
    ).style.display = 'flex';
}

function cerrarDescripcion() {

    document.getElementById(
        'modalDescripcion'
    ).style.display = 'none';
}

window.onclick = function(event) {

    const modal =
        document.getElementById(
            'modalDescripcion'
        );

    if (event.target === modal) {

        modal.style.display = 'none';
    }
}

function filtrarLetra(letra) {

    letraSeleccionada = letra;

    filtrarProductos();
}

cargarCatalogo();