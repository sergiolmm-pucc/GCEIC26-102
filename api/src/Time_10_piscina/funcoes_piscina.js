const TABELA = {
  PRECO_AGUA_M3: 12.5,
  CUSTO_BOMBA: 800,
  CUSTO_QUADRO: 500,
  CUSTO_ILUMINACAO: 600,
  MANUTENCAO_MENSAL: 473
};

function calcularVolume(comprimento, largura, profundidade) {
  comprimento = Number(comprimento);
  largura = Number(largura);
  profundidade = Number(profundidade);

  if (comprimento <= 0) {
    throw new Error('Comprimento deve ser maior que zero');
  }

  if (largura <= 0) {
    throw new Error('Largura deve ser maior que zero');
  }

  if (profundidade <= 0) {
    throw new Error('Profundidade deve ser maior que zero');
  }

  return comprimento * largura * profundidade;
}

function calcularCustoAgua(volume) {
  volume = Number(volume);

  if (volume <= 0) {
    throw new Error('Volume deve ser maior que zero');
  }

  return volume * TABELA.PRECO_AGUA_M3;
}

function calcularCustoEletrico(temIluminacao = true) {
  return temIluminacao
    ? TABELA.CUSTO_BOMBA +
        TABELA.CUSTO_QUADRO +
        TABELA.CUSTO_ILUMINACAO
    : TABELA.CUSTO_BOMBA +
        TABELA.CUSTO_QUADRO;
}

function calcularCustoHidraulico(volume) {
  volume = Number(volume);

  if (volume <= 0) {
    throw new Error('Volume deve ser maior que zero');
  }

  return volume <= 50 ? 3700 : 4300;
}

function calcularManutencaoMensal() {
  return TABELA.MANUTENCAO_MENSAL;
}

function calcularCustoTotal(dados) {
  const {
    comprimento,
    largura,
    profundidade,
    temIluminacao = true
  } = dados;

  if (
    comprimento === undefined ||
    largura === undefined ||
    profundidade === undefined
  ) {
    throw new Error(
      'Informe comprimento, largura e profundidade'
    );
  }

  const volume = calcularVolume(
    comprimento,
    largura,
    profundidade
  );

  const custoAgua =
    calcularCustoAgua(volume);

  const custoEletrico =
    calcularCustoEletrico(temIluminacao);

  const custoHidraulico =
    calcularCustoHidraulico(volume);

  const manutencao =
    calcularManutencaoMensal();

  const total =
    custoAgua +
    custoEletrico +
    custoHidraulico;

  return {
    volume_m3: volume,
    custo_agua: custoAgua,
    custo_eletrico: custoEletrico,
    custo_hidraulico: custoHidraulico,
    manutencao_mensal: manutencao,
    total_construcao: total
  };
}

module.exports = {
  TABELA,
  calcularVolume,
  calcularCustoAgua,
  calcularCustoEletrico,
  calcularCustoHidraulico,
  calcularManutencaoMensal,
  calcularCustoTotal
};