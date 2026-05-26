const express = require('express');
const router = express.Router();

const { calcularSalario } = require('./salarioService');
const { calcularFerias } = require('./feriasService');
const { calcularDecimoTerceiro } = require('./decimoTerceiroService');
const { calcularRescisao } = require('./rescisaoService');

// GET /ETEC11/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), team: 'Time_11(ETEC)' });
});

// POST /ETEC11/salario
router.post('/salario', (req, res) => {
  try {
    const { salarioBruto } = req.body;
    if (salarioBruto === undefined || salarioBruto === null || salarioBruto === '')
      return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    const valor = Number(salarioBruto);
    if (isNaN(valor)) return res.status(400).json({ erro: 'Salário Bruto deve ser um número' });
    if (valor <= 0) return res.status(400).json({ erro: 'Salário Bruto deve ser maior que zero' });
    res.json(calcularSalario(valor));
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// POST /ETEC11/ferias
router.post('/ferias', (req, res) => {
  try {
    const { salarioBruto, diasConcedidos } = req.body;
    if (salarioBruto === undefined || salarioBruto === null || salarioBruto === '')
      return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    const valor = Number(salarioBruto);
    if (isNaN(valor)) return res.status(400).json({ erro: 'Salário Bruto deve ser um número' });
    if (valor <= 0) return res.status(400).json({ erro: 'Salário Bruto deve ser maior que zero' });
    const dias = diasConcedidos !== undefined ? Number(diasConcedidos) : 30;
    if (isNaN(dias) || dias < 10 || dias > 30)
      return res.status(400).json({ erro: 'Dias Concedidos deve ser um número entre 10 e 30' });
    res.json(calcularFerias(valor, 30, dias));
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// POST /ETEC11/decimo-terceiro
router.post('/decimo-terceiro', (req, res) => {
  try {
    const { salarioBruto, mesesTrabalhados } = req.body;
    if (salarioBruto === undefined || salarioBruto === null || salarioBruto === '')
      return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    if (mesesTrabalhados === undefined || mesesTrabalhados === null || mesesTrabalhados === '')
      return res.status(400).json({ erro: 'Meses Trabalhados é obrigatório' });
    const valor = Number(salarioBruto);
    const meses = Number(mesesTrabalhados);
    if (isNaN(valor)) return res.status(400).json({ erro: 'Salário Bruto deve ser um número' });
    if (isNaN(meses)) return res.status(400).json({ erro: 'Meses Trabalhados deve ser um número' });
    if (valor <= 0) return res.status(400).json({ erro: 'Salário Bruto deve ser maior que zero' });
    if (meses < 1 || meses > 12) return res.status(400).json({ erro: 'Meses Trabalhados deve ser entre 1 e 12' });
    if (!Number.isInteger(meses)) return res.status(400).json({ erro: 'Meses Trabalhados deve ser um número inteiro' });
    res.json(calcularDecimoTerceiro(valor, meses));
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// POST /ETEC11/rescisao
router.post('/rescisao', (req, res) => {
  try {
    const { salarioBruto, dataAdmissao, dataRescisao, tipoRescisao, diasTrabalhados } = req.body;
    const tiposValidos = ['semJustaCausa', 'comJustaCausa', 'pedidoDemissao', 'acordoComum'];
    if (!salarioBruto && salarioBruto !== 0) return res.status(400).json({ erro: 'Salário Bruto é obrigatório' });
    if (!dataAdmissao) return res.status(400).json({ erro: 'Data de Admissão é obrigatória (formato: AAAA-MM-DD)' });
    if (!dataRescisao) return res.status(400).json({ erro: 'Data de Rescisão é obrigatória (formato: AAAA-MM-DD)' });
    if (!tipoRescisao) return res.status(400).json({ erro: 'Tipo de Rescisão é obrigatório' });
    if (diasTrabalhados === undefined || diasTrabalhados === null || diasTrabalhados === '')
      return res.status(400).json({ erro: 'Dias Trabalhados é obrigatório' });
    const valor = Number(salarioBruto);
    const dias = Number(diasTrabalhados);
    if (isNaN(valor) || valor <= 0) return res.status(400).json({ erro: 'Salário Bruto deve ser um número maior que zero' });
    if (isNaN(dias) || dias < 1 || dias > 31) return res.status(400).json({ erro: 'Dias Trabalhados deve ser um número entre 1 e 31' });
    if (!tiposValidos.includes(tipoRescisao)) return res.status(400).json({ erro: `tipoRescisao inválido. Use: ${tiposValidos.join(', ')}` });
    const admissao = new Date(dataAdmissao);
    const rescisao = new Date(dataRescisao);
    if (isNaN(admissao.getTime())) return res.status(400).json({ erro: 'Data de Admissão inválida. Use o formato AAAA-MM-DD' });
    if (isNaN(rescisao.getTime())) return res.status(400).json({ erro: 'Data de Rescisão inválida. Use o formato AAAA-MM-DD' });
    if (rescisao <= admissao) return res.status(400).json({ erro: 'Data de Rescisão deve ser posterior à dataAdmissao' });
    res.json(calcularRescisao(valor, dataAdmissao, dataRescisao, tipoRescisao, dias));
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;
