const express = require("express");
const prisma = require("../utils/prisma");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { local, visitante, fecha } = req.body;
        const partido = await prisma.partido.create({
            data: { local, visitante, fecha: new Date(fecha) }
        });
        res.json(partido);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", async (_req, res) => {
    const partidos = await prisma.partido.findMany();
    res.json(partidos);
});

router.put("/:id/resultado", async (req, res) => {
    try {
        const { local, visitante } = req.body;
        const partido = await prisma.partido.update({
            where: { id: Number(req.params.id) },
            data: { resultadoLocal: local, resultadoVisitante: visitante }
        });
        res.json(partido);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
