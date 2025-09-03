const express = require("express");
const Partido = require("../models/Partido");
const router = express.Router();

// Crear partido
router.post("/", async (req, res) => {
    try {
        const partido = new Partido(req.body);
        await partido.save();
        res.json(partido);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener partidos
router.get("/", async (req, res) => {
    const partidos = await Partido.find();
    res.json(partidos);
});

// Registrar resultado
router.put("/:id/resultado", async (req, res) => {
    try {
        const partido = await Partido.findByIdAndUpdate(
            req.params.id,
            { resultado: req.body },
            { new: true }
        );
        res.json(partido);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
