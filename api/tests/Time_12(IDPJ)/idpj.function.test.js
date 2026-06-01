const {
  calcularFatorR,
  calcularSimples,
  calcularProLaboreMinimo,
  obterFaixa,
  listarTabelas,
} = require('../../src/Time_12(IDPJ)/idpj.function');

describe('IDPJ - funcoes de calculo', () => {
  test('classifica Anexo III quando fator R atinge 28%', () => {
    const resultado = calcularFatorR({ receita12Meses: 120000, folha12Meses: 33600 });

    expect(resultado.fatorR).toBe(0.28);
    expect(resultado.fatorRPercentual).toBe(28);
    expect(resultado.anexo).toBe('III');
    expect(resultado.atingiuFatorR).toBe(true);
  });

  test('classifica Anexo V quando fator R fica abaixo de 28%', () => {
    const resultado = calcularFatorR({ receita12Meses: 240000, folha12Meses: 24000 });

    expect(resultado.fatorR).toBe(0.1);
    expect(resultado.anexo).toBe('V');
    expect(resultado.atingiuFatorR).toBe(false);
  });

  test('seleciona faixas corretas dos Anexos III e V', () => {
    expect(obterFaixa(180000, 'III').faixa).toBe(1);
    expect(obterFaixa(180000.01, 'III').faixa).toBe(2);
    expect(obterFaixa(720000, 'V').faixa).toBe(3);
    expect(obterFaixa(720000.01, 'V').faixa).toBe(4);
  });

  test('calcula DAS pelo Anexo III com aliquota efetiva', () => {
    const resultado = calcularSimples({
      receitaMensal: 10000,
      receita12Meses: 120000,
      folha12Meses: 36000,
    });

    expect(resultado.anexo).toBe('III');
    expect(resultado.faixa).toBe(1);
    expect(resultado.aliquotaEfetivaPercentual).toBe(6);
    expect(resultado.das).toBe(600);
    expect(resultado.receitaAposDas).toBe(9400);
  });

  test('calcula DAS pelo Anexo V quando fator R e menor que 28%', () => {
    const resultado = calcularSimples({
      receitaMensal: 30000,
      receita12Meses: 300000,
      folha12Meses: 30000,
    });

    expect(resultado.anexo).toBe('V');
    expect(resultado.faixa).toBe(2);
    expect(resultado.aliquotaNominalPercentual).toBe(18);
    expect(resultado.aliquotaEfetivaPercentual).toBe(16.5);
    expect(resultado.das).toBe(4950);
  });

  test('calcula pro-labore minimo para atingir o Fator R', () => {
    const resultado = calcularProLaboreMinimo({
      receita12Meses: 240000,
      folha12Meses: 48000,
    });

    expect(resultado.folhaMinima).toBe(67200);
    expect(resultado.diferenca).toBe(19200);
    expect(resultado.sugestaoMensal).toBe(1600);
    expect(resultado.atingiuFatorR).toBe(false);
  });

  test('rejeita receita acima do limite do Simples Nacional', () => {
    expect(() => calcularSimples({
      receitaMensal: 10000,
      receita12Meses: 4800000.01,
      folha12Meses: 1000000,
    })).toThrow('excede o limite');
  });

  test('rejeita entradas invalidas', () => {
    expect(() => calcularFatorR({ receita12Meses: 0, folha12Meses: 0 })).toThrow('maior que zero');
    expect(() => calcularSimples({ receitaMensal: -1, receita12Meses: 100000, folha12Meses: 30000 })).toThrow('nao pode ser negativo');
    expect(() => calcularProLaboreMinimo({ receita12Meses: 'abc', folha12Meses: 0 })).toThrow('numero valido');
  });

  test('lista tabelas oficiais usadas pela calculadora', () => {
    const tabelas = listarTabelas();

    expect(tabelas.fatorRMinimo).toBe(0.28);
    expect(tabelas.anexos.III).toHaveLength(6);
    expect(tabelas.anexos.V).toHaveLength(6);
  });
});
