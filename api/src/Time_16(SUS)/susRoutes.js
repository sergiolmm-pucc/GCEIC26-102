const express = require("express");
const router = express.Router();

const {
  FATORES_CO2,
  FATOR_ALIMENTACAO,
  CO2_POR_ARVORE_ANO,
  calcularEmissaoTransporte,
  calcularPegadaMensal,
  calcularCompensacaoArvores
} = require("./susFuncoes");

// healthcheck do modulo
router.get("/health", (req, res) => {
  res.json({ status: "ok", modulo: "SUS - Sustentabilidade", time: 16 });
});

// retorna as tabelas usadas (transporte, dietas, etc)
router.get("/tabelas", (req, res) => {
  res.json({
    transportes: FATORES_CO2,
    dietas: FATOR_ALIMENTACAO,
    co2_por_arvore_ano: CO2_POR_ARVORE_ANO
  });
});

// API 1 - Felipe Andretta
// calcula emissao de CO2 de uma viagem
router.post("/emissao-transporte", (req, res) => {
  try {
    const data = calcularEmissaoTransporte(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// API 2 - Felipe Andretta
// pegada de carbono total do mes
router.post("/pegada-mensal", (req, res) => {
  try {
    const data = calcularPegadaMensal(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// API 3 - Gabriel Lopes
// quantas arvores compensam X kg de CO2
router.post("/compensacao-arvores", (req, res) => {
  try {
    const data = calcularCompensacaoArvores(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
