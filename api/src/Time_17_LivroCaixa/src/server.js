const express = require('express');
const cors = require('cors');
const livroCaixaRoutes = require('./routes/livroCaixa');

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/', (_req, res) => {
  res.json({
    service: 'SyncAgro - Livro Caixa API',
    version: '1.0.0',
    endpoint: '/LCX'
  });
});

// Rotas do Livro Caixa
app.use('/LCX', livroCaixaRoutes);

// Handler de erro
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SyncAgro API rodando em http://localhost:${PORT}`);
    console.log(`Endpoints disponíveis em http://localhost:${PORT}/LCX`);
  });
}

module.exports = app;
