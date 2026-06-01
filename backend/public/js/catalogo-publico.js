const API =
window.location.origin;

let productosGlobal = [];

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
            >

            <h3>${producto.nombre}</h3>

            <p>
                ${producto.descripcion}
            </p>

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
                coincideCategoria
            );
        });

    mostrarCatalogo(filtrados);
}

cargarCatalogo();