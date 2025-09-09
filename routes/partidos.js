// routes/partidos.js
const express = require('express');
const prisma = require('../utils/prisma');
const adminSecret = require('../middleware/admin');          // header x-admin-secret (para operaciones operativas)
const authRequired = require('../middleware/authRequired');  // JWT obligatorio
const requireRole = require('../middleware/requireRole');    // rol

const router = express.Router();

// Crear partido (solo con x-admin-secret; NO desde el panel)
router.post('/', adminSecret, async (req, res) => {
    try {
        const { local, visitante, fecha, jornadaId } = req.body;
        const partido = await prisma.partido.create({
            data: {
                local,
                visitante,
                fecha: new Date(fecha),
                jornadaId: jornadaId ? Number(jornadaId) : null,
            },
        });
        res.json(partido);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Listar partidos (público; ?jornadaId= opcional)
router.get('/', async (req, res) => {
    const where = {};
    if (req.query.jornadaId) where.jornadaId = Number(req.query.jornadaId);
    const partidos = await prisma.partido.findMany({
        where,
        orderBy: { fecha: 'asc' },
    });
    res.json(partidos);
});

// Setear resultado real (SOLO ADMIN por JWT; accesible desde el panel)
router.put('/:id/resultado', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { local, visitante } = req.body;

        const partido = await prisma.partido.update({
            where: { id },
            data: {
                resultadoLocal: Number(local),
                resultadoVisitante: Number(visitante),
            },
        });
        res.json(partido);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
