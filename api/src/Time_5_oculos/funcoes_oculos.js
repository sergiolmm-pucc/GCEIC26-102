// ============================================================
// Time 5 - Calculadora de Custo de Fabricação de Óculos
// Custo Total = Materiais Diretos + Mão de Obra Direta + Custos Indiretos
// (+ preço de venda sugerido a partir de uma margem)
// ============================================================

// Preços de referência (custo de FABRICAÇÃO, em R$) baseados em valores
// usuais da indústria óptica brasileira. São valores de fábrica/atacado
// por unidade produzida — não preços de varejo.
const TABELA = {
  // Custo da armação por material (R$ / par)
  ARMACAO: {
    injecao: 12.0,   // TR90 / policarbonato injetado (alta escala)
    acetato: 35.0,   // placa de acetato usinada em CNC + polimento
    metal: 45.0,     // monel / aço inox (soldagem + galvanoplastia)
    titanio: 110.0,  // titânio (ultraleve, hipoalergênico, premium)
  },
  // Custo base da lente por material (R$ / lente — multiplica por 2)
  LENTE_BASE: {
    cr39: 10.0,           // resina CR-39
    policarbonato: 18.0,  // alto impacto
    vidro: 22.0,          // alta nitidez / antirrisco
  },
  // Surfagem (geração da curva do grau) adicional para lente de grau (R$ / lente)
  SURFAGEM_GRAU: 28.0,
  // Tratamentos ópticos (R$ / lente — multiplica por 2)
  TRATAMENTO: {
    uv: 5.0,
    antirreflexo: 18.0,
    coloracao: 9.0,
  },
  // Componentes de articulação e detalhes (R$ / par)
  COMPONENTES: {
    parafusos: 1.2,
    charneiras: 3.5,
    plaquetas: 2.0,
    alma_metal: 2.8,
  },
  // Insumos de consumo direto rateados por unidade (lixas, massas) (R$)
  INSUMOS_CONSUMO: 2.5,
  // Embalagem comercial (R$ / par)
  EMBALAGEM: {
    estojo: 9.0,
    flanela: 2.0,
    caixa: 3.0,
    certificado: 1.0,
  },
  // Custo da hora de mão de obra direta, com encargos (R$/h)
  CUSTO_HORA: 28.0,
  // Tempo base de cada etapa de produção (minutos / par)
  ETAPAS_MIN: {
    design: 4,
    corte: 9,
    montagem: 12,
    polimento: 8,
    qa: 4,
    embalagem: 3,
  },
  // Fator multiplicador do tempo conforme a complexidade do design
  COMPLEXIDADE: {
    simples: 1.0,
    media: 1.3,
    alta: 1.7,
  },
  // Custos indiretos de fabricação mensais (overhead) (R$)
  OVERHEAD_MENSAL: {
    depreciacao: 12000.0,  // injetoras, CNC, politrizes, surfaçadoras
    energia: 8000.0,       // energia elétrica da fábrica
    aluguel: 14000.0,      // aluguel do espaço de produção
  },
};

// Arredonda para 2 casas decimais (centavos)
function arredondar(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function somarValores(obj) {
  return Object.values(obj).reduce((acc, v) => acc + v, 0);
}

// ------------------------------------------------------------
// A. Custo de Materiais Diretos (com margem de perda / scrap)
//    Custo Real = Custo Nominal / (1 - taxaPerda)
// ------------------------------------------------------------
function calcularCustoMateriais(dados) {
  const {
    materialArmacao,
    tipoLente,
    materialLente,
    tratamentos = [],
    taxaPerda = 8,
  } = dados;

  const precoArmacao = TABELA.ARMACAO[materialArmacao];
  if (precoArmacao === undefined) {
    throw new Error('Material da armação inválido (use: acetato, injecao, metal ou titanio)');
  }

  if (tipoLente !== 'sol' && tipoLente !== 'grau') {
    throw new Error('Tipo de lente inválido (use: sol ou grau)');
  }

  const precoLenteBase = TABELA.LENTE_BASE[materialLente];
  if (precoLenteBase === undefined) {
    throw new Error('Material da lente inválido (use: policarbonato, cr39 ou vidro)');
  }

  const perda = Number(taxaPerda);
  if (isNaN(perda) || perda < 0 || perda >= 100) {
    throw new Error('Taxa de perda deve estar entre 0 e 99%');
  }

  const listaTratamentos = Array.isArray(tratamentos) ? tratamentos : [tratamentos];
  let custoTratamentoPorLente = 0;
  for (const t of listaTratamentos) {
    if (!t) continue;
    const preco = TABELA.TRATAMENTO[t];
    if (preco === undefined) {
      throw new Error(`Tratamento inválido: ${t} (use: uv, antirreflexo ou coloracao)`);
    }
    custoTratamentoPorLente += preco;
  }

  // Um par = 2 lentes
  const surfagemPorLente = tipoLente === 'grau' ? TABELA.SURFAGEM_GRAU : 0;
  const custoLentes = (precoLenteBase + surfagemPorLente + custoTratamentoPorLente) * 2;

  const custoArmacao = precoArmacao;
  const custoComponentes = somarValores(TABELA.COMPONENTES);
  const custoInsumos = TABELA.INSUMOS_CONSUMO;

  const nominal = custoArmacao + custoLentes + custoComponentes + custoInsumos;
  const real = nominal / (1 - perda / 100);

  return {
    armacao: arredondar(custoArmacao),
    lentes: arredondar(custoLentes),
    componentes: arredondar(custoComponentes),
    insumos: arredondar(custoInsumos),
    nominal: arredondar(nominal),
    taxa_perda: perda,
    real: arredondar(real),
  };
}

// ------------------------------------------------------------
// B. Custo de Mão de Obra Direta (MOD) por etapas
//    minutos por etapa x fator de complexidade
//    MOD = (total de minutos / 60) x custo da hora
// ------------------------------------------------------------
function calcularMaoDeObra(dados) {
  const { complexidade = 'media', custoHora = TABELA.CUSTO_HORA } = dados;

  const fator = TABELA.COMPLEXIDADE[complexidade];
  if (fator === undefined) {
    throw new Error('Complexidade inválida (use: simples, media ou alta)');
  }

  const hora = Number(custoHora);
  if (isNaN(hora) || hora <= 0) {
    throw new Error('Custo da hora deve ser maior que zero');
  }

  const etapas = {};
  let totalMin = 0;
  for (const [nome, base] of Object.entries(TABELA.ETAPAS_MIN)) {
    const min = arredondar(base * fator);
    etapas[nome] = min;
    totalMin += min;
  }
  totalMin = arredondar(totalMin);

  return {
    complexidade,
    fator,
    etapas,
    total_minutos: totalMin,
    custo: arredondar((totalMin / 60) * hora),
  };
}

// ------------------------------------------------------------
// C. Custos Indiretos de Fabricação (Overhead) rateados pelo lote
//    Overhead unitário = total mensal / volume de produção
// ------------------------------------------------------------
function calcularOverhead(dados) {
  const { volumeProducao, overheadMensal } = dados;

  const volume = Number(volumeProducao);
  if (isNaN(volume) || volume <= 0) {
    throw new Error('Volume de produção deve ser maior que zero');
  }

  const componentes = overheadMensal && typeof overheadMensal === 'object'
    ? overheadMensal
    : TABELA.OVERHEAD_MENSAL;

  const totalMensal = somarValores(componentes);
  if (totalMensal < 0) {
    throw new Error('Overhead mensal não pode ser negativo');
  }

  return {
    componentes,
    total_mensal: arredondar(totalMensal),
    unitario: arredondar(totalMensal / volume),
  };
}

// Embalagem comercial (estojo + flanela + caixa + certificado)
function calcularEmbalagem() {
  const itens = TABELA.EMBALAGEM;
  return {
    itens,
    total: arredondar(somarValores(itens)),
  };
}

// Preço de venda sugerido a partir de uma margem sobre o preço (markup divisor)
function calcularPrecoVenda(custo, margemLucro = 0) {
  const margem = Number(margemLucro);
  if (isNaN(margem) || margem < 0 || margem >= 100) {
    throw new Error('Margem de lucro deve estar entre 0 e 99%');
  }
  if (margem === 0) {
    return { margem, preco_venda: arredondar(custo), lucro: 0 };
  }
  const preco = custo / (1 - margem / 100);
  return {
    margem,
    preco_venda: arredondar(preco),
    lucro: arredondar(preco - custo),
  };
}

// ------------------------------------------------------------
// Consolidação do Custo Unitário de Fabricação (+ preço sugerido)
// ------------------------------------------------------------
function calcularCustoTotal(dados) {
  const {
    materialArmacao,
    tipoLente,
    materialLente,
    volumeProducao,
  } = dados;

  if (
    materialArmacao === undefined ||
    tipoLente === undefined ||
    materialLente === undefined ||
    volumeProducao === undefined
  ) {
    throw new Error(
      'Informe materialArmacao, tipoLente, materialLente e volumeProducao'
    );
  }

  const materiais = calcularCustoMateriais(dados);
  const maoDeObra = calcularMaoDeObra(dados);
  const overhead = calcularOverhead(dados);
  const embalagem = calcularEmbalagem();

  const custoFabricacao = arredondar(
    materiais.real + maoDeObra.custo + overhead.unitario + embalagem.total
  );

  const venda = calcularPrecoVenda(custoFabricacao, dados.margemLucro || 0);

  return {
    materiais,
    mao_de_obra: maoDeObra,
    overhead,
    embalagem,
    resumo: {
      custo_materiais: materiais.real,
      custo_mao_de_obra: maoDeObra.custo,
      custo_overhead: overhead.unitario,
      custo_embalagem: embalagem.total,
      custo_fabricacao: custoFabricacao,
      margem_lucro: venda.margem,
      lucro_unitario: venda.lucro,
      preco_venda_sugerido: venda.preco_venda,
    },
  };
}

module.exports = {
  TABELA,
  arredondar,
  somarValores,
  calcularCustoMateriais,
  calcularMaoDeObra,
  calcularOverhead,
  calcularEmbalagem,
  calcularPrecoVenda,
  calcularCustoTotal,
};
