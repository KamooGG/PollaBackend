const express = require('express');
const prisma = require('../utils/prisma');
const { calcularPuntos } = require('../utils/puntos');
const authRequired = require('../middleware/authRequired');
const router = express.Router();

const LOCK_AHEAD_MIN = Number(process.env.LOCK_AHEAD_MINUTES || 0);

// Crear/editar predicción (requiere login; usa userId del JWT)
router.post('/', authRequired, async (req, res) => {
    try {
        const usuarioId = Number(req.user.sub); // ← del token
        const { partidoId, prediccion } = req.body;

        const [partido, usuario] = await Promise.all([
            prisma.partido.findUnique({ where: { id: Number(partidoId) } }),
            prisma.usuario.findUnique({ where: { id: usuarioId } }),
        ]);
        if (!partido) return res.status(404).json({ error: 'Partido no existe' });
        if (!usuario) return res.status(404).json({ error: 'Usuario no existe' });

        const now = new Date();
        const lockFrom = new Date(new Date(partido.fecha).getTime() - LOCK_AHEAD_MIN * 60000);
        if (now >= lockFrom) return res.status(403).json({ error: 'Predicciones cerradas para este partido.' });

        const result = await prisma.prediccion.upsert({
            where: { usuarioId_partidoId: { usuarioId, partidoId: Number(partidoId) } },
            update: { predLocal: Number(prediccion.local), predVisitante: Number(prediccion.visitante) },
            create: { usuarioId, partidoId: Number(partidoId), predLocal: Number(prediccion.local), predVisitante: Number(prediccion.visitante) }
        });
        res.json(result);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Puntaje por usuario (público)
router.get('/usuario/:usuarioId', async (req, res) => {
    try {
        const uid = Number(req.params.usuarioId);
        const preds = await prisma.prediccion.findMany({ where: { usuarioId: uid }, include: { partido: true } });

        let total = 0;
        const resultados = preds.map(p => {
            const rL = p.partido.resultadoLocal, rV = p.partido.resultadoVisitante;
            if (rL !== null && rV !== null) {
                const puntos = calcularPuntos({ local: p.predLocal, visitante: p.predVisitante }, { local: rL, visitante: rV });
                total += puntos;
                return { partido: { id: p.partido.id, local: p.partido.local, visitante: p.partido.visitante, resultado: { local: rL, visitante: rV } }, prediccion: { local: p.predLocal, visitante: p.predVisitante }, puntos };
            }
            return { partido: { id: p.partido.id, local: p.partido.local, visitante: p.partido.visitante, resultado: null }, prediccion: { local: p.predLocal, visitante: p.predVisitante }, puntos: null };
        });

        res.json({ total, resultados });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Predicciones por partido (público)
router.get('/partido/:partidoId', async (req, res) => {
    try {
        const pid = Number(req.params.partidoId);
        const partido = await prisma.partido.findUnique({ where: { id: pid } });
        if (!partido) return res.status(404).json({ error: 'Partido no existe' });

        const preds = await prisma.prediccion.findMany({ where: { partidoId: pid }, include: { usuario: true } });
        const hasRes = partido.resultadoLocal !== null && partido.resultadoVisitante !== null;

        const lista = preds.map(p => {
            const base = { usuarioId: p.usuarioId, nombre: p.usuario.nombre, prediccion: { local: p.predLocal, visitante: p.predVisitante } };
            if (!hasRes) return { ...base, puntos: null };
            const puntos = calcularPuntos({ local: p.predLocal, visitante: p.predVisitante }, { local: partido.resultadoLocal, visitante: partido.resultadoVisitante });
            return { ...base, puntos };
        });

        res.json({ partido: { id: partido.id, local: partido.local, visitante: partido.visitante, resultado: hasRes ? { local: partido.resultadoLocal, visitante: partido.resultadoVisitante } : null }, predicciones: lista });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
