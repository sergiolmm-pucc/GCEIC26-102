const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Mapeamento correto para a sua estrutura de pastas
const tripRoutes = require('./api/routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors());
app.use(express.json());

// 1. Configuração para servir arquivos estáticos (Seu Frontend React ou HTML)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// ROTAS DO MÓDULO TRIP
// ==========================================
app.use('/api/v1/trip', tripRoutes);


// ==========================================
// BANCO DE DADOS EM MEMÓRIA E ROTAS ANTIGAS
// ==========================================
const USUARIOS_CADASTRADOS = [
    { email: "usuario@teste.com", senha: "123", nome: "Dev Solitário" }
];
const sessoesAtivas = new Set();

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    
    const usuario = USUARIOS_CADASTRADOS.find(u => u.email === email && u.senha === senha);
    if (!usuario) return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    
    const tokenSimulado = `token_${Math.random().toString(36).substr(2)}`;
    sessoesAtivas.add(tokenSimulado);

    return res.json({
        mensagem: "Login efetuado com sucesso!",
        usuario: { nome: usuario.nome, email: usuario.email },
        token: tokenSimulado
    });
});

const verificarAutenticacao = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !sessoesAtivas.has(authHeader)) {
        return res.status(403).json({ erro: "Acesso negado. Faça login para acessar esta página." });
    }
    next();
};

app.post('/api/calculo-combustivel', verificarAutenticacao, (req, res) => {
    const { distanciaKm, consumoKmL, precoCombustivel } = req.body;
    if (!distanciaKm || !consumoKmL || !precoCombustivel) {
        return res.status(400).json({ erro: "Por favor, preencha todos os campos do cálculo." });
    }
    if (consumoKmL <= 0) return res.status(400).json({ erro: "O consumo do veículo deve ser maior que zero." });

    const litrosNecessarios = distanciaKm / consumoKmL;
    const custoTotal = litrosNecessarios * precoCombustivel;

    return res.json({
        litrosNecessarios: parseFloat(litrosNecessarios.toFixed(2)),
        custoTotal: parseFloat(custoTotal.toFixed(2))
    });
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});