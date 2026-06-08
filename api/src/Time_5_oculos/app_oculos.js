const express = require('express');
const router = express.Router();

const {
  TABELA,
  calcularCustoMateriais,
  calcularMaoDeObra,
  calcularOverhead,
  calcularEmbalagem,
  calcularPrecoVenda,
  calcularCustoTotal,
} = require('./funcoes_oculos');

// GET /api/Time_5_oculos/tabelas
router.get('/tabelas', (req, res) => {
  res.json({ success: true, data: TABELA });
});

// POST /api/Time_5_oculos/materiais
router.post('/materiais', (req, res) => {
  try {
    const { materialArmacao, tipoLente, materialLente } = req.body;
    if (!materialArmacao || !tipoLente || !materialLente) {
      return res.status(400).json({
        success: false,
        error: 'Informe materialArmacao, tipoLente e materialLente',
      });
    }
    const custo = calcularCustoMateriais(req.body);
    return res.status(200).json({ success: true, data: custo });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/Time_5_oculos/mao-de-obra
router.post('/mao-de-obra', (req, res) => {
  try {
    const custo = calcularMaoDeObra(req.body);
    return res.status(200).json({ success: true, data: custo });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/Time_5_oculos/overhead
router.post('/overhead', (req, res) => {
  try {
    if (req.body.volumeProducao === undefined) {
      return res.status(400).json({ success: false, error: 'Informe o volumeProducao' });
    }
    const custo = calcularOverhead(req.body);
    return res.status(200).json({ success: true, data: custo });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/Time_5_oculos/embalagem
router.get('/embalagem', (req, res) => {
  return res.status(200).json({ success: true, data: calcularEmbalagem() });
});

// POST /api/Time_5_oculos/preco-venda
router.post('/preco-venda', (req, res) => {
  try {
    const { custo, margemLucro } = req.body;
    if (custo === undefined) {
      return res.status(400).json({ success: false, error: 'Informe o custo' });
    }
    const data = calcularPrecoVenda(Number(custo), margemLucro);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/Time_5_oculos/calcular-total
router.post('/calcular-total', (req, res) => {
  try {
    const dados = req.body;
    if (
      dados.materialArmacao === undefined ||
      dados.tipoLente === undefined ||
      dados.materialLente === undefined ||
      dados.volumeProducao === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Informe materialArmacao, tipoLente, materialLente e volumeProducao',
      });
    }
    const resultado = calcularCustoTotal(dados);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
