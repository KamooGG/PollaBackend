const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const authRequired = require('../middleware/authRequired');

const router = express.Router();

// POST /auth/login  (alias o email + password)
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // alias o email
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Faltan credenciales' });
        }

        const where = identifier.includes('@') ? { email: identifier } : { alias: identifier };
        const user = await prisma.usuario.findFirst({ where });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            process.env.JWT_SECRET || 'dev',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: { id: user.id, nombre: user.nombre, alias: user.alias, email: user.email ?? null, role: user.role }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /auth/me  (perfil desde el token)
router.get('/me', authRequired, async (req, res) => {
    try {
        const u = await prisma.usuario.findUnique({
            where: { id: Number(req.user.sub) },
            select: { id: true, nombre: true, alias: true, email: true, role: true }
        });
        if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(u);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /auth/change-password  (cambiar contraseña desde perfil)
router.put('/change-password', authRequired, async (req, res) => {
    try {
        const userId = Number(req.user.sub);
        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'currentPassword y newPassword son requeridos' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
        }

        const user = await prisma.usuario.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'La contraseña actual no es correcta' });

        const same = await bcrypt.compare(newPassword, user.passwordHash);
        if (same) return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la actual' });

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.usuario.update({ where: { id: userId }, data: { passwordHash } });

        // opcional: emitir nuevo token
        const token = jwt.sign(
            { sub: user.id, role: user.role },
            process.env.JWT_SECRET || 'dev',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({ ok: true, token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
