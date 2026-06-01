const { calcularINSSProgressivo } = require('./inssService');

// Encargos do empregador doméstico (LC 150/2015)
const INSS_PATRONAL = 0.08;       // 8% - parte do empregador
const FGTS = 0.08;                 // 8% - FGTS mensal
const RESERVA_INDENIZATORIA = 0.032; // 3,2% - substitui multa 40%
const SEGURO_ACIDENTE = 0.008;    // 0,8% - seguro acidente de trabalho

function calcularSalario(salarioBruto) {
  if (salarioBruto < 1621.00) {
    throw new Error('Salário não pode ser inferior ao mínimo de R$ 1.621,00 (2026)');
  }

  const inssEmpregado = calcularINSSProgressivo(salarioBruto);
  const salarioLiquido = salarioBruto - inssEmpregado;

  // Custo total do empregador
  const inssPatronal = Number.parseFloat((salarioBruto * INSS_PATRONAL).toFixed(2));
  const fgts = Number.parseFloat((salarioBruto * FGTS).toFixed(2));
  const reservaIndenizatoria = Number.parseFloat((salarioBruto * RESERVA_INDENIZATORIA).toFixed(2));
  const seguroAcidente = Number.parseFloat((salarioBruto * SEGURO_ACIDENTE).toFixed(2));
  const custoTotalEmpregador = Number.parseFloat(
    (salarioBruto + inssPatronal + fgts + reservaIndenizatoria + seguroAcidente).toFixed(2)
  );

  return {
    salarioBruto,
    
    // Descontos do empregado
    inssEmpregado,
    salarioLiquido: Number.parseFloat(salarioLiquido.toFixed(2)),
    
    // Encargos do empregador (não descontam do empregado)
    encargosEmpregador: {
      inssPatronal,
      fgts,
      reservaIndenizatoria,
      seguroAcidente,
      custoTotalEmpregador,
    },
  };
}

module.exports = { calcularSalario };