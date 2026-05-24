INSERT INTO productos (
    id,
    nombre,
    marca,
    categoria,
    descripcion,
    precio,
    cantidad,
    imagen,
    fecha_creacion,
    fecha_actualizacion
  )
VALUES (
    id:integer,
    'nombre:text',
    'marca:text',
    'categoria:text',
    'descripcion:text',
    precio:real,
    cantidad:integer,
    'imagen:text',
    'fecha_creacion:timestamp without time zone',
    'fecha_actualizacion:timestamp without time zone'
  );
<<<<<<< HEAD
=======

ALTER TABLE productos ADD COLUMN sku TEXT UNIQUE;
>>>>>>> 47767a3 (fix import excel)
