const PDFDocument = require('pdfkit');

const XLSX = require('xlsx');

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

            const workbook =
                XLSX.utils.book_new();

            const worksheet =
                XLSX.utils.json_to_sheet(productos);

            XLSX.utils.book_append_sheet(

                workbook,

                worksheet,

                'Productos'
            );

            const excelBuffer =
                XLSX.write(

                    workbook,

                    {
                        bookType: 'xlsx',
                        type: 'buffer'
                    }
                );

            res.setHeader(

                'Content-Type',

                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );

            res.setHeader(

                'Content-Disposition',

                'attachment; filename=productos.xlsx'
            );

            res.send(excelBuffer);

        } catch (err) {

            console.log(err);

            res.status(500).json({

                message:
                    'Error exportando Excel'
            });
        }
    }
);

// EXPORTAR PDF

router.get(
    '/export/pdf',
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

            const doc =
                new PDFDocument({

                    margin: 30,
                    size: 'A4'
                });

            res.setHeader(
                'Content-Type',
                'application/pdf'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=inventario.pdf'
            );

            doc.pipe(res);

            // TITULO

            doc
                .fontSize(22)
                .text(
                    'TECHNOVA GT',
                    {
                        align: 'center'
                    }
                );

            doc.moveDown();

            doc
                .fontSize(16)
                .text(
                    'Reporte de Inventario',
                    {
                        align: 'center'
                    }
                );

            doc.moveDown();

            const fecha =
                new Date()
                .toLocaleString(
                    'es-GT'
                );

            doc
                .fontSize(10)
                .text(
                    `Fecha: ${fecha}`
                );

            doc.moveDown();

            // ENCABEZADOS

            doc.fontSize(12);

            doc.text(
                'ID',
                30,
                doc.y,
                {
                    continued: true
                }
            );

            doc.text(
                'Nombre',
                80,
                doc.y,
                {
                    continued: true
                }
            );

            doc.text(
                'Marca',
                220,
                doc.y,
                {
                    continued: true
                }
            );

            doc.text(
                'Precio',
                340,
                doc.y,
                {
                    continued: true
                }
            );

            doc.text(
                'Cantidad',
                430,
                doc.y
            );

            doc.moveDown();

            // PRODUCTOS

            // POSICIÓN INICIAL

let y = doc.y;

// ENCABEZADOS

doc
    .fontSize(11)
    .font('Helvetica-Bold');

doc.text('ID', 30, y);
doc.text('Nombre', 70, y);
doc.text('Marca', 220, y);
doc.text('Precio', 340, y);
doc.text('Stock', 430, y);

y += 20;

// LINEA

doc.moveTo(30, y)
   .lineTo(550, y)
   .stroke();

y += 10;

// PRODUCTOS

doc.font('Helvetica');

productos.forEach((p) => {

    // SALTO DE PAGINA

    if (y > 750) {

        doc.addPage();

        y = 50;
    }

    // LIMITAR TEXTO

    const nombre =
        (p.nombre || '')
        .substring(0, 20);

    const marca =
        (p.marca || '')
        .substring(0, 15);

    doc.fontSize(10);

    doc.text(
        String(p.id),
        30,
        y,
        {
            width: 30
        }
    );

    doc.text(
        nombre,
        70,
        y,
        {
            width: 130
        }
    );

    doc.text(
        marca,
        220,
        y,
        {
            width: 100
        }
    );

    doc.text(
        `Q${p.precio}`,
        340,
        y,
        {
            width: 70
        }
    );

    doc.text(
        String(p.cantidad),
        430,
        y,
        {
            width: 50
        }
    );

    y += 25;

    // LINEA SEPARADORA

    doc.moveTo(30, y - 5)
       .lineTo(550, y - 5)
       .strokeColor('#cccccc')
       .stroke();
});

            doc.end();

        } catch (err) {

            console.log(err);

            res.status(500).json({

                message:
                    'Error exportando PDF'
            });
        }
    }
);

module.exports = router;