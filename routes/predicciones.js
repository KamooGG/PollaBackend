const express = require("express");
const Prediccion = require("../models/Prediccion");
const Partido = require("../models/Partido");
const { calcularPuntos } = require("../utils/puntos");

const router = express.Router();

// Crear predicción
router.post("/", async (req, res) => {
    try {
        const prediccion = new Prediccion(req.body);
        await prediccion.save();
        res.json(prediccion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener predicciones de un usuario con puntaje
router.get("/usuario/:usuarioId", async (req, res) => {
    try {
        const predicciones = await Prediccion.find({ usuarioId: req.params.usuarioId }).populate("partidoId");
        let total = 0;
        const resultados = predicciones.map(p => {
            if (p.partidoId.resultado.local !== null) {
                const puntos = calcularPuntos(p.prediccion, p.partidoId.resultado);
                total += puntos;
                return { partido: p.partidoId, prediccion: p.prediccion, puntos };
            }
            return { partido: p.partidoId, prediccion: p.prediccion, puntos: null };
        });

        res.json({ total, resultados });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
