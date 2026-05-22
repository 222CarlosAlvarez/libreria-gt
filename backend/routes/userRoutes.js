const express = require('express');
const router = express.Router();

const {
    all,
    run,
    isPostgres
} = require('../dbHelpers');

const verifyToken = require('../middleware/authMiddleware');

const bcrypt = require('bcryptjs');


// VER USUARIOS
router.get('/', verifyToken, async (req, res) => {

    try {

        if (req.user.role !== 'admin') {

            return res.status(403).json({
                message: 'Solo administrador'
            });
        }

        const usuarios = await all(

            // SQLITE
            `
            SELECT
            id,
            nombre,
            email,
            role,
            blocked
            FROM users
            `,

            // POSTGRESQL
            `
            SELECT
            id,
            nombre,
            email,
            role,
            blocked
            FROM users
            `,

            []
        );

        res.json(usuarios);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Error obteniendo usuarios'
        });
    }
});


// CREAR USUARIO
router.post('/', verifyToken, async (req, res) => {

    try {

        if (req.user.role !== 'admin') {

            return res.status(403).json({
                message: 'Solo administrador'
            });
        }

        const {
            nombre,
            email,
            password,
            role
        } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        await run(

            // SQLITE
            `
            INSERT INTO users
            (nombre,email,password,role)
            VALUES(?,?,?,?)
            `,

            // POSTGRESQL
            `
            INSERT INTO users
            (nombre,email,password,role)
            VALUES($1,$2,$3,$4)
            `,

            [
                nombre,
                email,
                hashed,
                role
            ]
        );

        res.json({
            message: 'Usuario creado'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Error creando usuario'
        });
    }
});


// BLOQUEAR
router.put('/block/:id', verifyToken, async (req, res) => {

    try {

        if (req.user.role !== 'admin') {

            return res.status(403).json({
                message: 'Solo administrador'
            });
        }

        await run(

            // SQLITE
            `
            UPDATE users
            SET blocked = 1
            WHERE id=?
            `,

            // POSTGRESQL
            `
            UPDATE users
            SET blocked = true
            WHERE id=$1
            `,

            [req.params.id]
        );

        res.json({
            message: 'Usuario bloqueado'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Error bloqueando usuario'
        });
    }
});


// DESBLOQUEAR
router.put('/unblock/:id', verifyToken, async (req, res) => {

    try {

        if (req.user.role !== 'admin') {

            return res.status(403).json({
                message: 'Solo administrador'
            });
        }

        await run(

            // SQLITE
            `
            UPDATE users
            SET blocked = 0
            WHERE id=?
            `,

            // POSTGRESQL
            `
            UPDATE users
            SET blocked = false
            WHERE id=$1
            `,

            [req.params.id]
        );

        res.json({
            message: 'Usuario desbloqueado'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Error desbloqueando usuario'
        });
    }
});


// ELIMINAR USUARIO
router.delete('/:id', verifyToken, async (req, res) => {

    try {

        if (req.user.role !== 'admin') {

            return res.status(403).json({
                message: 'Solo administrador'
            });
        }

        await run(

            // SQLITE
            `
            DELETE FROM users
            WHERE id=?
            `,

            // POSTGRESQL
            `
            DELETE FROM users
            WHERE id=$1
            `,

            [req.params.id]
        );

        res.json({
            message: 'Usuario eliminado'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Error eliminando usuario'
        });
    }
});

module.exports = router;