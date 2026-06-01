const ARMACAO = {
  acetato: 18.0,
  injecao: 6.0,
  metal: 24.0,
};

const LENTE = {
  sol_poli: 9.0,
  sol_cr39: 12.0,
  grau_semi: 22.0,
  grau_acabada: 38.0,
};

const COMPLEXIDADE = {
  baixa: 1.0,
  media: 1.25,
  alta: 1.6,
};

function num(value, field) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Campo "${field}" inválido`);
  }
  return n;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function calcularMateriais(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Payload inválido');
  }

  const armacaoCusto = ARMACAO[input.armacao];
  if (armacaoCusto === undefined) {
    throw new Error('Tipo de armação inválido');
  }

  const lenteCusto = LENTE[input.lente];
  if (lenteCusto === undefined) {
    throw new Error('Tipo de lente inválido');
  }

  const componentes = num(input.componentes ?? 0, 'componentes');
  const insumos = num(input.insumos ?? 0, 'insumos');
  const taxaPerda = num(input.taxaPerda ?? 0, 'taxaPerda') / 100;

  if (taxaPerda < 0 || taxaPerda >= 1) {
    throw new Error('Taxa de perda deve estar entre 0 e 100 (exclusivo)');
  }

  const nominal = armacaoCusto + lenteCusto + componentes + insumos;
  const custoReal = nominal / (1 - taxaPerda);

  return {
    armacao: armacaoCusto,
    lente: lenteCusto,
    componentes,
    insumos,
    nominal: round(nominal),
    taxaPerda: round(taxaPerda * 100),
    custoReal: round(custoReal),
  };
}

function calcularMaoDeObra(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Payload inválido');
  }

  const tempoMin = num(input.tempoMin, 'tempoMin');
  const custoHora = num(input.custoHora, 'custoHora');

  if (tempoMin < 0) throw new Error('Tempo por peça não pode ser negativo');
  if (custoHora < 0) throw new Error('Custo da hora não pode ser negativo');

  const fator = COMPLEXIDADE[input.complexidade ?? 'media'];
  if (fator === undefined) {
    throw new Error('Complexidade inválida');
  }

  const horas = tempoMin / 60;
  const mod = horas * custoHora * fator;

  return {
    tempoMin,
    custoHora,
    complexidade: input.complexidade ?? 'media',
    fator,
    horas: round(horas),
    mod: round(mod),
  };
}

function calcularOverhead(input) {
  const custoFixoMensal = num(input.custoFixoMensal, 'custoFixoMensal');
  const capacidadeMensal = num(input.capacidadeMensal, 'capacidadeMensal');

  if (custoFixoMensal < 0) throw new Error('Custo fixo mensal não pode ser negativo');
  if (capacidadeMensal <= 0) throw new Error('Capacidade mensal deve ser maior que zero');

  return round(custoFixoMensal / capacidadeMensal);
}

function calcularEmbalagem(input) {
  const estojo = num(input.estojo ?? 0, 'estojo');
  const flanela = num(input.flanela ?? 0, 'flanela');
  const caixa = num(input.caixa ?? 0, 'caixa');
  const certificado = num(input.certificado ?? 0, 'certificado');

  return round(estojo + flanela + caixa + certificado);
}

function calcularCustoTotal(input) {
  const materiais = calcularMateriais(input);
  const maoDeObra = calcularMaoDeObra(input);
  const overhead = calcularOverhead(input);
  const embalagem = calcularEmbalagem(input);

  const volumeLote = num(input.volumeLote ?? 1, 'volumeLote');
  if (volumeLote <= 0) throw new Error('Volume do lote deve ser maior que zero');

  const custoUnitario = round(
    materiais.custoReal + maoDeObra.mod + overhead + embalagem,
  );
  const custoTotalLote = round(custoUnitario * volumeLote);

  return {
    materiais: materiais.custoReal,
    maoDeObra: maoDeObra.mod,
    overhead,
    embalagem,
    custoUnitario,
    volumeLote,
    custoTotalLote,
    detalhes: { materiais, maoDeObra },
  };
}

module.exports = {
  ARMACAO,
  LENTE,
  COMPLEXIDADE,
  calcularMateriais,
  calcularMaoDeObra,
  calcularOverhead,
  calcularEmbalagem,
  calcularCustoTotal,
};
