const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

module.exports = async function authRequired(req, res, next) {
    try {
        const auth = req.header('Authorization') || '';
        const [scheme, token] = auth.split(' ');
        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'No autorizado (falta Bearer token)' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');

        // opcional: validar que el usuario exista aún
        const user = await prisma.usuario.findUnique({
            where: { id: Number(payload.sub) },
            select: { id: true }
        });
        if (!user) return res.status(401).json({ error: 'Usuario no existe' });

        req.user = payload; // { sub, role, iat, exp }
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};
