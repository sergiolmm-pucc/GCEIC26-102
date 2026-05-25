const {
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
} = require('../../src/flp/flpFuncoes');

// ── calcularINSS ──────────────────────────────────────────────────────────────

describe('calcularINSS', () => {
  test('salário na 1ª faixa (R$1000): 7,5%', () => {
    expect(calcularINSS(1000)).toBeCloseTo(75, 2);
  });

  test('salário exato no teto da 1ª faixa (R$1621): 7,5%', () => {
    expect(calcularINSS(1621)).toBeCloseTo(1621 * 0.075, 2);
  });

  test('salário na 2ª faixa (R$2000): progressivo correto', () => {
    const faixa1 = 1621 * 0.075;
    const faixa2 = (2000 - 1621) * 0.09;
    expect(calcularINSS(2000)).toBeCloseTo(faixa1 + faixa2, 2);
  });

  test('salário na 3ª faixa (R$3000): progressivo correto', () => {
    const f1 = 1621 * 0.075;
    const f2 = (2902.84 - 1621) * 0.09;
    const f3 = (3000 - 2902.84) * 0.12;
    expect(calcularINSS(3000)).toBeCloseTo(f1 + f2 + f3, 2);
  });

  test('salário na 4ª faixa (R$5000): progressivo correto', () => {
    const f1 = 1621 * 0.075;
    const f2 = (2902.84 - 1621) * 0.09;
    const f3 = (4354.27 - 2902.84) * 0.12;
    const f4 = (5000 - 4354.27) * 0.14;
    expect(calcularINSS(5000)).toBeCloseTo(f1 + f2 + f3 + f4, 2);
  });

  test('salário acima do teto (R$10000): retorna teto R$988.09', () => {
    expect(calcularINSS(10000)).toBe(TABELA_INSS.teto);
  });

  test('salário zero: INSS zero', () => {
    expect(calcularINSS(0)).toBe(0);
  });

  test('lança erro para salário negativo', () => {
    expect(() => calcularINSS(-100)).toThrow('Salário não pode ser negativo');
  });

  test('INSS cresce com o salário', () => {
    expect(calcularINSS(3000)).toBeGreaterThan(calcularINSS(2000));
    expect(calcularINSS(5000)).toBeGreaterThan(calcularINSS(3000));
  });

  test('resultado com 2 casas decimais', () => {
    const r = calcularINSS(1500);
    expect(Number.isFinite(r)).toBe(true);
    expect(r.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
  });
});

// ── calcularIRRF ──────────────────────────────────────────────────────────────

describe('calcularIRRF', () => {
  test('base até R$2428,80: isento (zero)', () => {
    expect(calcularIRRF(2000).valor).toBe(0);
    expect(calcularIRRF(2428.80).valor).toBe(0);
  });

  test('base R$2600: alíquota 7,5%', () => {
    const r = calcularIRRF(2600);
    expect(r.aliquota).toBe(0.075);
    const esperado = Math.max(0, 2600 * 0.075 - 182.16);
    expect(r.valor).toBeCloseTo(esperado, 2);
  });

  test('base R$3200: alíquota 15%', () => {
    const r = calcularIRRF(3200);
    expect(r.aliquota).toBe(0.15);
    const esperado = Math.max(0, 3200 * 0.15 - 394.16);
    expect(r.valor).toBeCloseTo(esperado, 2);
  });

  test('base R$4000: alíquota 22,5%', () => {
    const r = calcularIRRF(4000);
    expect(r.aliquota).toBe(0.225);
    const esperado = Math.max(0, 4000 * 0.225 - 675.49);
    expect(r.valor).toBeCloseTo(esperado, 2);
  });

  test('base R$6000: alíquota 27,5%', () => {
    const r = calcularIRRF(6000);
    expect(r.aliquota).toBe(0.275);
    const esperado = Math.max(0, 6000 * 0.275 - 908.73);
    expect(r.valor).toBeCloseTo(esperado, 2);
  });

  test('valor nunca negativo', () => {
    [0, 500, 1000, 2000, 2260, 3000, 5000, 10000].forEach(base => {
      expect(calcularIRRF(base).valor).toBeGreaterThanOrEqual(0);
    });
  });

  test('lança erro para base negativa', () => {
    expect(() => calcularIRRF(-1)).toThrow('Base de cálculo não pode ser negativa');
  });

  test('retorna aliquota e deducao na resposta', () => {
    const r = calcularIRRF(3000);
    expect(r).toHaveProperty('aliquota');
    expect(r).toHaveProperty('deducao');
    expect(r).toHaveProperty('valor');
  });
});

// ── calcularHorasExtras ───────────────────────────────────────────────────────

describe('calcularHorasExtras', () => {
  test('sem horas extras: total zero', () => {
    expect(calcularHorasExtras(2200, 0, 0).total).toBe(0);
  });

  test('valor hora correto (salário/220)', () => {
    const r = calcularHorasExtras(2200, 0, 0);
    expect(r.valor_hora).toBeCloseTo(2200 / 220, 4);
  });

  test('extras 50%: valor correto', () => {
    const r = calcularHorasExtras(2200, 10, 0);
    const esperado = (2200 / 220) * 1.5 * 10;
    expect(r.extras_50).toBeCloseTo(esperado, 2);
  });

  test('extras 100%: valor correto', () => {
    const r = calcularHorasExtras(2200, 0, 5);
    const esperado = (2200 / 220) * 2.0 * 5;
    expect(r.extras_100).toBeCloseTo(esperado, 2);
  });

  test('total = extras50 + extras100', () => {
    const r = calcularHorasExtras(3000, 8, 4);
    expect(r.total).toBeCloseTo(r.extras_50 + r.extras_100, 2);
  });

  test('lança erro para salário negativo', () => {
    expect(() => calcularHorasExtras(-100, 0, 0)).toThrow('Salário não pode ser negativo');
  });

  test('lança erro para horas negativas (50%)', () => {
    expect(() => calcularHorasExtras(2000, -1, 0)).toThrow('Horas extras não podem ser negativas');
  });

  test('lança erro para horas negativas (100%)', () => {
    expect(() => calcularHorasExtras(2000, 0, -1)).toThrow('Horas extras não podem ser negativas');
  });

  test('dobrar horas dobra o valor aproximadamente', () => {
    const r4 = calcularHorasExtras(2000, 4, 0);
    const r8 = calcularHorasExtras(2000, 8, 0);
    expect(r8.extras_50).toBeCloseTo(r4.extras_50 * 2, 0);
  });
});

// ── calcularFGTS ──────────────────────────────────────────────────────────────

describe('calcularFGTS', () => {
  test('R$1000 → R$80 (8%)', () => expect(calcularFGTS(1000)).toBe(80));
  test('R$2500 → R$200', () => expect(calcularFGTS(2500)).toBe(200));
  test('R$5000 → R$400', () => expect(calcularFGTS(5000)).toBe(400));

  test('zero para salário zero', () => expect(calcularFGTS(0)).toBe(0));

  test('dobrar salário dobra FGTS', () => {
    expect(calcularFGTS(4000)).toBe(calcularFGTS(2000) * 2);
  });

  test('alíquota consistente com FGTS_ALIQUOTA (8%)', () => {
    const sal = 3300;
    expect(calcularFGTS(sal)).toBeCloseTo(sal * FGTS_ALIQUOTA, 2);
  });

  test('lança erro para salário negativo', () => {
    expect(() => calcularFGTS(-500)).toThrow('Salário não pode ser negativo');
  });
});

// ── calcularBeneficios ────────────────────────────────────────────────────────

describe('calcularBeneficios', () => {
  test('sem benefícios: todos os valores zero', () => {
    const r = calcularBeneficios(3000, {});
    expect(r.vale_transporte).toBe(0);
    expect(r.vt_empresa).toBe(0);
    expect(r.vale_alimentacao).toBe(0);
    expect(r.va_empresa).toBe(0);
    expect(r.plano_saude).toBe(0);
    expect(r.ps_empresa).toBe(0);
    expect(r.total).toBe(0);
  });

  test('VT regra CLT: custo dentro do limite de 6% — funcionário paga tudo', () => {
    const r = calcularBeneficios(3000, { custoVT: 150 }); // 6% de 3000 = 180
    expect(r.vale_transporte).toBe(150);
    expect(r.vt_empresa).toBe(0);
  });

  test('VT regra CLT: custo acima do limite — empresa arca com excedente', () => {
    const r = calcularBeneficios(3000, { custoVT: 250 }); // 6% de 3000 = 180
    expect(r.vale_transporte).toBeCloseTo(180, 2);
    expect(r.vt_empresa).toBeCloseTo(70, 2);
  });

  test('VT pago pela empresa: funcionário paga zero, empresa arca com tudo', () => {
    const r = calcularBeneficios(3000, { custoVT: 300, pgtVT: 'empresa' });
    expect(r.vale_transporte).toBe(0);
    expect(r.vt_empresa).toBe(300);
  });

  test('VA com pctDescontoVA 20%: desconto e parte empresa corretos', () => {
    const r = calcularBeneficios(3000, { beneficioVA: 500, pctDescontoVA: 20 });
    expect(r.vale_alimentacao).toBeCloseTo(100, 2);
    expect(r.va_empresa).toBeCloseTo(400, 2);
  });

  test('VA com pctDescontoVA 0%: funcionário não paga nada', () => {
    const r = calcularBeneficios(3000, { beneficioVA: 500, pctDescontoVA: 0 });
    expect(r.vale_alimentacao).toBe(0);
    expect(r.va_empresa).toBeCloseTo(500, 2);
  });

  test('VA legado com descontoVA: desconto direto aplicado sem va_empresa', () => {
    const r = calcularBeneficios(3000, { descontoVA: 80 });
    expect(r.vale_alimentacao).toBe(80);
    expect(r.va_empresa).toBe(0);
  });

  test('Plano de Saúde pago pelo funcionário: desconta do holerite', () => {
    const r = calcularBeneficios(3000, { planoSaude: 200 });
    expect(r.plano_saude).toBe(200);
    expect(r.ps_empresa).toBe(0);
  });

  test('Plano de Saúde pago pela empresa: funcionário paga zero', () => {
    const r = calcularBeneficios(3000, { planoSaude: 200, pgtPlanoSaude: 'empresa' });
    expect(r.plano_saude).toBe(0);
    expect(r.ps_empresa).toBe(200);
  });

  test('faltas: desconto = diasFalta × salário / 30', () => {
    const r = calcularBeneficios(3000, { diasFalta: 2 });
    expect(r.faltas).toBeCloseTo(2 * 3000 / 30, 2);
    expect(r.atrasos).toBe(0);
  });

  test('atrasos: desconto = horasAtraso × salário / jornada', () => {
    const r = calcularBeneficios(3000, { horasAtraso: 3 });
    expect(r.atrasos).toBeCloseTo(3 * 3000 / 220, 2);
    expect(r.faltas).toBe(0);
  });

  test('total = vt + va + ps + faltas + atrasos (sem encargos patronais)', () => {
    const r = calcularBeneficios(3000, {
      custoVT: 150, beneficioVA: 500, pctDescontoVA: 20,
      planoSaude: 200, diasFalta: 1,
    });
    const esperado = r.vale_transporte + r.vale_alimentacao + r.plano_saude + r.faltas + r.atrasos;
    expect(r.total).toBeCloseTo(esperado, 2);
  });

  test('VT patronal não entra no total de descontos do funcionário', () => {
    const r = calcularBeneficios(3000, { custoVT: 300, pgtVT: 'empresa' });
    expect(r.total).toBe(0); // funcionário não paga nada
    expect(r.vt_empresa).toBe(300);
  });
});

// ── calcularFolha ─────────────────────────────────────────────────────────────

describe('calcularFolha', () => {
  test('estrutura completa retornada', () => {
    const r = calcularFolha({ salarioBase: 3000 });
    expect(r).toHaveProperty('salario_base');
    expect(r).toHaveProperty('salario_bruto');
    expect(r).toHaveProperty('horas_extras');
    expect(r).toHaveProperty('descontos');
    expect(r).toHaveProperty('fgts');
    expect(r).toHaveProperty('base_irrf');
    expect(r).toHaveProperty('salario_liquido');
  });

  test('descontos contêm INSS, IRRF, deducao_dependentes e total', () => {
    const r = calcularFolha({ salarioBase: 3000 });
    expect(r.descontos).toHaveProperty('inss');
    expect(r.descontos).toHaveProperty('irrf');
    expect(r.descontos).toHaveProperty('deducao_dependentes');
    expect(r.descontos).toHaveProperty('total');
  });

  test('salário líquido = bruto - INSS - IRRF', () => {
    const r = calcularFolha({ salarioBase: 4000 });
    expect(r.salario_liquido).toBeCloseTo(r.salario_bruto - r.descontos.inss - r.descontos.irrf, 2);
  });

  test('sem horas extras: salario_bruto = salario_base', () => {
    const r = calcularFolha({ salarioBase: 3500 });
    expect(r.salario_bruto).toBe(3500);
    expect(r.horas_extras.total).toBe(0);
  });

  test('com horas extras: salario_bruto maior que base', () => {
    const r = calcularFolha({ salarioBase: 3000, horas50: 10 });
    expect(r.salario_bruto).toBeGreaterThan(3000);
  });

  test('dependentes reduzem base do IRRF', () => {
    const semDep  = calcularFolha({ salarioBase: 5000, dependentes: 0 });
    const comDep  = calcularFolha({ salarioBase: 5000, dependentes: 2 });
    expect(comDep.base_irrf).toBeLessThan(semDep.base_irrf);
    expect(comDep.descontos.irrf).toBeLessThanOrEqual(semDep.descontos.irrf);
  });

  test('deducao_dependentes = dependentes × DEDUCAO_DEPENDENTE', () => {
    const r = calcularFolha({ salarioBase: 4000, dependentes: 3 });
    expect(r.descontos.deducao_dependentes).toBeCloseTo(3 * DEDUCAO_DEPENDENTE, 2);
  });

  test('FGTS = 8% do salário bruto', () => {
    const r = calcularFolha({ salarioBase: 3000, horas50: 5 });
    expect(r.fgts).toBeCloseTo(r.salario_bruto * 0.08, 2);
  });

  test('salário mínimo 2026 (R$1621): sem IRRF (isento)', () => {
    const r = calcularFolha({ salarioBase: SALARIO_MINIMO });
    expect(r.descontos.irrf).toBe(0);
  });

  test('reforma 2026: salário R$5000 isento de IRRF', () => {
    const r = calcularFolha({ salarioBase: 5000 });
    expect(r.descontos.irrf).toBe(0);
  });

  test('reforma 2026: salário R$8000 (acima de R$7350) tem IRRF pleno', () => {
    const r = calcularFolha({ salarioBase: 8000 });
    expect(r.descontos.irrf).toBeGreaterThan(0);
  });

  test('reforma 2026: salário entre R$5001 e R$7350 tem redução parcial de IRRF', () => {
    const r = calcularFolha({ salarioBase: 6000 });
    expect(r.descontos.irrf).toBeGreaterThan(0);
    expect(r.salario_bruto).toBeGreaterThan(IRRF_REDUTOR_2026.limite_isencao);
    expect(r.salario_bruto).toBeLessThanOrEqual(IRRF_REDUTOR_2026.limite_reducao);
  });

  test('salário alto (R$15000): INSS no teto', () => {
    const r = calcularFolha({ salarioBase: 15000 });
    expect(r.descontos.inss).toBe(TABELA_INSS.teto);
  });

  test('lança erro para salário zero', () => {
    expect(() => calcularFolha({ salarioBase: 0 })).toThrow('Salário deve ser maior que zero');
  });

  test('lança erro para salário negativo', () => {
    expect(() => calcularFolha({ salarioBase: -1 })).toThrow('Salário deve ser maior que zero');
  });

  test('lança erro para dependentes negativos', () => {
    expect(() => calcularFolha({ salarioBase: 3000, dependentes: -1 })).toThrow();
  });

  test('irrf_aliquota formatado como percentual', () => {
    const r = calcularFolha({ salarioBase: 5000 });
    expect(r.descontos.irrf_aliquota).toMatch(/^\d+\.\d%$/);
  });

  test('total de descontos = INSS + IRRF', () => {
    const r = calcularFolha({ salarioBase: 4500 });
    expect(r.descontos.total).toBeCloseTo(r.descontos.inss + r.descontos.irrf, 2);
  });
});
