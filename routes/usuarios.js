const express = require("express");
const prisma = require("../utils/prisma");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const usuario = await prisma.usuario.create({ data: req.body });
        res.json(usuario);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", async (_req, res) => {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
});

module.exports = router;
