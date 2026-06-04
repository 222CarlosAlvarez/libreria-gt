// VERIFICAR LOGIN
function verificarLogin() {

    const token = localStorage.getItem('token');

    if (!token) {

        window.location.href = 'login.html';
    }
}

// VERIFICAR ADMIN
function verificarAdmin() {

    const role = localStorage.getItem('role');

    if (role !== 'admin') {

        alert('Acceso denegado');

        window.location.href =
            'dashboard-user.html';
    }
}

// CERRAR SESION
function logout() {

    localStorage.clear();

    window.location.href = 'login.html';
}

// IR AL PANEL SEGUN ROL
function irInicio() {

    const token = localStorage.getItem('token');

    const role = localStorage.getItem('role');

    // SI NO HAY LOGIN
    if (!token) {

        window.location.href = 'index.html';

        return;
    }

    // ADMIN
    if (role === 'admin') {

        window.location.href =
            'dashboard-admin.html';

    } else {

        // USUARIO
        window.location.href =
            'dashboard-user.html';
    }
}

// IR AL INDEX SIN CERRAR SESION
function irIndex() {

    window.location.href = 'index.html';
}

// VOLVER SEGUN EL ROL
function volverPanel() {

    const role = localStorage.getItem('role');

    if (role === 'admin') {

        window.location.href =
            'dashboard-admin.html';

    } else {

        window.location.href =
            'dashboard-user.html';
    }
}

// IR AL PANEL SEGUN EL ROL
function irPanel() {

    const role = localStorage.getItem('role');

    // ADMIN
    if (role === 'admin') {

        window.location.href =
            'dashboard-admin.html';

    } else {

        // USER
        window.location.href =
            'dashboard-user.html';
    }
}

