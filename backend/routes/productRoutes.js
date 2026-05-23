const XLSX = require('xlsx');
const fs = require('fs');


const express = require('express');

const router = express.Router();

const {
    all,
    get,
    run
} = require('../dbHelpers');

const verifyToken =
    require('../middleware/authMiddleware');

const multer = require('multer');

const path = require('path');


// ============================
// MULTER
// ============================

const storage = multer.diskStorage({

    destination: function(req, file, cb) {

        cb(null, 'uploads/');
    },

    filename: function(req, file, cb) {

        cb(

            null,

            Date.now()
            +
            path.extname(
                file.originalname
            )
        );
    }
});

const upload = multer({

    storage
});


// ============================
// OBTENER PRODUCTOS
// ============================

router.get(

    '/',

    verifyToken,

    async (req, res) => {

        try {

            const productos = await all(

                // SQLITE
                `
                SELECT * FROM productos
                `,

                // POSTGRESQL
                `
                SELECT * FROM productos
                `,

                []
            );

            res.json(productos);

        } catch (err) {

            console.log(err);

            res.status(500).json({

                message:
                    'Error obteniendo productos'
            });
        }
    }
);


// ============================
// AGREGAR PRODUCTO
// ============================

router.post(

    '/',

    verifyToken,

    upload.single('imagen'),

    async (req, res) => {

        try {

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

            if (req.file) {

                imagen =
                    `/uploads/${req.file.filename}`;
            }

            // FECHA GUATEMALA

            const fechaGuatemala = new Date()

                .toLocaleString(
                    'sv-SE',
                    {
                        timeZone:
                            'America/Guatemala'
                    }
                )

                .replace(',', '');

            // VERIFICAR PRODUCTO

            const productoExistente = await get(

                // SQLITE
                `
                SELECT * FROM productos
                WHERE LOWER(nombre)=LOWER(?)
                `,

                // POSTGRESQL
                `
                SELECT * FROM productos
                WHERE LOWER(nombre)=LOWER($1)
                `,

                [nombre]
            );

            // ============================
            // SI YA EXISTE
            // ============================

            if (productoExistente) {

                const nuevaCantidad =

                    tipoMovimiento === 'salida'

                    ?

                    productoExistente.cantidad -
                    parseInt(cantidad)

                    :

                    productoExistente.cantidad +
                    parseInt(cantidad);

                await run(

                    // SQLITE
                    `
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
                    `,

                    // POSTGRESQL
                    `
                    UPDATE productos
                    SET

                    cantidad=$1,
                    precio=$2,
                    marca=$3,
                    categoria=$4,
                    descripcion=$5,
                    imagen=$6,
                    fecha_actualizacion=$7

                    WHERE id=$8
                    `,

                    [
                        nuevaCantidad,
                        precio,
                        marca,
                        categoria,
                        descripcion,
                        imagen,
                        fechaGuatemala,
                        productoExistente.id
                    ]
                );

                return res.json({

                    mensaje:
                        'Producto actualizado automáticamente'
                });
            }

            // ============================
            // NUEVO PRODUCTO
            // ============================

            await run(

                // SQLITE
                `
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

                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,

                // POSTGRESQL
                `
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

                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                `,

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
                ]
            );

            res.json({

                mensaje:
                    'Producto agregado correctamente'
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                mensaje:
                    'Error servidor'
            });
        }
    }
);


// ============================
// EDITAR PRODUCTO
// ============================

router.put(

    '/:id',

    verifyToken,

    async (req, res) => {

        try {

            const id = req.params.id;

            const {
                nombre,
                marca,
                categoria,
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

            await run(

                // SQLITE
                `
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
                `,

                // POSTGRESQL
                `
                UPDATE productos

                SET

                nombre=$1,
                marca=$2,
                categoria=$3,
                descripcion=$4,
                precio=$5,
                cantidad=$6,
                imagen=$7,
                fecha_actualizacion=$8

                WHERE id=$9
                `,

                [
                    nombre,
                    marca,
                    categoria,
                    descripcion,
                    precio,
                    cantidad,
                    imagen,
                    fechaGuatemala,
                    id
                ]
            );

            res.json({

                message:
                    'Producto actualizado'
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                message:
                    'Error actualizando producto'
            });
        }
    }
);


// ============================
// ELIMINAR PRODUCTO
// ============================

router.delete(

    '/:id',

    verifyToken,

    async (req, res) => {

        try {

            if (req.user.role !== 'admin') {

                return res.status(403).json({

                    message:
                        'Solo admin puede eliminar productos'
                });
            }

            const id = req.params.id;

            await run(

                // SQLITE
                `
                DELETE FROM productos
                WHERE id=?
                `,

                // POSTGRESQL
                `
                DELETE FROM productos
                WHERE id=$1
                `,

                [id]
            );

            res.json({

                message:
                    'Producto eliminado'
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                message:
                    'Error eliminando producto'
            });
        }
    }
);

// EXPORTAR EXCEL

router.get(
    '/export/excel',
    verifyToken,
    async (req, res) => {

        try {

            const productos = await all(

                `
                SELECT * FROM productos
                `,

                `
                SELECT * FROM productos
                `,

                []
            );

            const wb =
                XLSX.utils.book_new();

            const ws =
                XLSX.utils.json_to_sheet(productos);

            XLSX.utils.book_append_sheet(
                wb,
                ws,
                'Productos'
            );

            const filePath =
                'productos.xlsx';

            XLSX.writeFile(
                wb,
                filePath
            );

            res.download(filePath);

        } catch (err) {

            console.log(err);

            res.status(500).json({

                message:
                    'Error exportando Excel'
            });
        }
    }
);


module.exports = router;