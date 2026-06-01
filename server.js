const express = require('express');
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Permite apenas o seu próprio frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],                  // Restringe os métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],          // Cabeçalhos aceitos
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// Mapeamento correto para a sua estrutura de pastas
const tripRoutes = require('./api/routes/tripRoutes');

const app = express();
app.disable('x-powered-by');
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
    
    // CÓDIGO CORRIGIDO E SEGURO:
    // Gera 16 bytes aleatórios seguros e os transforma em uma string hexadecimal
    const tokenSeguro = `token_${crypto.randomBytes(16).toString('hex')}`;
    sessoesAtivas.add(tokenSeguro);

    return res.json({
        mensagem: "Login efetuado com sucesso!",
        usuario: { nome: usuario.nome, email: usuario.email },
        token: tokenSeguro
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
