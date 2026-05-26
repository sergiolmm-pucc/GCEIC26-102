const express = require('express');
const router = express.Router();
const { calcularFerias } = require('../services/feriasService');

router.post('/', (req, res) => {
  try {
    const { salarioBruto, diasConcedidos } = req.body;

    if (salarioBruto === undefined || salarioBruto === null || salarioBruto === '') {
      return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    }

    const valor = Number(salarioBruto);

    if (isNaN(valor)) {
      return res.status(400).json({ erro: 'Salário Bruto deve ser um número' });
    }

    if (valor <= 0) {
      return res.status(400).json({ erro: 'Salário Bruto deve ser maior que zero' });
    }

    const dias = diasConcedidos !== undefined ? Number(diasConcedidos) : 30;

    if (isNaN(dias) || dias < 10 || dias > 30) {
      return res.status(400).json({ erro: 'Dias Concedidos deve ser um número entre 10 e 30 (mínimo legal: 10 dias por período)' });
    }

    const resultado = calcularFerias(valor, 30, dias);
    res.json(resultado);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;