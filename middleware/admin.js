module.exports = function admin(req, res, next) {
    const configured = process.env.ADMIN_SECRET;
    if (!configured) return res.status(500).json({ error: 'ADMIN_SECRET no configurado' });
    const given = req.header('x-admin-secret');
    if (given !== configured) return res.status(401).json({ error: 'No autorizado' });
    next();
};
