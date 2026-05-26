const { calcularINSSProgressivo } = require('./inssService');

function calcularFerias(salarioBruto, diasDireito = 30, diasConcedidos = 30) {
  
  // Férias podem ser fracionadas; base é 30 dias = salário completo
  const proporcaoFerias = diasConcedidos / 30;
  const valorFerias = salarioBruto * proporcaoFerias;
  const umTerco = parseFloat((valorFerias / 3).toFixed(2));
  const totalBruto = parseFloat((valorFerias + umTerco).toFixed(2));

  // INSS sobre férias é calculado sobre o valor total (férias + 1/3)
  const inss = calcularINSSProgressivo(totalBruto);

  // Férias + 1/3 são ISENTAS de IRRF (art. 6º, V, Lei 7.713/88)
  const totalLiquido = parseFloat((totalBruto - inss).toFixed(2));

  return {
    salarioBruto,
    diasConcedidos,
    valorFerias: parseFloat(valorFerias.toFixed(2)),
    umTercoConstitucional: umTerco,
    totalBruto,
    inssEmpregado: inss,
    observacao: 'Férias + 1/3 são isentas de IRRF',
    totalLiquido,
  };
}

module.exports = { calcularFerias };