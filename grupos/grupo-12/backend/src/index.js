const app = require('./app');

const PORT = process.env.PORT || 3012;

app.listen(PORT, () => {
  console.log(`API Grupo 12 rodando em http://localhost:${PORT}`);
});
