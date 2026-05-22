const db = require('./db');

const { Pool } = require('pg');


// ============================
// POSTGRESQL
// ============================

const isPostgres =

    !!process.env.DATABASE_URL;


let pool = null;


if (isPostgres) {

    pool = new Pool({

        connectionString:
            process.env.DATABASE_URL,

        ssl: {

            rejectUnauthorized: false
        }
    });

    console.log(
        'PostgreSQL conectado'
    );
}


// ============================
// GET
// ============================

async function get(

    sqliteSQL,

    postgresSQL,

    params = []
) {

    if (isPostgres) {

        const result =
            await pool.query(
                postgresSQL,
                params
            );

        return result.rows[0];
    }

    return new Promise(

        (resolve, reject) => {

            db.get(

                sqliteSQL,

                params,

                (err, row) => {

                    if (err) {

                        reject(err);

                    } else {

                        resolve(row);
                    }
                }
            );
        }
    );
}


// ============================
// ALL
// ============================

async function all(

    sqliteSQL,

    postgresSQL,

    params = []
) {

    if (isPostgres) {

        const result =
            await pool.query(
                postgresSQL,
                params
            );

        return result.rows;
    }

    return new Promise(

        (resolve, reject) => {

            db.all(

                sqliteSQL,

                params,

                (err, rows) => {

                    if (err) {

                        reject(err);

                    } else {

                        resolve(rows);
                    }
                }
            );
        }
    );
}


// ============================
// RUN
// ============================

async function run(

    sqliteSQL,

    postgresSQL,

    params = []
) {

    if (isPostgres) {

        return await pool.query(

            postgresSQL,

            params
        );
    }

    return new Promise(

        (resolve, reject) => {

            db.run(

                sqliteSQL,

                params,

                function(err) {

                    if (err) {

                        reject(err);

                    } else {

                        resolve(this);
                    }
                }
            );
        }
    );
}


// ============================
// EXPORTAR
// ============================

module.exports = {

    get,

    all,

    run,

    isPostgres
};