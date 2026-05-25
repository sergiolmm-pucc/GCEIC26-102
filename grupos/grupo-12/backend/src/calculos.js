const AVISO_ESTIMATIVA =
  'Simulacao educacional. Os valores sao estimativas e nao substituem a orientacao de um contador.';

function arredondar(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

function normalizarNumero(valor, campo, opcoes = {}) {
  const { obrigatorio = true, minimo = 0 } = opcoes;

  if (valor === undefined || valor === null || valor === '') {
    if (obrigatorio) {
      throw new Error(`O campo ${campo} e obrigatorio.`);
    }
    return undefined;
  }

  const normalizado = typeof valor === 'string' ? valor.replace(',', '.') : valor;
  const numero = Number(normalizado);

  if (!Number.isFinite(numero)) {
    throw new Error(`O campo ${campo} deve ser numerico.`);
  }

  if (numero < minimo) {
    throw new Error(`O campo ${campo} deve ser maior ou igual a ${minimo}.`);
  }

  return numero;
}

function normalizarPercentual(valor, campo, opcoes = {}) {
  const numero = normalizarNumero(valor, campo, opcoes);

  if (numero === undefined) {
    return undefined;
  }

  if (numero > 100) {
    throw new Error(`O campo ${campo} deve ser menor ou igual a 100%.`);
  }

  return numero > 1 ? numero / 100 : numero;
}

function calcularFaturamentoMensal(entrada) {
  const receitaInformada = normalizarNumero(entrada.receitaMensal, 'receitaMensal', {
    obrigatorio: false,
    minimo: 0,
  });

  const valorHora = normalizarNumero(entrada.valorHora, 'valorHora', {
    obrigatorio: receitaInformada === undefined,
    minimo: 0,
  });

  const horasTrabalhadas = normalizarNumero(entrada.horasTrabalhadas, 'horasTrabalhadas', {
    obrigatorio: receitaInformada === undefined,
    minimo: 0,
  });

  const receitaMensal =
    receitaInformada !== undefined ? receitaInformada : valorHora * horasTrabalhadas;

  return {
    receitaMensal: arredondar(receitaMensal),
    valorHora: valorHora !== undefined ? arredondar(valorHora) : undefined,
    horasTrabalhadas: horasTrabalhadas !== undefined ? arredondar(horasTrabalhadas) : undefined,
    aviso: AVISO_ESTIMATIVA,
  };
}

function calcularSimplesNacional(entrada) {
  const receitaMensal = normalizarNumero(entrada.receitaMensal, 'receitaMensal', { minimo: 0.01 });
  const receitaAnualEstimativa =
    normalizarNumero(entrada.receitaAnualEstimativa, 'receitaAnualEstimativa', {
      obrigatorio: false,
      minimo: 0.01,
    }) || receitaMensal * 12;
  const aliquotaNominal = normalizarPercentual(entrada.aliquota, 'aliquota', { minimo: 0 });
  const deducao = normalizarNumero(entrada.deducao, 'deducao', {
    obrigatorio: false,
    minimo: 0,
  }) || 0;

  const aliquotaEfetiva = Math.max(
    0,
    (receitaAnualEstimativa * aliquotaNominal - deducao) / receitaAnualEstimativa,
  );
  const impostoEstimado = receitaMensal * aliquotaEfetiva;

  return {
    receitaMensal: arredondar(receitaMensal),
    receitaAnualEstimativa: arredondar(receitaAnualEstimativa),
    aliquotaNominal: arredondar(aliquotaNominal * 100),
    deducao: arredondar(deducao),
    impostoEstimado: arredondar(impostoEstimado),
    aliquotaEfetiva: arredondar(aliquotaEfetiva * 100),
    receitaLiquidaEstimativa: arredondar(receitaMensal - impostoEstimado),
    aviso: AVISO_ESTIMATIVA,
  };
}

function calcularProLaboreInss(entrada) {
  const proLabore = normalizarNumero(entrada.proLabore, 'proLabore', { minimo: 0.01 });
  const percentualINSS = normalizarPercentual(entrada.percentualINSS, 'percentualINSS', {
    minimo: 0,
  });
  const valorINSS = proLabore * percentualINSS;

  return {
    proLabore: arredondar(proLabore),
    percentualINSS: arredondar(percentualINSS * 100),
    valorINSS: arredondar(valorINSS),
    proLaboreLiquido: arredondar(proLabore - valorINSS),
    aviso: AVISO_ESTIMATIVA,
  };
}

function calcularReservaMensal(entrada) {
  const receitaMensal = normalizarNumero(entrada.receitaMensal, 'receitaMensal', { minimo: 0.01 });
  const percentualReservaImpostos = normalizarPercentual(
    entrada.percentualReservaImpostos,
    'percentualReservaImpostos',
    { minimo: 0 },
  );
  const percentualReservaFerias = normalizarPercentual(
    entrada.percentualReservaFerias,
    'percentualReservaFerias',
    { minimo: 0 },
  );
  const percentualReservaEmergencia = normalizarPercentual(
    entrada.percentualReservaEmergencia,
    'percentualReservaEmergencia',
    { minimo: 0 },
  );

  const reservaImpostos = receitaMensal * percentualReservaImpostos;
  const reservaFerias = receitaMensal * percentualReservaFerias;
  const reservaEmergencia = receitaMensal * percentualReservaEmergencia;
  const totalReservas = reservaImpostos + reservaFerias + reservaEmergencia;

  return {
    receitaMensal: arredondar(receitaMensal),
    reservaImpostos: arredondar(reservaImpostos),
    reservaFerias: arredondar(reservaFerias),
    reservaEmergencia: arredondar(reservaEmergencia),
    totalReservas: arredondar(totalReservas),
    valorLiquidoAposReservas: arredondar(receitaMensal - totalReservas),
    aviso: AVISO_ESTIMATIVA,
  };
}

function calcularSimuladorCompleto(entrada) {
  const receitaMensal = normalizarNumero(entrada.receitaMensal, 'receitaMensal', { minimo: 0.01 });
  const proLabore = normalizarNumero(entrada.proLabore, 'proLabore', { minimo: 0 });
  const percentualImposto = normalizarPercentual(entrada.percentualImposto, 'percentualImposto', {
    minimo: 0,
  });
  const percentualINSS = normalizarPercentual(entrada.percentualINSS, 'percentualINSS', {
    minimo: 0,
  });
  const percentualReserva = normalizarPercentual(entrada.percentualReserva, 'percentualReserva', {
    minimo: 0,
  });

  const impostoEstimado = receitaMensal * percentualImposto;
  const inssEstimado = proLabore * percentualINSS;
  const reservaRecomendada = receitaMensal * percentualReserva;
  const valorLiquidoEstimado = receitaMensal - impostoEstimado - inssEstimado - reservaRecomendada;

  return {
    receitaMensal: arredondar(receitaMensal),
    impostoEstimado: arredondar(impostoEstimado),
    inssEstimado: arredondar(inssEstimado),
    reservaRecomendada: arredondar(reservaRecomendada),
    valorLiquidoEstimado: arredondar(valorLiquidoEstimado),
    resumo:
      'A simulacao desconta imposto estimado sobre a receita, INSS sobre o pro-labore e uma reserva mensal configuravel.',
    aviso: AVISO_ESTIMATIVA,
  };
}

module.exports = {
  AVISO_ESTIMATIVA,
  arredondar,
  calcularFaturamentoMensal,
  calcularSimplesNacional,
  calcularProLaboreInss,
  calcularReservaMensal,
  calcularSimuladorCompleto,
};
