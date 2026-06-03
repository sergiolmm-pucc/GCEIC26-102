const express = require('express');
const router = express.Router();
const { USUARIOS_CADASTRADOS, sessoesAtivas, gerarToken } = require('../middleware/security');

// ROTAS LEGADAS - Mantidas para compatibilidade com versões anteriores

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    
    const usuario = USUARIOS_CADASTRADOS.find(u => u.email === email && u.senha === senha);
    if (!usuario) return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    
    const tokenSeguro = gerarToken();
    sessoesAtivas.add(tokenSeguro);

    return res.json({
        mensagem: "Login efetuado com sucesso!",
        usuario: { nome: usuario.nome, email: usuario.email },
        token: tokenSeguro
    });
});

router.post('/calculo-combustivel', (req, res) => {
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

module.exports = router;
