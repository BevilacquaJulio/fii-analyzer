const express = require('express');
const cors = require('cors');
const analiseRoutes = require('./routes/analiseRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ sucesso: true, mensagem: 'API online' });
});

app.use('/api/analises', analiseRoutes);

app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada.'
  });
});

module.exports = app;
