const express = require('express');
const router = express.Router();
const { calcularRescisao } = require('../services/rescisaoService');

const tiposValidos = ['semJustaCausa', 'comJustaCausa', 'pedidoDemissao', 'acordoComum'];

router.post('/', (req, res) => {
  try {
    const { salarioBruto, dataAdmissao, dataRescisao, tipoRescisao, diasTrabalhados } = req.body;

    if (salarioBruto === undefined || salarioBruto === null || salarioBruto === '') {
      return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    }

    if (!dataAdmissao) {
      return res.status(400).json({ erro: 'Data de Admissão é obrigatória (formato: AAAA-MM-DD)' });
    }

    if (!dataRescisao) {
      return res.status(400).json({ erro: 'Data de Rescisão é obrigatória (formato: AAAA-MM-DD)' });
    }

    if (!tipoRescisao) {
      return res.status(400).json({ erro: 'Tipo de Rescisão é obrigatório' });
    }

    if (diasTrabalhados === undefined || diasTrabalhados === null || diasTrabalhados === '') {
      return res.status(400).json({ erro: 'Dias Trabalhados é obrigatório' });
    }

    const valor = Number(salarioBruto);
    const dias = Number(diasTrabalhados);

    if (isNaN(valor) || valor <= 0) {
      return res.status(400).json({ erro: 'Salário Bruto deve ser um número maior que zero' });
    }

    if (isNaN(dias) || dias < 1 || dias > 31) {
      return res.status(400).json({ erro: 'Dias Trabalhados deve ser um número entre 1 e 31' });
    }

    if (!tiposValidos.includes(tipoRescisao)) {
      return res.status(400).json({
        erro: `tipoRescisao inválido. Use: ${tiposValidos.join(', ')}`
      });
    }

    const admissao = new Date(dataAdmissao);
    const rescisao = new Date(dataRescisao);

    if (isNaN(admissao.getTime())) {
      return res.status(400).json({ erro: 'Data de Admissão inválida. Use o formato AAAA-MM-DD' });
    }

    if (isNaN(rescisao.getTime())) {
      return res.status(400).json({ erro: 'Data de Rescisão inválida. Use o formato AAAA-MM-DD' });
    }

    if (rescisao <= admissao) {
      return res.status(400).json({ erro: 'Data de Rescisão deve ser posterior à dataAdmissao' });
    }

    const resultado = calcularRescisao(valor, dataAdmissao, dataRescisao, tipoRescisao, dias);
    res.json(resultado);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;
