const API =
window.location.origin;

async function cargarCatalogo() {

    try {

        const response =
            await fetch(
                `${API}/api/productos/public`
            );

        const productos =
            await response.json();

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

        const estado =

    producto.cantidad > 0

    ? '<span style="color:green;font-weight:bold;">En existencia</span>'

    : '<span style="color:red;font-weight:bold;">Agotado</span>';

    <p>${estado}</p>

    

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
                <strong>${estado}</strong>
            </p>

        </div>
        `;
    });
}

cargarCatalogo();