const express = require('express');
const prisma = require('../utils/prisma');
const admin = require('../middleware/admin');
const router = express.Router();

// Crear partido (admin)
router.post('/', admin, async (req, res) => {
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

// Listar partidos (opcional ?jornadaId=)
router.get('/', async (req, res) => {
    const where = {};
    if (req.query.jornadaId) where.jornadaId = Number(req.query.jornadaId);
    const partidos = await prisma.partido.findMany({
        where,
        orderBy: { fecha: 'asc' },
    });
    res.json(partidos);
});

// Setear resultado (admin)
router.put('/:id/resultado', admin, async (req, res) => {
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
