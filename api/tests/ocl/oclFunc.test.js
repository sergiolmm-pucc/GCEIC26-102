const {
  calcularMateriais,
  calcularMaoDeObra,
  calcularOverhead,
  calcularEmbalagem,
  calcularCustoTotal,
} = require('../../src/ocl/oclFunc');

describe('OCL — calcularMateriais', () => {
  test('soma armação, lente, componentes e insumos sem perda', () => {
    const r = calcularMateriais({
      armacao: 'acetato',
      lente: 'sol_poli',
      componentes: 1.5,
      insumos: 0.8,
      taxaPerda: 0,
    });
    expect(r.armacao).toBe(18);
    expect(r.lente).toBe(9);
    expect(r.nominal).toBe(29.3);
    expect(r.custoReal).toBe(29.3);
  });

  test('aplica taxa de perda corretamente', () => {
    const r = calcularMateriais({
      armacao: 'acetato',
      lente: 'sol_poli',
      componentes: 1.5,
      insumos: 0.8,
      taxaPerda: 10,
    });
    expect(r.custoReal).toBeCloseTo(29.3 / 0.9, 2);
  });

  test('lança erro para tipo de armação inválido', () => {
    expect(() =>
      calcularMateriais({ armacao: 'madeira', lente: 'sol_poli' }),
    ).toThrow('Tipo de armação inválido');
  });

  test('lança erro para tipo de lente inválido', () => {
    expect(() =>
      calcularMateriais({ armacao: 'acetato', lente: 'cristal' }),
    ).toThrow('Tipo de lente inválido');
  });

  test('lança erro para taxa de perda fora do intervalo', () => {
    expect(() =>
      calcularMateriais({
        armacao: 'acetato',
        lente: 'sol_poli',
        taxaPerda: 100,
      }),
    ).toThrow('Taxa de perda');
  });
});

describe('OCL — calcularMaoDeObra', () => {
  test('calcula MOD com complexidade média', () => {
    const r = calcularMaoDeObra({
      tempoMin: 60,
      custoHora: 20,
      complexidade: 'media',
    });
    expect(r.horas).toBe(1);
    expect(r.mod).toBe(25);
  });

  test('aplica multiplicador de complexidade alta', () => {
    const r = calcularMaoDeObra({
      tempoMin: 30,
      custoHora: 20,
      complexidade: 'alta',
    });
    expect(r.mod).toBeCloseTo(0.5 * 20 * 1.6, 2);
  });

  test('lança erro para complexidade inválida', () => {
    expect(() =>
      calcularMaoDeObra({ tempoMin: 10, custoHora: 10, complexidade: 'xpto' }),
    ).toThrow('Complexidade inválida');
  });

  test('rejeita tempo negativo', () => {
    expect(() =>
      calcularMaoDeObra({ tempoMin: -1, custoHora: 10 }),
    ).toThrow('Tempo por peça');
  });
});

describe('OCL — calcularOverhead', () => {
  test('divide custo fixo pela capacidade mensal', () => {
    expect(
      calcularOverhead({ custoFixoMensal: 15000, capacidadeMensal: 3000 }),
    ).toBe(5);
  });

  test('rejeita capacidade zero', () => {
    expect(() =>
      calcularOverhead({ custoFixoMensal: 1000, capacidadeMensal: 0 }),
    ).toThrow('Capacidade mensal');
  });
});

describe('OCL — calcularEmbalagem', () => {
  test('soma estojo, flanela, caixa e certificado', () => {
    expect(
      calcularEmbalagem({
        estojo: 4.5,
        flanela: 1.2,
        caixa: 1.8,
        certificado: 0.5,
      }),
    ).toBe(8);
  });

  test('considera campos ausentes como zero', () => {
    expect(calcularEmbalagem({ estojo: 5 })).toBe(5);
  });
});

describe('OCL — calcularCustoTotal', () => {
  const basePayload = {
    armacao: 'acetato',
    lente: 'sol_poli',
    componentes: 1.5,
    insumos: 0.8,
    taxaPerda: 8,
    tempoMin: 25,
    custoHora: 22,
    complexidade: 'media',
    custoFixoMensal: 15000,
    capacidadeMensal: 3000,
    estojo: 4.5,
    flanela: 1.2,
    caixa: 1.8,
    certificado: 0.5,
    volumeLote: 1000,
  };

  test('consolida os quatro pilares e o lote', () => {
    const r = calcularCustoTotal(basePayload);
    expect(r.materiais).toBeCloseTo(29.3 / 0.92, 2);
    expect(r.maoDeObra).toBeCloseTo((25 / 60) * 22 * 1.25, 2);
    expect(r.overhead).toBe(5);
    expect(r.embalagem).toBe(8);
    expect(r.custoUnitario).toBeCloseTo(
      r.materiais + r.maoDeObra + r.overhead + r.embalagem,
      2,
    );
    expect(r.custoTotalLote).toBeCloseTo(r.custoUnitario * 1000, 2);
  });

  test('rejeita volume de lote zero', () => {
    expect(() =>
      calcularCustoTotal({ ...basePayload, volumeLote: 0 }),
    ).toThrow('Volume do lote');
  });

  test('inclui detalhes de materiais e mão de obra', () => {
    const r = calcularCustoTotal(basePayload);
    expect(r.detalhes.materiais.armacao).toBe(18);
    expect(r.detalhes.maoDeObra.fator).toBe(1.25);
  });
});
