const {
  calcularEmissaoTransporte,
  calcularPegadaMensal,
  calcularCompensacaoArvores,
  FATORES_CO2,
  CO2_POR_ARVORE_ANO
} = require("../../src/Time_16(SUS)/susFuncoes");

describe("calcularEmissaoTransporte", () => {

  test("calcula emissao basica de carro a gasolina por 10km", () => {
    const r = calcularEmissaoTransporte({ transporte: "carro_gasolina", km: 10 });
    expect(r.emissao_kg_co2).toBeCloseTo(1.92, 3);
    expect(r.fator_kg_por_km).toBe(FATORES_CO2.carro_gasolina);
  });

  test("bicicleta e a pe devem dar zero emissao", () => {
    const bike = calcularEmissaoTransporte({ transporte: "bicicleta", km: 50 });
    const pe   = calcularEmissaoTransporte({ transporte: "a_pe", km: 10 });
    expect(bike.emissao_kg_co2).toBe(0);
    expect(pe.emissao_kg_co2).toBe(0);
  });

  test("aceita km 0", () => {
    const r = calcularEmissaoTransporte({ transporte: "onibus", km: 0 });
    expect(r.emissao_kg_co2).toBe(0);
  });

  test("erro quando transporte nao existe", () => {
    expect(() => calcularEmissaoTransporte({ transporte: "foguete", km: 5 }))
      .toThrow(/nao cadastrado/);
  });

  test("erro com km negativo", () => {
    expect(() => calcularEmissaoTransporte({ transporte: "moto", km: -3 }))
      .toThrow();
  });

  test("erro sem corpo", () => {
    expect(() => calcularEmissaoTransporte(null)).toThrow();
  });

  test("erro com transporte nao-string", () => {
    expect(() => calcularEmissaoTransporte({ transporte: 123, km: 5 })).toThrow();
  });
});

describe("calcularPegadaMensal", () => {

  test("calcula pegada com transporte + energia + dieta mista", () => {
    const r = calcularPegadaMensal({
      kmPorTransporte: { carro_gasolina: 100, onibus: 50 },
      energiaKwh: 200,
      dieta: "mista",
      pessoasCasa: 2
    });
    // transporte = 100*0.192 + 50*0.089 = 19.2 + 4.45 = 23.65
    expect(r.transporte_kg).toBeCloseTo(23.65, 2);
    // energia = (200*0.0817)/2 = 8.17
    expect(r.energia_kg).toBeCloseTo(8.17, 2);
    // alimentacao = 2.5 * 30 = 75
    expect(r.alimentacao_kg).toBeCloseTo(75, 2);
    expect(r.total_kg_co2).toBeCloseTo(23.65 + 8.17 + 75, 1);
  });

  test("dieta vegana gera menos emissao que carnivora", () => {
    const vegana = calcularPegadaMensal({ kmPorTransporte:{}, energiaKwh:0, dieta:"vegana" });
    const carn   = calcularPegadaMensal({ kmPorTransporte:{}, energiaKwh:0, dieta:"carnivora" });
    expect(vegana.alimentacao_kg).toBeLessThan(carn.alimentacao_kg);
  });

  test("erro com dieta invalida", () => {
    expect(() => calcularPegadaMensal({
      kmPorTransporte:{}, energiaKwh: 100, dieta:"crudivora"
    })).toThrow(/Dieta/);
  });

  test("erro com energia negativa", () => {
    expect(() => calcularPegadaMensal({
      kmPorTransporte:{}, energiaKwh: -1, dieta:"mista"
    })).toThrow();
  });

  test("erro com pessoasCasa zero", () => {
    expect(() => calcularPegadaMensal({
      kmPorTransporte:{}, energiaKwh: 100, dieta:"mista", pessoasCasa: 0
    })).toThrow();
  });

  test("erro quando transporte do mapa nao existe", () => {
    expect(() => calcularPegadaMensal({
      kmPorTransporte: { trator: 30 }, energiaKwh: 100, dieta: "mista"
    })).toThrow();
  });

  test("pegada com zero em tudo retorna apenas alimentacao", () => {
    const r = calcularPegadaMensal({ kmPorTransporte:{}, energiaKwh:0, dieta:"mista" });
    expect(r.transporte_kg).toBe(0);
    expect(r.energia_kg).toBe(0);
    expect(r.alimentacao_kg).toBeGreaterThan(0);
  });
});

describe("calcularCompensacaoArvores", () => {

  test("22 kg de CO2 = 1 arvore", () => {
    const r = calcularCompensacaoArvores({ kg_co2: 22 });
    expect(r.arvores_necessarias).toBe(1);
  });

  test("44 kg = 2 arvores", () => {
    const r = calcularCompensacaoArvores({ kg_co2: 44 });
    expect(r.arvores_necessarias).toBe(2);
  });

  test("arredonda pra cima (10 kg => 1 arvore)", () => {
    const r = calcularCompensacaoArvores({ kg_co2: 10 });
    expect(r.arvores_necessarias).toBe(1);
  });

  test("0 kg => 0 arvores", () => {
    const r = calcularCompensacaoArvores({ kg_co2: 0 });
    expect(r.arvores_necessarias).toBe(0);
    expect(r.custo_estimado_brl.min).toBe(0);
  });

  test("custo min sempre <= custo max", () => {
    const r = calcularCompensacaoArvores({ kg_co2: 500 });
    expect(r.custo_estimado_brl.min).toBeLessThanOrEqual(r.custo_estimado_brl.max);
  });

  test("erro com valor negativo", () => {
    expect(() => calcularCompensacaoArvores({ kg_co2: -1 })).toThrow();
  });

  test("erro com valor nao numerico", () => {
    expect(() => calcularCompensacaoArvores({ kg_co2: "muito" })).toThrow();
  });

  test("constante CO2_POR_ARVORE_ANO deve ser 22", () => {
    expect(CO2_POR_ARVORE_ANO).toBe(22);
  });
});
