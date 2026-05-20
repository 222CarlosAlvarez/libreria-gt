const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
// OBTENER PRODUCTOS
router.get('/', verifyToken, (req, res) => {
db.all('SELECT * FROM productos', [], (err, rows) => {
if (err) {
return res.status(500).json(err);
}
res.json(rows);
});
});
// AGREGAR PRODUCTO
router.post(
    '/',
    verifyToken,
    upload.single('imagen'),
    (req, res) => {

        const {
            nombre,
            marca,
            categoria,
            descripcion,
            precio,
            cantidad,
            tipoMovimiento,
            imagenURL
        } = req.body;

        // IMAGEN FINAL
        let imagen = imagenURL;

        // SI SUBEN ARCHIVO
        if (req.file) {

            imagen =
                `/uploads/${req.file.filename}`;
        }

        const fechaGuatemala = new Date()
    .toLocaleString(
        'sv-SE',
        {
            timeZone:
                'America/Guatemala'
        }
    )
    .replace(',', '');

const verificarSQL = `
    SELECT * FROM productos
    WHERE LOWER(nombre)=LOWER(?)
`;

        const sql = `
            INSERT INTO productos
(
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
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.get(
    verificarSQL,
    [nombre],
    (err, productoExistente) => {

        if (err) {

            return res.status(500).json({
                mensaje:
                    'Error verificando producto'
            });
        }

        // SI EL PRODUCTO YA EXISTE
        if (productoExistente) {

            const nuevaCantidad =

                tipoMovimiento === 'salida'

                ?

                productoExistente.cantidad -
                parseInt(cantidad)

                :

                productoExistente.cantidad +
                parseInt(cantidad);

            const updateSQL = `

                UPDATE productos

                SET

                cantidad=?,

                precio=?,

                marca=?,

                categoria=?,

                descripcion=?,

                imagen=?,

                fecha_actualizacion=?

                WHERE id=?
            `;

            db.run(
                updateSQL,
                [
                    nuevaCantidad,
                    precio,
                    marca,
                    categoria,
                    descripcion,
                    imagen,
                    fechaGuatemala,
                    productoExistente.id
                ],
                function(err) {

                    if (err) {

                        return res
                        .status(500)
                        .json({
                            mensaje:
                            'Error actualizando producto'
                        });
                    }

                    return res.json({

                        mensaje:
                        'Producto existente actualizado automáticamente'
                    });
                }
            );

        } else {

            // CREAR NUEVO PRODUCTO

            db.run(
                sql,
                [
                    nombre,
                    marca,
                    categoria,
                    descripcion,
                    precio,
                    cantidad,
                    imagen,
                    fechaGuatemala,
                    fechaGuatemala
                ],
                function(err) {

                    if (err) {

                        console.log(err);

                        return res
                            .status(500)
                            .json({
                                mensaje:
                                'Error servidor'
                            });
                    }

                    res.json({

                        mensaje:
                        'Producto agregado'
                    });
                }
            );
        }
    }
);
    }
);

// EDITAR PRODUCTO
router.put('/:id', verifyToken, (req, res) => {
const id = req.params.id;
const {
nombre,
descripcion,
precio,
cantidad,
imagen
} = req.body;

const fechaGuatemala = new Date()

    .toLocaleString(
        'sv-SE',
        {
            timeZone:
                'America/Guatemala'
        }
    )
    .replace(',', ''); 

const sql = `

 UPDATE productos
SET

nombre=?,
marca=?,
categoria=?,
descripcion=?,
precio=?,
cantidad=?,
imagen=?,

fecha_actualizacion=?

WHERE id=?
 `;

db.run(
sql,
[nombre, descripcion, precio, cantidad, imagen, id],
function(err) {
if (err) {
return res.status(500).json(err);
}
res.json({
message: 'Producto actualizado'
});
}
);
});
// ELIMINAR PRODUCTO
router.delete('/:id', verifyToken, (req, res) => {
if (req.user.role !== 'admin') {
return res.status(403).json({
message: 'Solo admin puede eliminar productos'
});
}
const id = req.params.id;
db.run(
'DELETE FROM productos WHERE id=?',
[id],
function(err) {
if (err) {
return res.status(500).json(err);
}
res.json({
message: 'Producto eliminado'
});
}
);
});
module.exports = router;