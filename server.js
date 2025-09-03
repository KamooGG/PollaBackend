const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const usuariosRoutes = require("./routes/usuarios");
const partidosRoutes = require("./routes/partidos");
const prediccionesRoutes = require("./routes/predicciones");

app.use("/usuarios", usuariosRoutes);
app.use("/partidos", partidosRoutes);
app.use("/predicciones", prediccionesRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => console.error("❌ Error MongoDB:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
