const path = require('path');
const express = require('express');
const cors = require('cors');
const analiseRoutes = require('./routes/analiseRoutes');

const app = express();
const frontendPath = path.join(__dirname, '../../frontend');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ sucesso: true, mensagem: 'API online' });
});

app.use('/api/analises', analiseRoutes);
app.use(express.static(frontendPath));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Rota não encontrada.'
    });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
