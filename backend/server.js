const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
require('./db');
app.use(cors());
app.use(express.json());
// CARPETA PUBLICA IMAGENES
app.use('/uploads', express.static('uploads'));

// CONFIGURACION MULTER
const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, 'uploads/');
    },

    filename: function (req, file, cb) {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    }
});

global.upload = multer({

    storage: storage,

    limits: {

        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const tipos =
            /jpeg|jpg|png|webp/;

        const mimetype =
            tipos.test(file.mimetype);

        if (mimetype) {

            return cb(null, true);
        }

        cb(
            new Error(
                'Solo imágenes JPG PNG WEBP'
            )
        );
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Servidor corriendo en puerto ${PORT}`);
});