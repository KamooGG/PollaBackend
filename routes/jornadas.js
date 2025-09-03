const express = require('express');
const prisma = require('../utils/prisma');
const admin = require('../middleware/admin');
const router = express.Router();

// Crear jornada (admin)
router.post('/', admin, async (req, res) => {
    try {
        const { nombre, fechaInicio, fechaFin } = req.body;
        const j = await prisma.jornada.create({
            data: {
                nombre,
                fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
                fechaFin: fechaFin ? new Date(fechaFin) : null,
            },
        });
        res.json(j);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Listar jornadas
router.get('/', async (_req, res) => {
    const j = await prisma.jornada.findMany({ orderBy: { id: 'asc' } });
    res.json(j);
});

// Partidos por jornada
router.get('/:id/partidos', async (req, res) => {
    const id = Number(req.params.id);
    const partidos = await prisma.partido.findMany({
        where: { jornadaId: id },
        orderBy: { fecha: 'asc' },
    });
    res.json(partidos);
});

module.exports = router;
