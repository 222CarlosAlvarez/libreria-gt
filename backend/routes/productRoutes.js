const XLSX = require('xlsx');

const AdmZip = require('adm-zip');

const fs = require('fs');

const PDFDocument = require('pdfkit');

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

const excelUpload = multer({

    dest: 'temp/'
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

router.post(
    '/importar-excel',
    verifyToken,
    upload.single('excel'),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message: 'No se subió ningún archivo'
                });
            }

            const workbook =
                XLSX.readFile(req.file.path);

            const sheetName =
                workbook.SheetNames[0];

            const worksheet =
                workbook.Sheets[sheetName];

            const productos =
                XLSX.utils.sheet_to_json(worksheet);

            for (const producto of productos) {

                await run(

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
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,

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
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                    `,

                    [
                        producto.nombre || '',
                        producto.marca || '',
                        producto.categoria || '',
                        producto.descripcion || '',
                        producto.precio || 0,
                        producto.cantidad || 0,
                        producto.imagen || '',
                        new Date(),
                        new Date()
                    ]
                );
            }

            res.json({
                message:
                    'Excel importado correctamente'
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                    'Error importando Excel'
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

            const PDFDocument = require('pdfkit');

            const doc = new PDFDocument({

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

            // ===== TITULO =====

            doc
                .fontSize(22)
                .font('Helvetica-Bold')
                .text(
                    'TECHNOVA GT',
                    {
                        align: 'center'
                    }
                );

            doc.moveDown(0.5);

            doc
                .fontSize(15)
                .font('Helvetica')
                .text(
                    'Reporte Profesional de Inventario',
                    {
                        align: 'center'
                    }
                );

            doc.moveDown();

            const fecha =
    new Date()
    .toLocaleString(
        'es-GT',
        {
            timeZone:
                'America/Guatemala'
        }
    );

            doc
                .fontSize(10)
                .text(
                    `Fecha: ${fecha}`
                );

            doc.moveDown(2);

            // ===== TABLA =====

            let y = doc.y;

            // FONDO ENCABEZADO

            doc
                .rect(30, y, 535, 25)
                .fill('#0f172a');

            doc
                .fillColor('white')
                .fontSize(11)
                .font('Helvetica-Bold');

            doc.text('ID', 40, y + 7);
            doc.text('Nombre', 80, y + 7);
            doc.text('Marca', 230, y + 7);
            doc.text('Precio', 360, y + 7);
            doc.text('Stock', 470, y + 7);

            y += 35;

            // ===== PRODUCTOS =====

            doc.fillColor('black');

            productos.forEach((p, index) => {

                // SALTO DE PAGINA

                if (y > 740) {

                    doc.addPage();

                    y = 50;

                    // REENCABEZADO

                    doc
                        .rect(30, y, 535, 25)
                        .fill('#0f172a');

                    doc
                        .fillColor('white')
                        .fontSize(11)
                        .font('Helvetica-Bold');

                    doc.text('ID', 40, y + 7);
                    doc.text('Nombre', 80, y + 7);
                    doc.text('Marca', 230, y + 7);
                    doc.text('Precio', 360, y + 7);
                    doc.text('Stock', 470, y + 7);

                    y += 35;

                    doc.fillColor('black');
                }

                // FILAS ALTERNADAS

                if (index % 2 === 0) {

                    doc
                        .rect(30, y - 5, 535, 25)
                        .fill('#f1f5f9');

                    doc.fillColor('black');
                }

                const nombre =
                    (p.nombre || '')
                    .substring(0, 22);

                const marca =
                    (p.marca || '')
                    .substring(0, 15);

                doc
                    .fontSize(10)
                    .font('Helvetica');

                doc.text(
                    String(p.id),
                    40,
                    y
                );

                doc.text(
                    nombre,
                    80,
                    y,
                    {
                        width: 130
                    }
                );

                doc.text(
                    marca,
                    230,
                    y,
                    {
                        width: 100
                    }
                );

                doc.text(
                    `Q ${p.precio}`,
                    360,
                    y
                );

                doc.text(
                    String(p.cantidad),
                    470,
                    y
                );

                y += 25;
            });

            // ===== PIE =====

            doc.moveDown(2);

            doc
                .fontSize(9)
                .fillColor('gray')
                .text(
                    'Documento generado automáticamente por TECHNOVA GT',
                    {
                        align: 'center'
                    }
                );

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

// IMPORTAR EXCEL + IMAGENES
router.post(
    '/importar-excel',
    verifyToken,
    upload.single('excel'),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message:
                        'No se seleccionó Excel'
                });
            }

            console.log(
                'Excel recibido:',
                req.file.originalname
            );

            // TU CODIGO DE IMPORTACION AQUI

            res.json({
                message:
                    'Excel importado correctamente'
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                    'Error importando Excel'
            });
        }
    }
);

// RESETEAR INVENTARIO
router.delete('/reset/inventario', verifyToken, async (req, res) => {

    if (req.user.role !== 'admin') {

        return res.status(403).json({
            message: 'Solo administrador'
        });
    }

    try {

        await db.query(`
            TRUNCATE TABLE productos RESTART IDENTITY CASCADE
        `);

        res.json({
            message: 'Inventario reiniciado correctamente'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Error reiniciando inventario'
        });
    }
});


module.exports = router;