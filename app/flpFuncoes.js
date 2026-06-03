// Tabelas vigentes a partir de jan/2026
const TABELA_INSS = {
  faixas: [
    { ate: 1621.00, aliquota: 0.075 },
    { ate: 2902.84, aliquota: 0.090 },
    { ate: 4354.27, aliquota: 0.120 },
    { ate: 8475.55, aliquota: 0.140 },
  ],
  teto: 988.09,
};

const TABELA_IRRF = [
  { ate: 2428.80, aliquota: 0,     deducao: 0      },
  { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { ate: 3751.05, aliquota: 0.150, deducao: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
];

// Reforma da Renda 2026 (Lei nº 15.270/2025): isenção total até R$ 5.000,
// redução decrescente de R$ 5.000,01 até R$ 7.350,00.
const IRRF_REDUTOR_2026 = {
  limite_isencao: 5000.00,
  limite_reducao: 7350.00,
  reducao_maxima: 312.89,
};

const SALARIO_MINIMO      = 1621.00;
const DEDUCAO_DEPENDENTE  = 189.59;
const FGTS_ALIQUOTA       = 0.08;
const HORAS_MES           = 220;
const VT_PERCENTUAL_MAX   = 0.06; // máximo de desconto de VT: 6% do salário base
const DIAS_MES            = 30;

function calcularINSS(salarioBruto) {
  if (salarioBruto < 0) throw new Error('Salário não pode ser negativo');

  let inss = 0;
  let inferior = 0;

  for (const faixa of TABELA_INSS.faixas) {
    if (salarioBruto <= inferior) break;
    const base = Math.min(salarioBruto, faixa.ate) - inferior;
    inss += base * faixa.aliquota;
    inferior = faixa.ate;
  }

  return parseFloat(Math.min(inss, TABELA_INSS.teto).toFixed(2));
}

function calcularIRRF(baseCalculo) {
  if (baseCalculo < 0) throw new Error('Base de cálculo não pode ser negativa');

  for (const faixa of TABELA_IRRF) {
    if (baseCalculo <= faixa.ate) {
      const valor = Math.max(0, baseCalculo * faixa.aliquota - faixa.deducao);
      return {
        valor:    parseFloat(valor.toFixed(2)),
        aliquota: faixa.aliquota,
        deducao:  faixa.deducao,
      };
    }
  }

  const ultima = TABELA_IRRF[TABELA_IRRF.length - 1];
  return {
    valor:    parseFloat((baseCalculo * ultima.aliquota - ultima.deducao).toFixed(2)),
    aliquota: ultima.aliquota,
    deducao:  ultima.deducao,
  };
}

function calcularHorasExtras(salarioBase, horas50, horas100, horaMes = HORAS_MES) {
  if (salarioBase < 0) throw new Error('Salário não pode ser negativo');
  if (horas50  < 0)   throw new Error('Horas extras não podem ser negativas');
  if (horas100 < 0)   throw new Error('Horas extras não podem ser negativas');

  const valorHora = salarioBase / horaMes;
  const extras50  = valorHora * 1.5  * horas50;
  const extras100 = valorHora * 2.0  * horas100;

  return {
    valor_hora: parseFloat(valorHora.toFixed(4)),
    extras_50:  parseFloat(extras50.toFixed(2)),
    extras_100: parseFloat(extras100.toFixed(2)),
    total:      parseFloat((extras50 + extras100).toFixed(2)),
  };
}

function calcularFGTS(salarioBruto) {
  if (salarioBruto < 0) throw new Error('Salário não pode ser negativo');
  return parseFloat((salarioBruto * FGTS_ALIQUOTA).toFixed(2));
}

function calcularBeneficios(salarioBase, dados, horaMes = HORAS_MES) {
  const {
    custoVT       = 0,
    pgtVT         = 'clt',        // 'clt' | 'empresa'
    beneficioVA   = 0,
    pctDescontoVA = 20,           // 0–100 %
    descontoVA    = 0,            // legado
    planoSaude    = 0,
    pgtPlanoSaude = 'funcionario', // 'funcionario' | 'empresa'
    diasFalta     = 0,
    horasAtraso   = 0,
  } = dados;

  // Vale-Transporte
  let vt = 0, vtEmpresa = 0;
  if (custoVT > 0) {
    if (pgtVT === 'empresa') {
      vtEmpresa = parseFloat(custoVT.toFixed(2));
    } else {
      vt        = parseFloat(Math.min(custoVT, salarioBase * VT_PERCENTUAL_MAX).toFixed(2));
      vtEmpresa = parseFloat(Math.max(0, custoVT - salarioBase * VT_PERCENTUAL_MAX).toFixed(2));
    }
  }

  // Vale-Alimentação
  let va = 0, vaEmpresa = 0;
  if (beneficioVA > 0) {
    const pct = Math.max(0, Math.min(100, pctDescontoVA)) / 100;
    va        = parseFloat((beneficioVA * pct).toFixed(2));
    vaEmpresa = parseFloat((beneficioVA * (1 - pct)).toFixed(2));
  } else if (descontoVA > 0) {
    va = parseFloat(Math.max(0, descontoVA).toFixed(2));
  }

  // Plano de Saúde
  let ps = 0, psEmpresa = 0;
  if (planoSaude > 0) {
    if (pgtPlanoSaude === 'empresa') {
      psEmpresa = parseFloat(planoSaude.toFixed(2));
    } else {
      ps        = parseFloat(Math.max(0, planoSaude).toFixed(2));
    }
  }

  const faltas  = diasFalta   > 0 ? parseFloat((diasFalta  * salarioBase / DIAS_MES).toFixed(2)) : 0;
  const atrasos = horasAtraso > 0 ? parseFloat((horasAtraso * salarioBase / horaMes).toFixed(2)) : 0;

  return {
    vale_transporte:  vt,
    vt_empresa:       vtEmpresa,
    vale_alimentacao: va,
    va_empresa:       vaEmpresa,
    plano_saude:      ps,
    ps_empresa:       psEmpresa,
    faltas,
    atrasos,
    total: parseFloat((vt + va + ps + faltas + atrasos).toFixed(2)),
  };
}

function calcularFolha(dados) {
  const {
    salarioBase = 0, dependentes = 0,
    horas50 = 0, horas100 = 0,
    custoVT = 0, pgtVT = 'clt',
    beneficioVA = 0, pctDescontoVA = 20, descontoVA = 0,
    planoSaude = 0, pgtPlanoSaude = 'funcionario',
    diasFalta = 0, horasAtraso = 0,
    horaMes = HORAS_MES,
  } = dados;

  if (salarioBase <= 0) throw new Error('Salário deve ser maior que zero');
  if (dependentes < 0)  throw new Error('Número de dependentes não pode ser negativo');
  if (horas50  < 0)     throw new Error('Horas extras não podem ser negativas');
  if (horas100 < 0)     throw new Error('Horas extras não podem ser negativas');

  const extras       = calcularHorasExtras(salarioBase, horas50, horas100, horaMes);
  const salarioBruto = parseFloat((salarioBase + extras.total).toFixed(2));

  const inss               = calcularINSS(salarioBruto);
  const deducaoDependentes = parseFloat((dependentes * DEDUCAO_DEPENDENTE).toFixed(2));
  const baseIRRF           = parseFloat(Math.max(0, salarioBruto - inss - deducaoDependentes).toFixed(2));
  const irrf               = calcularIRRF(baseIRRF);
  const fgts               = calcularFGTS(salarioBruto);

  // Redutor da Reforma da Renda 2026
  let irrfFinal = irrf.valor;
  if (salarioBruto <= IRRF_REDUTOR_2026.limite_isencao) {
    irrfFinal = 0;
  } else if (salarioBruto <= IRRF_REDUTOR_2026.limite_reducao) {
    const redutor = Math.max(0, 978.62 - 0.133145 * salarioBruto);
    irrfFinal = Math.max(0, parseFloat((irrf.valor - redutor).toFixed(2)));
  }

  const beneficios    = calcularBeneficios(salarioBase, { custoVT, pgtVT, beneficioVA, pctDescontoVA, descontoVA, planoSaude, pgtPlanoSaude, diasFalta, horasAtraso }, horaMes);
  const totalDescontos = parseFloat((inss + irrfFinal + beneficios.total).toFixed(2));
  const salarioLiquido = parseFloat((salarioBruto - totalDescontos).toFixed(2));

  return {
    salario_base:   salarioBase,
    horas_extras:   extras,
    salario_bruto:  salarioBruto,
    descontos: {
      inss,
      irrf:                irrfFinal,
      irrf_aliquota:       `${(irrf.aliquota * 100).toFixed(1)}%`,
      deducao_dependentes: deducaoDependentes,
      beneficios,
      total:               totalDescontos,
    },
    fgts,
    base_irrf:      baseIRRF,
    salario_liquido: salarioLiquido,
  };
}

export {
  calcularINSS,
  calcularIRRF,
  calcularHorasExtras,
  calcularFGTS,
  calcularBeneficios,
  calcularFolha,
  TABELA_INSS,
  TABELA_IRRF,
  IRRF_REDUTOR_2026,
  SALARIO_MINIMO,
  DEDUCAO_DEPENDENTE,
  FGTS_ALIQUOTA,
  HORAS_MES,
};
