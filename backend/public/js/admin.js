async function crearUsuario() {

    const data = {

        nombre: document.getElementById('nuevoNombre').value,

        email: document.getElementById('nuevoEmail').value,

        password: document.getElementById('nuevoPassword').value,

        role: document.getElementById('nuevoRol').value
    };

    const response = await fetch(`${API}/api/users`, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            Authorization: token
        },

        body: JSON.stringify(data)
    });

    const result = await response.json();

    alert(result.message);

    cargarUsuarios();
}

const API = window.location.origin;

const token = localStorage.getItem('token');

// CARGAR USUARIOS
async function cargarUsuarios() {

    const response = await fetch(`${API}/api/users`, {
        headers: {
            Authorization: token
        }
    });

    const usuarios = await response.json();

    const div = document.getElementById('usuarios');

    div.innerHTML = '';

    usuarios.forEach(user => {

        div.innerHTML += `
        
        <div class="producto">

            <h3>${user.nombre}</h3>

            <p>${user.email}</p>

            <p>Rol: ${user.role}</p>

            <p>Bloqueado: ${user.blocked}</p>

            <button onclick="bloquear(${user.id})">
                Bloquear
            </button>

            <button onclick="desbloquear(${user.id})">
                Desbloquear
            </button>

            <button onclick="eliminar(${user.id})">
                Eliminar
            </button>

        </div>
        `;
    });
}

// BLOQUEAR
async function bloquear(id) {

    await fetch(`${API}/api/users/block/${id}`, {

        method: 'PUT',

        headers: {
            Authorization: token
        }
    });

    cargarUsuarios();
}

// DESBLOQUEAR
async function desbloquear(id) {

    await fetch(`${API}/api/users/unblock/${id}`, {

        method: 'PUT',

        headers: {
            Authorization: token
        }
    });

    cargarUsuarios();
}

// ELIMINAR
async function eliminar(id) {

    await fetch(`${API}/api/users/${id}`, {

        method: 'DELETE',

        headers: {
            Authorization: token
        }
    });

    cargarUsuarios();
}

cargarUsuarios();