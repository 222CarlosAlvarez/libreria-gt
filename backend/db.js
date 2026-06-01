const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Pool } = require('pg');

// ============================
// POSTGRESQL
// ============================

if (process.env.DATABASE_URL) {

    const pool = new Pool({

        connectionString:
            process.env.DATABASE_URL,

        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('PostgreSQL conectado');

    // CREAR TABLAS AUTOMATICAMENTE

    (async () => {

        try {

            await pool.query(`

                CREATE TABLE IF NOT EXISTS users (

                    id SERIAL PRIMARY KEY,

                    nombre VARCHAR(255),

                    email VARCHAR(255) UNIQUE,

                    password TEXT,

                    role VARCHAR(50) DEFAULT 'user',

                    blocked INTEGER DEFAULT 0
                )

            `);

            await pool.query(`

                CREATE TABLE IF NOT EXISTS productos (

                    id SERIAL PRIMARY KEY,

                    sku VARCHAR(100),

                    nombre VARCHAR(255),

                    marca VARCHAR(255),

                    categoria VARCHAR(255),

                    descripcion TEXT,

                    precio NUMERIC(10,2) DEFAULT 0,

                    cantidad INTEGER DEFAULT 0,

                    imagen TEXT,

                    fecha_creacion TIMESTAMP,

                    fecha_actualizacion TIMESTAMP
                )

            `);

            console.log('Tablas PostgreSQL creadas');

        } catch (error) {

            console.log(error);
        }

    })();

    module.exports = pool;

} else {

    // ============================
    // SQLITE
    // ============================

    const dbPath = path.join(
        __dirname,
        'database',
        'database.db'
    );

    const db = new sqlite3.Database(
        dbPath,
        (err) => {

            if (err) {

                console.log(err.message);

            } else {

                console.log(
                    'Base de datos SQLite conectada'
                );
            }
        }
    );

    module.exports = db;
}