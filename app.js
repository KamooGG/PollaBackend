const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: [ 'http://localhost:5173' ], credentials: true }));
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/partidos', require('./routes/partidos'));
app.use('/predicciones', require('./routes/predicciones'));
app.use('/ranking', require('./routes/ranking'));
app.use('/jornadas', require('./routes/jornadas'));

module.exports = app;
