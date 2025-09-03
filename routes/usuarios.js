const express = require("express");
const Usuario = require("../models/Usuario");
const router = express.Router();

// Crear usuario
router.post("/", async (req, res) => {
    try {
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.json(usuario);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener usuarios
router.get("/", async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

module.exports = router;
