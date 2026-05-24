CREATE TABLE IF NOT EXISTS users (

    id SERIAL PRIMARY KEY,

    nombre TEXT,

    email TEXT UNIQUE,

    password TEXT,

    role TEXT DEFAULT 'user',

    blocked BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS productos (

    id SERIAL PRIMARY KEY,

    sku TEXT UNIQUE,

    nombre TEXT,

    marca TEXT,

    categoria TEXT,

    descripcion TEXT,

    precio REAL,

    cantidad INTEGER,

    imagen TEXT,

    fecha_creacion TIMESTAMP,

    fecha_actualizacion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (

    id SERIAL PRIMARY KEY,

    nombre TEXT,

    marca TEXT,

    categoria TEXT,

    descripcion TEXT,

    precio REAL,

    cantidad INTEGER,

    imagen TEXT,

    fecha_creacion TIMESTAMP,

    fecha_actualizacion TIMESTAMP
);