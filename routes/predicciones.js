const express = require("express");
const prisma = require("../utils/prisma");
const { calcularPuntos } = require("../utils/puntos"); // misma función que ya tenías
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { usuarioId, partidoId, prediccion } = req.body;
        const pred = await prisma.prediccion.upsert({
            where: { usuarioId_partidoId: { usuarioId, partidoId } },
            update: { predLocal: prediccion.local, predVisitante: prediccion.visitante },
            create: {
                usuarioId, partidoId,
                predLocal: prediccion.local, predVisitante: prediccion.visitante
            }
        });
        res.json(pred);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/usuario/:usuarioId", async (req, res) => {
    try {
        const uid = Number(req.params.usuarioId);
        const preds = await prisma.prediccion.findMany({
            where: { usuarioId: uid },
            include: { partido: true }
        });

        let total = 0;
        const resultados = preds.map(p => {
            if (p.partido.resultadoLocal !== null && p.partido.resultadoVisitante !== null) {
                const puntos = calcularPuntos(
                    { local: p.predLocal, visitante: p.predVisitante },
                    { local: p.partido.resultadoLocal, visitante: p.partido.resultadoVisitante }
                );
                total += puntos;
                return {
                    partido: {
                        id: p.partido.id, local: p.partido.local, visitante: p.partido.visitante,
                        resultado: { local: p.partido.resultadoLocal, visitante: p.partido.resultadoVisitante }
                    },
                    prediccion: { local: p.predLocal, visitante: p.predVisitante },
                    puntos
                };
            }
            return {
                partido: { id: p.partido.id, local: p.partido.local, visitante: p.partido.visitante, resultado: null },
                prediccion: { local: p.predLocal, visitante: p.predVisitante },
                puntos: null
            };
        });

        res.json({ total, resultados });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
