const express = require('express');
const {
  calcularMateriais,
  calcularMaoDeObra,
  calcularCustoTotal,
} = require('./oclFunc');

const router = express.Router();

router.post('/materiais', (req, res) => {
  try {
    const result = calcularMateriais(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/maoDeObra', (req, res) => {
  try {
    const result = calcularMaoDeObra(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/custoTotal', (req, res) => {
  try {
    const result = calcularCustoTotal(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
