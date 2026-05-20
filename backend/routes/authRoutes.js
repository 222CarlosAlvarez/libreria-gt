const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// REGISTRO
router.post('/register', async (req, res) => {
const {
nombre,
email,
password,
adminKey
} = req.body;
const hashedPassword = await bcrypt.hash(password, 10);
let role = 'user';
if (adminKey === '123456') {
role = 'admin';
}
const sql = `
 INSERT INTO users(nombre, email, password, role)
 VALUES(?,?,?,?)
 `;
db.run(sql, [nombre, email, hashedPassword, role], function(err) {
if (err) {
return res.status(400).json({
message: 'Correo ya registrado'
});
}
res.json({
message: 'Usuario registrado correctamente'
});
});
});
// LOGIN
router.post('/login', (req, res) => {
const {
email,
password
} = req.body;
db.get(
'SELECT * FROM users WHERE email = ?',
[email],
async (err, user) => {
if (!user) {
return res.status(404).json({
message: 'Usuario no encontrado'
});
}
if (user.blocked === 1) {
return res.status(403).json({
message: 'Usuario bloqueado'
});
}
const validPassword = await bcrypt.compare(password, user.password);
if (!validPassword) {
return res.status(401).json({
message: 'Contraseña incorrecta'
});
}
const token = jwt.sign(
{
id: user.id,
role: user.role
},
'SECRET_KEY_TECHNOVA',
{
expiresIn: '8h'
}
);
res.json({
token,
role: user.role,
nombre: user.nombre
});
}
);
});
module.exports = router;