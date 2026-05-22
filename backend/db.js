const sqlite3 =
    require('sqlite3').verbose();

const { Pool } =
    require('pg');

const path =
    require('path');

// RUTA BASE DE DATOS
const dbPath = path.join(
    __dirname,
    'database',
    'database.db'
);

// CONEXION SQLITE
let db;

// PRODUCCIÓN → PostgreSQL
if (process.env.DATABASE_URL) {

    const pool = new Pool({

        connectionString:
            process.env.DATABASE_URL,

        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log(
        'PostgreSQL conectado'
    );

    db = {

        query: (text, params) =>
            pool.query(text, params)
    };

} else {

    // LOCAL → SQLite

    db = new sqlite3.Database(
        dbPath,
        (err) => {

            if (err) {

                console.log(
                    err.message
                );

            } else {

                console.log(
                    'Base de datos SQLite conectada'
                );
            }
        }
    );
}

// TABLA USERS
db.run(`
CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nombre TEXT,

    email TEXT UNIQUE,

    password TEXT,

    role TEXT DEFAULT 'user',

    blocked INTEGER DEFAULT 0
)
`);

// TABLA PRODUCTOS
db.run(`
CREATE TABLE IF NOT EXISTS productos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nombre TEXT,

    marca TEXT,

    categoria TEXT,

    descripcion TEXT,

    precio REAL,

    cantidad INTEGER,

    imagen TEXT,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// EXPORTAR
module.exports = db;