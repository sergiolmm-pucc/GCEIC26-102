const LIMITE_SIMPLES_NACIONAL = 4800000;
const FATOR_R_MINIMO = 0.28;

const TABELAS_SIMPLES = {
  III: [
    { faixa: 1, limite: 180000, aliquota: 0.06, deducao: 0 },
    { faixa: 2, limite: 360000, aliquota: 0.112, deducao: 9360 },
    { faixa: 3, limite: 720000, aliquota: 0.135, deducao: 17640 },
    { faixa: 4, limite: 1800000, aliquota: 0.16, deducao: 35640 },
    { faixa: 5, limite: 3600000, aliquota: 0.21, deducao: 125640 },
    { faixa: 6, limite: 4800000, aliquota: 0.33, deducao: 648000 },
  ],
  V: [
    { faixa: 1, limite: 180000, aliquota: 0.155, deducao: 0 },
    { faixa: 2, limite: 360000, aliquota: 0.18, deducao: 4500 },
    { faixa: 3, limite: 720000, aliquota: 0.195, deducao: 9900 },
    { faixa: 4, limite: 1800000, aliquota: 0.205, deducao: 17100 },
    { faixa: 5, limite: 3600000, aliquota: 0.23, deducao: 62100 },
    { faixa: 6, limite: 4800000, aliquota: 0.305, deducao: 540000 },
  ],
};

function arredondar(valor, casas = 2) {
  return Number((valor || 0).toFixed(casas));
}

function lerNumero(valor, nome, { obrigatorio = true, permiteZero = false } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obrigatorio) throw new Error(`${nome} deve ser informado`);
    return 0;
  }

  const numero = Number(valor);
  if (!Number.isFinite(numero)) throw new Error(`${nome} deve ser um numero valido`);
  if (numero < 0) throw new Error(`${nome} nao pode ser negativo`);
  if (!permiteZero && numero === 0) throw new Error(`${nome} deve ser maior que zero`);
  return numero;
}

function validarRbt12(receita12Meses) {
  if (receita12Meses > LIMITE_SIMPLES_NACIONAL) {
    throw new Error('Receita dos ultimos 12 meses excede o limite do Simples Nacional');
  }
}

function calcularFatorR(dados = {}) {
  const receita12Meses = lerNumero(dados.receita12Meses, 'Receita dos ultimos 12 meses');
  const folha12Meses = lerNumero(dados.folha12Meses, 'Folha dos ultimos 12 meses', {
    permiteZero: true,
  });

  validarRbt12(receita12Meses);

  const fatorR = folha12Meses / receita12Meses;
  const anexo = fatorR >= FATOR_R_MINIMO ? 'III' : 'V';

  return {
    receita12Meses: arredondar(receita12Meses),
    folha12Meses: arredondar(folha12Meses),
    fatorR: arredondar(fatorR, 4),
    fatorRPercentual: arredondar(fatorR * 100, 2),
    anexo,
    atingiuFatorR: fatorR >= FATOR_R_MINIMO,
  };
}

function obterFaixa(receita12Meses, anexo) {
  const tabela = TABELAS_SIMPLES[anexo];
  if (!tabela) throw new Error('Anexo invalido');

  const faixa = tabela.find((item) => receita12Meses <= item.limite);
  if (!faixa) throw new Error('Receita dos ultimos 12 meses excede o limite do Simples Nacional');

  return faixa;
}

function calcularSimples(dados = {}) {
  const receitaMensal = lerNumero(dados.receitaMensal, 'Receita mensal');
  const fator = calcularFatorR(dados);
  const faixa = obterFaixa(fator.receita12Meses, fator.anexo);
  const aliquotaEfetiva = ((fator.receita12Meses * faixa.aliquota) - faixa.deducao) / fator.receita12Meses;
  const das = receitaMensal * aliquotaEfetiva;

  return {
    receitaMensal: arredondar(receitaMensal),
    receita12Meses: fator.receita12Meses,
    folha12Meses: fator.folha12Meses,
    fatorR: fator.fatorR,
    fatorRPercentual: fator.fatorRPercentual,
    atingiuFatorR: fator.atingiuFatorR,
    anexo: fator.anexo,
    faixa: faixa.faixa,
    limiteSuperior: faixa.limite,
    aliquotaNominal: faixa.aliquota,
    aliquotaNominalPercentual: arredondar(faixa.aliquota * 100, 2),
    deducao: faixa.deducao,
    aliquotaEfetiva: arredondar(aliquotaEfetiva, 4),
    aliquotaEfetivaPercentual: arredondar(aliquotaEfetiva * 100, 2),
    das: arredondar(das),
    receitaAposDas: arredondar(receitaMensal - das),
  };
}

function calcularProLaboreMinimo(dados = {}) {
  const receita12Meses = lerNumero(dados.receita12Meses, 'Receita dos ultimos 12 meses');
  const folha12Meses = lerNumero(dados.folha12Meses, 'Folha dos ultimos 12 meses', {
    permiteZero: true,
  });

  validarRbt12(receita12Meses);

  const folhaMinima = receita12Meses * FATOR_R_MINIMO;
  const diferenca = Math.max(0, folhaMinima - folha12Meses);
  const fatorR = folha12Meses / receita12Meses;

  return {
    receita12Meses: arredondar(receita12Meses),
    folhaAtual: arredondar(folha12Meses),
    folhaMinima: arredondar(folhaMinima),
    diferenca: arredondar(diferenca),
    sugestaoMensal: arredondar(diferenca / 12),
    fatorR: arredondar(fatorR, 4),
    fatorRPercentual: arredondar(fatorR * 100, 2),
    atingiuFatorR: fatorR >= FATOR_R_MINIMO,
    anexoAtual: fatorR >= FATOR_R_MINIMO ? 'III' : 'V',
  };
}

function listarTabelas() {
  return {
    referencia: 'LC 123/2006 - Anexos III e V',
    limiteSimplesNacional: LIMITE_SIMPLES_NACIONAL,
    fatorRMinimo: FATOR_R_MINIMO,
    anexos: TABELAS_SIMPLES,
  };
}

module.exports = {
  LIMITE_SIMPLES_NACIONAL,
  FATOR_R_MINIMO,
  TABELAS_SIMPLES,
  arredondar,
  calcularFatorR,
  obterFaixa,
  calcularSimples,
  calcularProLaboreMinimo,
  listarTabelas,
};
