const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const { Pool } = require('pg');

// SI EXISTE POSTGRESQL
if (process.env.DATABASE_URL) {

    const pool = new Pool({

        connectionString:
            process.env.DATABASE_URL,

        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('PostgreSQL conectado');

    module.exports = pool;

} else {

    // SQLITE LOCAL

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