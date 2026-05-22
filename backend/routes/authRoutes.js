const express = require('express');
const router = express.Router();

const {
    all,
    get,
    run,
    isPostgres
} = require('../dbHelpers');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// REGISTRO
// REGISTRO
router.post('/register', async (req, res) => {

    try {

        const {
            nombre,
            email,
            password,
            adminKey
        } = req.body;

        const hashedPassword =
            await bcrypt.hash(password, 10);

        let role = 'user';

        if (adminKey === '123456') {

            role = 'admin';
        }

        await run(

            // SQLITE
            `
            INSERT INTO users
            (
                nombre,
                email,
                password,
                role
            )
            VALUES(?,?,?,?)
            `,

            // POSTGRESQL
            `
            INSERT INTO users
            (
                nombre,
                email,
                password,
                role
            )
            VALUES($1,$2,$3,$4)
            `,

            [
                nombre,
                email,
                hashedPassword,
                role
            ]
        );

        res.json({

            message:
                'Usuario registrado correctamente'
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({

            message:
                'Correo ya registrado'
        });
    }
});
// LOGIN
// LOGIN
router.post('/login', async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user = await get(

            // SQLITE
            `
            SELECT * FROM users
            WHERE email = ?
            `,

            // POSTGRESQL
            `
            SELECT * FROM users
            WHERE email = $1
            `,

            [email]
        );

        if (!user) {

            return res.status(404).json({

                message:
                    'Usuario no encontrado'
            });
        }

        if (
            user.blocked === 1
            ||
            user.blocked === true
        ) {

            return res.status(403).json({

                message:
                    'Usuario bloqueado'
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {

            return res.status(401).json({

                message:
                    'Contraseña incorrecta'
            });
        }

        const token = jwt.sign(

            {
                id: user.id,
                role: user.role
            },

            'SECRET_KEY_TECHNOVA',

            {
                expiresIn: '8h'
            }
        );

        res.json({

            token,

            role:
                user.role,

            nombre:
                user.nombre
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            message:
                'Error servidor'
        });
    }
});

module.exports = router;