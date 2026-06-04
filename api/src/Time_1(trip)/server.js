const express = require('express');
const path = require('path');
require('dotenv').config();

// Importa a aplicação consolidada
const app = require('../app');
const tripRoutes = require('./routes/tripRoutes');

// Configuração adicional apenas para este módulo (se necessário)
const PORT = process.env.PORT || 3000;

// Middlewares específicos do Trip (se não estiverem já em app.js)
app.use(express.static(path.join(__dirname, 'public')));

// As rotas já estão em app.js, mas isso garante compatibilidade com versões antigas
// app.use('/api/v1/trip', tripRoutes); // Já definido em app.js

// Fallback para servir index.html em rotas não encontradas
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
