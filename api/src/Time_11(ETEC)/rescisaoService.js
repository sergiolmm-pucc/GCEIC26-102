const { calcularINSSProgressivo } = require('./inssService');

// Tipos: 'semJustaCausa' | 'comJustaCausa' | 'pedidoDemissao' | 'acordoComum'
function calcularRescisao(salarioBruto, dataAdmissao, dataRescisao, tipoRescisao, diasTrabalhados) {
  const admissao = new Date(dataAdmissao);
  const rescisao = new Date(dataRescisao);

  // Anos completos trabalhados (para aviso prévio proporcional)
  const anosCompletos = Math.floor(
    (rescisao - admissao) / (1000 * 60 * 60 * 24 * 365.25)
  );

  // Meses trabalhados no ano atual (para 13º proporcional)
  const mesesAno = rescisao.getMonth() - admissao.getMonth() +
    (rescisao.getFullYear() - admissao.getFullYear()) * 12;
  const mesesParaDecimo = Math.min(mesesAno % 12 + 1, 12);

  // Saldo de salário (dias trabalhados no mês da rescisão)
  const saldoSalario = parseFloat(((salarioBruto / 30) * diasTrabalhados).toFixed(2));

  // Férias proporcionais + 1/3
  const mesesParaFerias = Math.min(mesesAno, 12);
  const feriasProporcionais = parseFloat(((salarioBruto / 12) * mesesParaFerias).toFixed(2));
  const umTercoFerias = parseFloat((feriasProporcionais / 3).toFixed(2));
  const totalFerias = parseFloat((feriasProporcionais + umTercoFerias).toFixed(2));

  // 13º proporcional
  const decimoTerceiro = parseFloat(((salarioBruto / 12) * mesesParaDecimo).toFixed(2));

  // Aviso prévio (Lei 12.506/2011)
  // 30 dias base + 3 dias por ano completo, máximo 90 dias
  const diasAviso = Math.min(30 + (anosCompletos * 3), 90);
  const valorAvisoPrevio = parseFloat(((salarioBruto / 30) * diasAviso).toFixed(2));

  // Descontos (INSS sobre saldo e 13º)
  const inssRescisao = calcularINSSProgressivo(saldoSalario + decimoTerceiro);

  let resultado = {
    salarioBruto,
    tipoRescisao,
    anosCompletos,
    saldoSalario,
    feriasProporcionais: totalFerias,
    decimoTerceiro,
    descontos: { inss: inssRescisao },
  };

  if (tipoRescisao === 'semJustaCausa') {
    // Aviso prévio proporcional indenizado + reserva indenizatória (3,2% acumulado)
    resultado.avisoPrevioIndenizado = valorAvisoPrevio;
    resultado.observacaoFGTS = 'A empregada pode sacar FGTS (8%) + reserva indenizatória (3,2%) acumulados. O empregador NÃO paga multa de 40% na rescisão — esse valor já foi recolhido mensalmente via eSocial (LC 150/2015).';
    resultado.totalBruto = parseFloat(
      (saldoSalario + totalFerias + decimoTerceiro + valorAvisoPrevio).toFixed(2)
    );
  } else if (tipoRescisao === 'acordoComum') {
    // Metade do aviso prévio indenizado
    resultado.avisoPrevioIndenizado = parseFloat((valorAvisoPrevio / 2).toFixed(2));
    resultado.observacaoFGTS = 'A empregada pode sacar até 80% do FGTS. Reserva indenizatória: 20% do acumulado. Sem seguro-desemprego.';
    resultado.totalBruto = parseFloat(
      (saldoSalario + totalFerias + decimoTerceiro + resultado.avisoPrevioIndenizado).toFixed(2)
    );
  } else if (tipoRescisao === 'pedidoDemissao') {
    resultado.observacaoFGTS = 'Sem saque de FGTS. Reserva indenizatória retorna ao empregador.';
    resultado.totalBruto = parseFloat(
      (saldoSalario + totalFerias + decimoTerceiro).toFixed(2)
    );
  } else if (tipoRescisao === 'comJustaCausa') {
    resultado.observacaoFGTS = 'Sem FGTS, sem aviso prévio, sem férias proporcionais. Apenas saldo de salário e férias vencidas (se houver).';
    resultado.totalBruto = saldoSalario;
  }

  resultado.totalLiquido = parseFloat((resultado.totalBruto - inssRescisao).toFixed(2));

  return resultado;
}

module.exports = { calcularRescisao };
