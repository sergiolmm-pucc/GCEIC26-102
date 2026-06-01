const express = require('express');
const {
  calcularFatorR,
  calcularSimples,
  calcularProLaboreMinimo,
  listarTabelas,
} = require('./idpj.function');

const router = express.Router();

function responder(res, callback) {
  try {
    return res.json({ success: true, data: callback() });
  } catch (err) {
    return res.status(400).json({ success: false, erro: err.message });
  }
}

router.get('/', (_req, res) => {
  res.json({
    equipe: 'Time_12',
    sigla: 'IDPJ',
    tema: 'Calculo de imposto para Desenvolvedores PJ',
    rotas: ['/fator-r', '/calcular-simples', '/pro-labore-minimo', '/tabelas'],
  });
});

router.get('/tabelas', (_req, res) => {
  res.json({ success: true, data: listarTabelas() });
});

router.post('/fator-r', (req, res) => {
  responder(res, () => calcularFatorR(req.body));
});

router.post('/calcular-simples', (req, res) => {
  responder(res, () => calcularSimples(req.body));
});

router.post('/pro-labore-minimo', (req, res) => {
  responder(res, () => calcularProLaboreMinimo(req.body));
});

module.exports = router;
