const API = window.location.origin;

// CREAR ADMIN
async function crearAdmin() {

    try {

        const clave = document.getElementById('adminKey').value;

        if (clave !== '123456') {

            alert('Clave maestra incorrecta');

            return;
        }

        const data = {

            nombre: document.getElementById('nombre').value,

            email: document.getElementById('email').value,

            password: document.getElementById('password').value,

            adminKey: clave
        };

        const response = await fetch(`${API}/api/auth/register`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        alert(result.message);

    } catch (error) {

        console.log(error);

        alert('Error');

    }
}

// LOGIN
async function login() {

    try {

        const data = {

            email: document.getElementById('loginEmail').value,

            password: document.getElementById('loginPassword').value
        };

        const response = await fetch(`${API}/api/auth/login`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.token) {

            localStorage.setItem('token', result.token);

            localStorage.setItem('role', result.role);

            localStorage.setItem('nombre', result.nombre);

            localStorage.setItem('email', result.email);

            if (result.role === 'admin') {

                window.location.href = 'dashboard-admin.html';

            } else {

                window.location.href = 'dashboard-user.html';

            }

        } else {

            alert(result.message);

        }

    } catch (error) {

        console.log(error);

        alert('Error login');

    }
}