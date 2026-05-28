// Calculadora de Sustentabilidade - Time 16
// fatores de emissao em kg CO2 por km (fonte: MCTIC / IPCC)
const FATORES_CO2 = {
  carro_gasolina: 0.192,
  carro_etanol:   0.082,
  carro_diesel:   0.171,
  moto:           0.103,
  onibus:         0.089,
  metro:          0.041,
  bicicleta:      0,
  a_pe:           0,
  aviao:          0.255
};

// kg de CO2 absorvido por uma arvore adulta por ano (media)
const CO2_POR_ARVORE_ANO = 22;

// fatores extras pra pegada mensal
const FATOR_ENERGIA_KWH   = 0.0817;   // kg CO2 por kWh (matriz BR)
const FATOR_ALIMENTACAO   = {
  carnivora:  3.3,
  mista:      2.5,
  vegetariana:1.7,
  vegana:     1.0
};
// kg CO2 por dia, depende do habito alimentar

function calcularEmissaoTransporte(dados) {
  if (!dados) throw new Error("Dados nao informados");
  const { transporte, km } = dados;

  if (typeof transporte !== "string") {
    throw new Error("Tipo de transporte invalido");
  }
  const fator = FATORES_CO2[transporte];
  if (fator === undefined) {
    throw new Error("Transporte nao cadastrado: " + transporte);
  }
  const distancia = Number(km);
  if (!isFinite(distancia) || distancia < 0) {
    throw new Error("Distancia (km) deve ser um numero positivo");
  }

  const emissao = fator * distancia;
  return {
    transporte,
    km: distancia,
    fator_kg_por_km: fator,
    emissao_kg_co2: Number(emissao.toFixed(3))
  };
}

function calcularPegadaMensal(dados) {
  if (!dados) throw new Error("Dados nao informados");

  const kmPorTransporte = dados.kmPorTransporte || {};
  const energiaKwh      = Number(dados.energiaKwh ?? 0);
  const dieta           = dados.dieta || "mista";
  const pessoasCasa     = Number(dados.pessoasCasa ?? 1);

  if (!isFinite(energiaKwh) || energiaKwh < 0) {
    throw new Error("Consumo de energia invalido");
  }
  if (!isFinite(pessoasCasa) || pessoasCasa < 1) {
    throw new Error("Numero de pessoas na casa deve ser >= 1");
  }
  if (FATOR_ALIMENTACAO[dieta] === undefined) {
    throw new Error("Dieta nao reconhecida: " + dieta);
  }

  // transporte: soma de todos os modais usados no mes
  let emissaoTransporte = 0;
  const detalheTransporte = [];
  for (const tipo in kmPorTransporte) {
    const km = Number(kmPorTransporte[tipo]);
    if (!isFinite(km) || km < 0) {
      throw new Error("km invalido para " + tipo);
    }
    const fator = FATORES_CO2[tipo];
    if (fator === undefined) {
      throw new Error("Transporte nao cadastrado: " + tipo);
    }
    const e = fator * km;
    emissaoTransporte += e;
    detalheTransporte.push({ tipo, km, emissao_kg: Number(e.toFixed(3)) });
  }

  // energia eletrica residencial - rateia por pessoa
  const emissaoEnergia = (energiaKwh * FATOR_ENERGIA_KWH) / pessoasCasa;

  // alimentacao - 30 dias
  const emissaoAlimentacao = FATOR_ALIMENTACAO[dieta] * 30;

  const total = emissaoTransporte + emissaoEnergia + emissaoAlimentacao;

  return {
    transporte_kg:   Number(emissaoTransporte.toFixed(3)),
    energia_kg:      Number(emissaoEnergia.toFixed(3)),
    alimentacao_kg:  Number(emissaoAlimentacao.toFixed(3)),
    total_kg_co2:    Number(total.toFixed(3)),
    detalhe_transporte: detalheTransporte,
    dieta
  };
}

function calcularCompensacaoArvores(dados) {
  if (!dados) throw new Error("Dados nao informados");
  const kg = Number(dados.kg_co2);
  if (!isFinite(kg) || kg < 0) {
    throw new Error("Quantidade de CO2 invalida");
  }
  const arvores = Math.ceil(kg / CO2_POR_ARVORE_ANO);
  // custo estimado de plantio em ONGs (R$ 25 a R$ 40 por muda)
  const custoMin = arvores * 25;
  const custoMax = arvores * 40;

  return {
    kg_co2: kg,
    arvores_necessarias: arvores,
    co2_por_arvore_ano: CO2_POR_ARVORE_ANO,
    custo_estimado_brl: { min: custoMin, max: custoMax }
  };
}

module.exports = {
  FATORES_CO2,
  FATOR_ALIMENTACAO,
  CO2_POR_ARVORE_ANO,
  calcularEmissaoTransporte,
  calcularPegadaMensal,
  calcularCompensacaoArvores
};
