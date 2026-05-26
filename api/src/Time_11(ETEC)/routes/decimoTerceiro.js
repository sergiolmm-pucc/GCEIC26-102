const express = require('express');
const router = express.Router();
const { calcularDecimoTerceiro } = require('../services/decimoTerceiroService');

router.post('/', (req, res) => {
  try {
    const { salarioBruto, mesesTrabalhados } = req.body;

    if (salarioBruto === undefined || salarioBruto === null || salarioBruto === '') {
      return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    }

    if (mesesTrabalhados === undefined || mesesTrabalhados === null || mesesTrabalhados === '') {
      return res.status(400).json({ erro: 'Meses Trabalhados é obrigatório' });
    }

    const valor = Number(salarioBruto);
    const meses = Number(mesesTrabalhados);

    if (isNaN(valor)) {
      return res.status(400).json({ erro: 'Salário Bruto deve ser um número' });
    }

    if (isNaN(meses)) {
      return res.status(400).json({ erro: 'Meses Trabalhados deve ser um número' });
    }

    if (valor <= 0) {
      return res.status(400).json({ erro: 'Salário Bruto deve ser maior que zero' });
    }

    if (meses < 1 || meses > 12) {
      return res.status(400).json({ erro: 'Meses Trabalhados deve ser entre 1 e 12' });
    }

    if (!Number.isInteger(meses)) {
      return res.status(400).json({ erro: 'Meses Trabalhados deve ser um número inteiro' });
    }

    const resultado = calcularDecimoTerceiro(valor, meses);
    res.json(resultado);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;
