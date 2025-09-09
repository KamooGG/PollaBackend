// routes/usuarios.js
const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const authRequired = require('../middleware/authRequired');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Crear usuario (ADMIN por JWT)
// body: { nombre, alias, password, email?, role? }
router.post('/', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
        const { nombre, alias, password, email, role } = req.body;
        if (!nombre || !alias || !password) return res.status(400).json({ error: 'nombre, alias y password son requeridos' });

        const exists = await prisma.usuario.findFirst({
            where: { OR: [{ alias }, ...(email ? [{ email }] : [])] }
        });
        if (exists) return res.status(409).json({ error: 'Alias o email ya en uso' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.usuario.create({
            data: {
                nombre,
                alias,
                email: email || null,
                passwordHash,
                role: role === 'ADMIN' ? 'ADMIN' : 'USER',
            },
            select: { id: true, nombre: true, alias: true, email: true, role: true }
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Reset de contraseña (ADMIN por JWT)
router.put('/:id/password', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'password requerido' });

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.usuario.update({ where: { id }, data: { passwordHash } });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Listar usuarios (público)
router.get('/', async (_req, res) => {
    const usuarios = await prisma.usuario.findMany({
        select: { id: true, nombre: true, alias: true, email: true, role: true }
    });
    res.json(usuarios);
});

module.exports = router;
