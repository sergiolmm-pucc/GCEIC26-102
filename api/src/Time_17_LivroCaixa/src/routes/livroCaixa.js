const express = require('express');
const ctrl = require('../controllers/livroCaixaController');

const router = express.Router();

// Aluno 1
router.post('/lancamento', ctrl.criarLancamento);
router.get('/lancamentos', ctrl.listarLancamentos);
router.get('/saldo', ctrl.obterSaldo);
router.delete('/lancamento/:id', ctrl.deletarLancamento);

// Aluno 2
router.get('/resumo-mensal', ctrl.resumoMensal);
router.get('/por-categoria', ctrl.porCategoria);

// Aluno 3
router.get('/livro-caixa-anual', ctrl.livroCaixaAnual);
router.get('/exportar-csv', ctrl.exportarCSV);

module.exports = router;
