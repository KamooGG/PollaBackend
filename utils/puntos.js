function calcularPuntos(pred, res) {
    const exacto = pred.local === res.local && pred.visitante === res.visitante;
    if (exacto) return 3;
    const tPred = pred.local > pred.visitante ? 'local' : pred.local < pred.visitante ? 'visitante' : 'empate';
    const tReal = res.local > res.visitante ? 'local' : res.local < res.visitante ? 'visitante' : 'empate';
    return tPred === tReal ? 1 : 0;
}
module.exports = { calcularPuntos };
