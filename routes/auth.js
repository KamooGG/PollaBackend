const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

function validateEmail(email) { return /.+@.+\..+/.test(String(email).toLowerCase()); }
function validateAlias(alias) { return /^[a-zA-Z0-9_]{3,20}$/.test(alias); }

router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre, alias } = req.body;
        if (!email || !password || !nombre || !alias) return res.status(400).json({ error: 'Faltan campos' });
        if (!validateEmail(email)) return res.status(400).json({ error: 'Email inválido' });
        if (!validateAlias(alias)) return res.status(400).json({ error: 'Alias inválido (3-20, letras/números/_)' });
        if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });

        const exists = await prisma.usuario.findFirst({ where: { OR: [{ email }, { alias }] } });
        if (exists) return res.status(409).json({ error: 'Email o alias ya están en uso' });

        const passwordHash = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        const user = await prisma.usuario.create({
            data: { email, nombre, alias, passwordHash, verificationToken: token, verificationExpires: expires }
        });

        const verificationUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify?token=${token}`;
        const { previewUrl } = await sendMail({
            to: email,
            subject: 'Confirma tu cuenta – Polla Futbolera',
            html: `<p>Hola ${nombre},</p>
             <p>Gracias por registrarte. Confirma tu correo para activar tu cuenta:</p>
             <p><a href="${verificationUrl}">Confirmar cuenta</a></p>
             <p>Si no fuiste tú, ignora este correo.</p>`
        });

        res.status(201).json({ id: user.id, email: user.email, alias: user.alias, devVerificationLink: previewUrl || verificationUrl });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token requerido' });
        const user = await prisma.usuario.findFirst({ where: { verificationToken: String(token) } });
        if (!user) return res.status(400).json({ error: 'Token inválido' });
        if (user.verificationExpires && user.verificationExpires < new Date()) return res.status(400).json({ error: 'Token expirado' });

        await prisma.usuario.update({
            where: { id: user.id },
            data: { emailVerifiedAt: new Date(), verificationToken: null, verificationExpires: null }
        });

        res.json({ ok: true, message: 'Cuenta verificada' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
        if (!user.emailVerifiedAt) return res.status(403).json({ error: 'Debes verificar tu correo primero' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.json({ token, user: { id: user.id, nombre: user.nombre, alias: user.alias, email: user.email } });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
