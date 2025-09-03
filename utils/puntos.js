function calcularPuntos(prediccion, resultado) {
    const exacto = prediccion.local === resultado.local && prediccion.visitante === resultado.visitante;
    if (exacto) return 3;

    const tendenciaPred = prediccion.local > prediccion.visitante ? "local" :
        prediccion.local < prediccion.visitante ? "visitante" : "empate";

    const tendenciaReal = resultado.local > resultado.visitante ? "local" :
        resultado.local < resultado.visitante ? "visitante" : "empate";

    return tendenciaPred === tendenciaReal ? 1 : 0;
}

module.exports = { calcularPuntos };
