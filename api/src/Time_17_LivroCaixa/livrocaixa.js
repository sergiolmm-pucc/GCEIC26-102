const express = require('express');
const router = express.Router();

router.post('/calc-livro', (req, res) => {
    const { receita, despesa, investimento } = req.body;
    const resultado = Number(receita) - (Number(despesa) + Number(investimento));
    res.json({ resultado });
});

router.post('/calc-preju', (req, res) => {
    const { resultadoAno, prejuizoAcumulado } = req.body;
    const novoResultado = Number(resultadoAno) - Number(prejuizoAcumulado);
    res.json({ novoResultado });
});

router.post('/calc-arbitramento', (req, res) => {
    const { receita } = req.body;
    const limite = Number(receita) * 0.2;
    res.json({ limite });
});

module.exports = router;