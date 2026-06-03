const crypto = require('crypto');

// Banco de dados em memória para autenticação (apenas para demo/testes)
const USUARIOS_CADASTRADOS = [
    { email: "usuario@teste.com", senha: "123", nome: "Dev Solitário" }
];
const sessoesAtivas = new Set();

const verificarAutenticacao = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !sessoesAtivas.has(authHeader)) {
        return res.status(403).json({ erro: "Acesso negado. Faça login para acessar esta página." });
    }
    next();
};

const gerarToken = () => `token_${crypto.randomBytes(16).toString('hex')}`;

module.exports = {
    USUARIOS_CADASTRADOS,
    sessoesAtivas,
    verificarAutenticacao,
    gerarToken
};
