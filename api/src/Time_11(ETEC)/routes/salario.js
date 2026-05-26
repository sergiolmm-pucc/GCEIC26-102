const express = require('express');
const router = express.Router();
const { calcularSalario } = require('../services/salarioService');

router.post('/', (req, res) => {
  try {
    const { salarioBruto } = req.body;

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

    const resultado = calcularSalario(valor);
    res.json(resultado);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;