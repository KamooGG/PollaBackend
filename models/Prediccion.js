const mongoose = require("mongoose");

const prediccionSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    partidoId: { type: mongoose.Schema.Types.ObjectId, ref: "Partido", required: true },
    prediccion: {
        local: { type: Number, required: true },
        visitante: { type: Number, required: true }
    }
});

module.exports = mongoose.model("Prediccion", prediccionSchema);
