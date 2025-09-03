const mongoose = require("mongoose");

const partidoSchema = new mongoose.Schema({
    local: { type: String, required: true },
    visitante: { type: String, required: true },
    fecha: { type: Date, required: true },
    resultado: {
        local: { type: Number, default: null },
        visitante: { type: Number, default: null }
    }
});

module.exports = mongoose.model("Partido", partidoSchema);
