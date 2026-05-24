

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

const uploadMultiple =
    upload.array('imagenes', 100);

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

function generarSKU(nombre = '') {

    const base = nombre
        .trim()
        .substring(0, 3)
        .toUpperCase();

    const timestamp =
        Date.now().toString().slice(-5);

    return `${base}-${timestamp}`;
}



// ============================
// AGREGAR PRODUCTO
// ============================

// ============================
// GENERAR SKU
// ============================

function generarSKU(nombre) {

    const base = nombre
        .substring(0, 3)
        .toUpperCase();

    const timestamp =
        Date.now().toString().slice(-5);

    return `${base}-${timestamp}`;
}


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
                imagenURL,
                sku
            } = req.body;

            // ============================
            // VALIDACIONES
            // ============================

            if (!nombre || nombre.trim() === '') {

                return res.status(400).json({

                    mensaje: 'Nombre requerido'
                });
            }

            const precioFinal =
                parseFloat(precio) || 0;

            const cantidadFinal =
                parseInt(cantidad) || 0;

            if (precioFinal < 0) {

                return res.status(400).json({

                    mensaje: 'Precio inválido'
                });
            }

            // ============================
            // IMAGEN
            // ============================

            let imagen = imagenURL || '';

            if (req.file) {

                imagen =
                    `/uploads/${req.file.filename}`;
            }

            // ============================
            // FECHA GUATEMALA
            // ============================

            const fechaGuatemala = new Date()

                .toLocaleString(
                    'sv-SE',
                    {
                        timeZone:
                            'America/Guatemala'
                    }
                )

                .replace(',', '');

            // ============================
            // VERIFICAR PRODUCTO
            // ============================

            const skuFinal =
    sku && sku.trim() !== ''
    ? sku
    : generarSKU(nombre);
            // ============================
// BUSCAR PRODUCTO
// ============================

let productoExistente;

// SI HAY SKU
if (sku && sku.trim() !== '') {

    productoExistente = await get(

        // SQLITE
        `
        SELECT * FROM productos
        WHERE LOWER(sku)=LOWER(?)
        `,

        // POSTGRESQL
        `
        SELECT * FROM productos
        WHERE LOWER(sku)=LOWER($1)
        `,

        [skuFinal]
    );

} else {

    // BUSCAR POR NOMBRE

    productoExistente = await get(

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
}

            // ============================
            // SI YA EXISTE
            // ============================

            if (productoExistente) {

                let nuevaCantidad;

                if (tipoMovimiento === 'salida') {

                    nuevaCantidad =
                        productoExistente.cantidad -
                        cantidadFinal;

                } else {

                    nuevaCantidad =
                        productoExistente.cantidad +
                        cantidadFinal;
                }

                // EVITAR STOCK NEGATIVO

                if (nuevaCantidad < 0) {

                    return res.status(400).json({

                        mensaje:
                            'Stock insuficiente'
                    });
                }

                await run(

                    // SQLITE
                    `
                    UPDATE productos
                    SET

                    sku=?,
                    nombre=?,
                    precio=?,
                    cantidad=?,
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
                    sku=$1,
                    nombre=$2
                    precio=$3,
                    cantidad=$4,
                    marca=$5,
                    categoria=$6,
                    descripcion=$7,
                    imagen=$8,
                    fecha_actualizacion=$9

                    WHERE id=$10
                    `,

                    [
                        skuFinal,
                        nombre,
                        precioFinal,
                        nuevaCantidad,
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
            // SKU NUEVO
            // ============================  

            

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
                    sku,
                    imagen,
                    fecha_creacion,
                    fecha_actualizacion
                )

                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    sku,
                    imagen,
                    fecha_creacion,
                    fecha_actualizacion
                )

                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                `,

                [
                    nombre,
                    marca,
                    categoria,
                    descripcion,
                    precioFinal,
                    cantidadFinal,
                    skuFinal,
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

                    message:
                        'No se subió ningún archivo Excel'
                });
            }

            const XLSX =
                require('xlsx');

            const workbook =
                XLSX.readFile(req.file.path);

            const sheetName =
                workbook.SheetNames[0];

            const worksheet =
                workbook.Sheets[sheetName];

            const productos =
                XLSX.utils.sheet_to_json(worksheet);

            for (const fila of productos) {

                // =========================
                // DATOS
                // =========================

                const nombre =
                    fila.nombre ||
                    fila.Nombre ||
                    '';

                if (!nombre) {
                    continue;
                }

                const marca =
                    fila.marca ||
                    fila.Marca ||
                    '';

                const categoria =
                    fila.categoria ||
                    fila.Categoria ||
                    '';

                const descripcion =
                    fila.descripcion ||
                    fila.Descripcion ||
                    '';

                const precio =
                    parseFloat(
                        fila.precio ||
                        fila.Precio
                    ) || 0;

                const cantidad =
                    parseInt(
                        fila.cantidad ||
                        fila.Cantidad
                    ) || 0;

                const imagen =
                    fila.imagen ||
                    fila.Imagen ||
                    '';

                // =========================
                // SKU
                // =========================

                let sku =
                    fila.sku ||
                    fila.SKU ||
                    '';

                // SI NO EXISTE SKU
                if (!sku || sku.trim() === '') {

                    sku = generarSKU(nombre);
                }

                // =========================
                // FECHA GUATEMALA
                // =========================

                const fechaGuatemala =
                    new Date()

                    .toLocaleString(
                        'sv-SE',
                        {
                            timeZone:
                                'America/Guatemala'
                        }
                    )

                    .replace(',', '');

                // =========================
                // BUSCAR PRODUCTO
                // =========================

                // =========================
// BUSCAR PRODUCTO
// =========================

let productoExistente;

// SI HAY SKU
if (sku && sku.trim() !== '') {

    productoExistente = await get(

        // SQLITE
        `
        SELECT * FROM productos
        WHERE LOWER(sku)=LOWER(?)
        `,

        // POSTGRESQL
        `
        SELECT * FROM productos
        WHERE LOWER(sku)=LOWER($1)
        `,

        [sku]
    );

} else {

    // BUSCAR POR NOMBRE

    productoExistente = await get(

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
}

                // =========================
                // SI EXISTE → ACTUALIZAR
                // =========================

                if (productoExistente) {

                    const nuevaCantidad = cantidad;

                    await run(

                        // SQLITE
                        `
                        UPDATE productos
                        SET
                        sku=?,
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

                        sku=$1,
                        nombre=$2,
                        marca=$3,
                        categoria=$4,
                        descripcion=$5,
                        precio=$6,
                        cantidad=$7,
                        imagen=$8,
                        fecha_actualizacion=$9

                        WHERE id=$10
                        `,

                        [
                            sku,
                            nombre,
                            marca,
                            categoria,
                            descripcion,
                            precio,
                            nuevaCantidad,
                            imagen,
                            fechaGuatemala,
                            productoExistente.id
                        ]
                    );

                } else {

                    // =========================
                    // NUEVO PRODUCTO
                    // =========================

                    await run(

                        // SQLITE
                        `
                        INSERT INTO productos
                        (
                            sku,
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
                        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `,

                        // POSTGRESQL
                        `
                        INSERT INTO productos
                        (
                            sku,
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
                        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                        `,

                        [
                            sku,
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
                }
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
                sku,
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

            const productoSKU = await get(

    `
    SELECT * FROM productos
    WHERE LOWER(sku)=LOWER(?)
    AND id != ?
    `,

    `
    SELECT * FROM productos
    WHERE LOWER(sku)=LOWER($1)
    AND id != $2
    `,

    [sku, id]
);

if (productoSKU) {

    return res.status(400).json({

        message: 'El SKU ya existe'
    });
}

            await run(

                // SQLITE
                `
                UPDATE productos

                SET
                sku=?,
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
                sku=$1,
                nombre=$2,
                marca=$3,
                categoria=$4,
                descripcion=$5,
                precio=$6,
                cantidad=$7,
                imagen=$8,
                fecha_actualizacion=$9

                WHERE id=$10
                `,

                [
                    sku,
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