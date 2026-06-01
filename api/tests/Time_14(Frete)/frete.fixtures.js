const freteBasePayload = {
  comprimento: 40,
  largura: 30,
  altura: 20,
  pesoReal: 8,
  distanciaKm: 250,
  tipoFrete: 'normal',
  valorDeclarado: 1000,
  importado: true,
  segurado: true
};

const freteCompletoEsperado = {
  pesoCubado: 2,
  pesoFaturado: 8,
  valorBase: 50,
  taxaImportacao: 150,
  taxaSeguro: 50,
  valorFinal: 250
};

function criarPayloadFrete(overrides = {}) {
  return {
    ...freteBasePayload,
    ...overrides
  };
}

module.exports = {
  freteBasePayload,
  freteCompletoEsperado,
  criarPayloadFrete
};