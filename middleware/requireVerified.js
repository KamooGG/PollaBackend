const prisma = require('../utils/prisma');

module.exports = async function requireVerified(req, res, next) {
    const userId = Number(req.body?.usuarioId || req.params?.usuarioId);
    if (!userId) return res.status(400).json({ error: 'usuarioId requerido' });
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no existe' });
    if (!user.emailVerifiedAt) return res.status(403).json({ error: 'Cuenta no verificada. Revisa tu correo.' });
    next();
}
