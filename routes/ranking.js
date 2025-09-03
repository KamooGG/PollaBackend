const express = require('express');
const prisma = require('../utils/prisma');
const { calcularPuntos } = require('../utils/puntos');
const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: { id: true, nombre: true },
        });
        const preds = await prisma.prediccion.findMany({
            include: { partido: true },
        });

        const acc = new Map();
        for (const p of preds) {
            const rL = p.partido.resultadoLocal;
            const rV = p.partido.resultadoVisitante;
            if (rL === null || rV === null) continue;

            const puntos = calcularPuntos(
                { local: p.predLocal, visitante: p.predVisitante },
                { local: rL, visitante: rV }
            );

            const e =
                acc.get(p.usuarioId) || {
                    total: 0,
                    exactos: 0,
                    tendencias: 0,
                    jugados: 0,
                };
            e.total += puntos;
            e.jugados += 1;
            if (puntos === 3) e.exactos += 1;
            else if (puntos === 1) e.tendencias += 1;
            acc.set(p.usuarioId, e);
        }

        const ranking = usuarios
            .map((u) => ({
                usuarioId: u.id,
                nombre: u.nombre,
                total: acc.get(u.id)?.total ?? 0,
                exactos: acc.get(u.id)?.exactos ?? 0,
                tendencias: acc.get(u.id)?.tendencias ?? 0,
                jugados: acc.get(u.id)?.jugados ?? 0,
            }))
            .sort((a, b) => (b.total - a.total) || (b.exactos - a.exactos));

        res.json(ranking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
