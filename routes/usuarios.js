// routes/usuarios.js
const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const authRequired = require('../middleware/authRequired');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

/**
 * Crear usuario (ADMIN por JWT)
 * body: { nombre, alias, password, email?, role? }
 */
router.post('/', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
        const { nombre, alias, password, email, role } = req.body;
        if (!nombre || !alias || !password) {
            return res.status(400).json({ error: 'nombre, alias y password son requeridos' });
        }

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

/**
 * Actualizar usuario (ADMIN por JWT)
 * body: { nombre?, alias?, email?, role? }
 */
router.put('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, alias, email, role } = req.body || {};

        // Validar unicidad si cambian alias/email
        if (alias) {
            const a = await prisma.usuario.findFirst({ where: { alias, NOT: { id } } });
            if (a) return res.status(409).json({ error: 'Alias ya en uso' });
        }
        if (email) {
            const e = await prisma.usuario.findFirst({ where: { email, NOT: { id } } });
            if (e) return res.status(409).json({ error: 'Email ya en uso' });
        }

        const data = {};
        if (typeof nombre === 'string') data.nombre = nombre;
        if (typeof alias === 'string') data.alias = alias;
        if (typeof email !== 'undefined') data.email = email || null;
        if (role === 'ADMIN' || role === 'USER') data.role = role;

        const user = await prisma.usuario.update({
            where: { id },
            data,
            select: { id: true, nombre: true, alias: true, email: true, role: true }
        });

        res.json(user);
    } catch (err) {
        // Prisma unique error
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'Alias o email ya en uso' });
        }
        res.status(400).json({ error: err.message });
    }
});

/**
 * Reset de contraseña (ADMIN por JWT)
 * body: { password: "..." }
 */
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

/**
 * Eliminar usuario (ADMIN por JWT)
 * - Borra primero sus predicciones para evitar violación de FK
 * - (Opcional) impedir que un admin se borre a sí mismo
 */
router.delete('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number(req.user.sub) === id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        await prisma.prediccion.deleteMany({ where: { usuarioId: id } });
        await prisma.usuario.delete({ where: { id } });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * Listar usuarios (público)
 */
router.get('/', async (_req, res) => {
    const usuarios = await prisma.usuario.findMany({
        select: { id: true, nombre: true, alias: true, email: true, role: true },
        orderBy: { id: 'asc' }
    });
    res.json(usuarios);
});

module.exports = router;
