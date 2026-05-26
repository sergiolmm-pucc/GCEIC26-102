const { calcularINSSProgressivo } = require('./inssService');

function calcularDecimoTerceiro(salarioBruto, mesesTrabalhados) {
  
  // Mês com 15+ dias trabalhados conta como mês completo
  if (mesesTrabalhados < 1 || mesesTrabalhados > 12) {
    throw new Error('Meses trabalhados deve ser entre 1 e 12');
  }

  // 1ª parcela (paga até 30/nov): metade do valor bruto, sem descontos
  const totalBruto = parseFloat(((salarioBruto / 12) * mesesTrabalhados).toFixed(2));
  const primeiraParcela = parseFloat((totalBruto / 2).toFixed(2));

  // 2ª parcela (paga até 20/dez): descontam INSS e IRRF
  const inss = calcularINSSProgressivo(totalBruto);
  const segundaParcela = parseFloat((totalBruto - primeiraParcela - inss).toFixed(2));

  return {
    salarioBruto,
    mesesTrabalhados,
    totalBruto,
    primeiraParcela,
    inssEmpregado: inss,
    segundaParcela,
    observacao: 'INSS incide sobre o valor total na 2ª parcela. IRRF não calculado (depende de outras rendas)',
  };
}

module.exports = { calcularDecimoTerceiro };