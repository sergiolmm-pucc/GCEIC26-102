const express = require('express');
const cors = require('cors');
const {
  AVISO_ESTIMATIVA,
  calcularFaturamentoMensal,
  calcularSimplesNacional,
  calcularProLaboreInss,
  calcularReservaMensal,
  calcularSimuladorCompleto,
} = require('./calculos');

const app = express();

app.use(cors());
app.use(express.json());

function responderCalculo(calculadora) {
  return (req, res) => {
    try {
      const resultado = calculadora(req.body || {});
      return res.status(200).json({ success: true, data: resultado, aviso: AVISO_ESTIMATIVA });
    } catch (erro) {
      return res.status(400).json({
        success: false,
        error: erro.message,
        aviso: AVISO_ESTIMATIVA,
      });
    }
  };
}

app.get('/api/grupo12/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    grupo: 'Grupo 12',
    tema: 'Calculo de impostos para desenvolvedores PJ',
    aviso: AVISO_ESTIMATIVA,
  });
});

app.post('/api/grupo12/faturamento-mensal', responderCalculo(calcularFaturamentoMensal));
app.post('/api/grupo12/impostos-pj', responderCalculo(calcularSimplesNacional));
app.post('/api/grupo12/pro-labore-inss', responderCalculo(calcularProLaboreInss));
app.post('/api/grupo12/reservas', responderCalculo(calcularReservaMensal));
app.post('/api/grupo12/simulador', responderCalculo(calcularSimuladorCompleto));

module.exports = app;
