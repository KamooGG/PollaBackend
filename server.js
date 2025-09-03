const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", require("./routes/usuarios"));
app.use("/partidos", require("./routes/partidos"));
app.use("/predicciones", require("./routes/predicciones"));
app.use("/ranking", require("./routes/ranking"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
