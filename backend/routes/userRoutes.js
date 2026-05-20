const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
// VER USUARIOS
router.get('/', verifyToken, (req, res) => {
if (req.user.role !== 'admin') {
return res.status(403).json({
message: 'Solo administrador'
});
}
db.all(
'SELECT id, nombre, email, role, blocked FROM users',
[],
(err, rows) => {
res.json(rows);
}
);
});
// CREAR USUARIO
router.post('/', verifyToken, async (req, res) => {
if (req.user.role !== 'admin') {
return res.status(403).json({
message: 'Solo administrador'
});
}
const {
nombre,
email,
password,
role
} = req.body;
const hashed = await bcrypt.hash(password, 10);
db.run(
'INSERT INTO users(nombre,email,password,role) VALUES(?,?,?,?)',
[nombre, email, hashed, role],
function(err) {
if (err) {
return res.status(500).json(err);
}
res.json({
message: 'Usuario creado'
});
}
);
});
// BLOQUEAR
router.put('/block/:id', verifyToken, (req, res) => {
if (req.user.role !== 'admin') {
return res.status(403).json({
message: 'Solo administrador'
});
}
db.run(
'UPDATE users SET blocked = 1 WHERE id=?',
[req.params.id],
function(err) {
res.json({
message: 'Usuario bloqueado'
});
}
);
});
// DESBLOQUEAR
router.put('/unblock/:id', verifyToken, (req, res) => {
if (req.user.role !== 'admin') {
return res.status(403).json({
message: 'Solo administrador'
});
}
db.run(
'UPDATE users SET blocked = 0 WHERE id=?',
[req.params.id],
function(err) {
res.json({
message: 'Usuario desbloqueado'
});
}
);
});
// ELIMINAR USUARIO
router.delete('/:id', verifyToken, (req, res) => {
if (req.user.role !== 'admin') {
return res.status(403).json({
message: 'Solo administrador'
});
}
db.run(
'DELETE FROM users WHERE id=?',
[req.params.id],
function(err) {
res.json({
message: 'Usuario eliminado'
});
}
);
});
module.exports = router;