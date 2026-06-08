// Estamos em:          tests/Time_5_oculos/
// Precisamos chegar:   src/Time_5_oculos/funcoes_oculos.js
const {
  arredondar,
  somarValores,
  calcularCustoMateriais,
  calcularMaoDeObra,
  calcularOverhead,
  calcularEmbalagem,
  calcularPrecoVenda,
  calcularCustoTotal,
  TABELA,
} = require('../../src/Time_5_oculos/funcoes_oculos');

const COMP = somarValores(TABELA.COMPONENTES);
const INSU = TABELA.INSUMOS_CONSUMO;

// ── MATERIAIS ──────────────────────────────────────────
describe('calcularCustoMateriais', () => {
  test('soma armação + 2 lentes + componentes + insumos (nominal)', () => {
    const r = calcularCustoMateriais({
      materialArmacao: 'acetato', tipoLente: 'sol', materialLente: 'cr39', taxaPerda: 0,
    });
    const esperado = TABELA.ARMACAO.acetato + TABELA.LENTE_BASE.cr39 * 2 + COMP + INSU;
    expect(r.nominal).toBe(arredondar(esperado));
    expect(r.real).toBe(arredondar(esperado)); // perda 0 => real = nominal
    expect(r.componentes).toBe(arredondar(COMP));
  });

  test('aplica a taxa de perda no custo real: nominal / (1 - perda)', () => {
    const r = calcularCustoMateriais({
      materialArmacao: 'acetato', tipoLente: 'sol', materialLente: 'cr39', taxaPerda: 8,
    });
    expect(r.real).toBe(arredondar(r.nominal / (1 - 0.08)));
  });

  test('lente de grau adiciona surfagem e tratamentos por lente', () => {
    const r = calcularCustoMateriais({
      materialArmacao: 'acetato', tipoLente: 'grau', materialLente: 'policarbonato',
      tratamentos: ['uv'], taxaPerda: 0,
    });
    const lenteEsperada =
      (TABELA.LENTE_BASE.policarbonato + TABELA.SURFAGEM_GRAU + TABELA.TRATAMENTO.uv) * 2;
    expect(r.lentes).toBe(arredondar(lenteEsperada));
  });

  test('lança erro se material da armação for inválido', () => {
    expect(() => calcularCustoMateriais({ materialArmacao: 'madeira', tipoLente: 'sol', materialLente: 'cr39' }))
      .toThrow('Material da armação inválido');
  });

  test('lança erro se material da lente for inválido', () => {
    expect(() => calcularCustoMateriais({ materialArmacao: 'metal', tipoLente: 'sol', materialLente: 'cristal' }))
      .toThrow('Material da lente inválido');
  });

  test('lança erro se tratamento for inválido', () => {
    expect(() => calcularCustoMateriais({
      materialArmacao: 'metal', tipoLente: 'sol', materialLente: 'cr39', tratamentos: ['espelhado'],
    })).toThrow('Tratamento inválido');
  });

  test('lança erro se taxa de perda for >= 100', () => {
    expect(() => calcularCustoMateriais({ materialArmacao: 'metal', tipoLente: 'sol', materialLente: 'cr39', taxaPerda: 100 }))
      .toThrow('Taxa de perda');
  });
});

// ── MÃO DE OBRA ────────────────────────────────────────
function modEsperado(fator, custoHora) {
  let total = 0;
  for (const base of Object.values(TABELA.ETAPAS_MIN)) total += arredondar(base * fator);
  total = arredondar(total);
  return { total, custo: arredondar((total / 60) * custoHora) };
}

describe('calcularMaoDeObra', () => {
  test('complexidade simples usa fator 1.0', () => {
    const r = calcularMaoDeObra({ complexidade: 'simples', custoHora: 28 });
    const e = modEsperado(1.0, 28);
    expect(r.total_minutos).toBe(e.total);
    expect(r.custo).toBe(e.custo);
  });

  test('complexidade alta aplica fator 1.7', () => {
    const r = calcularMaoDeObra({ complexidade: 'alta', custoHora: 28 });
    const e = modEsperado(1.7, 28);
    expect(r.fator).toBe(1.7);
    expect(r.custo).toBe(e.custo);
  });

  test('usa custo da hora padrão da tabela', () => {
    const r = calcularMaoDeObra({ complexidade: 'simples' });
    expect(r.custo).toBe(modEsperado(1.0, TABELA.CUSTO_HORA).custo);
  });

  test('lança erro se complexidade for inválida', () => {
    expect(() => calcularMaoDeObra({ complexidade: 'extrema' })).toThrow('Complexidade inválida');
  });

  test('lança erro se custo da hora for zero', () => {
    expect(() => calcularMaoDeObra({ complexidade: 'media', custoHora: 0 }))
      .toThrow('Custo da hora deve ser maior que zero');
  });
});

// ── OVERHEAD ───────────────────────────────────────────
describe('calcularOverhead', () => {
  test('rateia o total mensal padrão pelo volume', () => {
    const total = somarValores(TABELA.OVERHEAD_MENSAL);
    const r = calcularOverhead({ volumeProducao: 1000 });
    expect(r.total_mensal).toBe(arredondar(total));
    expect(r.unitario).toBe(arredondar(total / 1000));
  });

  test('lote menor eleva o custo unitário', () => {
    const total = somarValores(TABELA.OVERHEAD_MENSAL);
    expect(calcularOverhead({ volumeProducao: 500 }).unitario).toBe(arredondar(total / 500));
  });

  test('lança erro se volume for zero', () => {
    expect(() => calcularOverhead({ volumeProducao: 0 })).toThrow('Volume de produção deve ser maior que zero');
  });
});

// ── EMBALAGEM ──────────────────────────────────────────
describe('calcularEmbalagem', () => {
  test('soma os itens da embalagem', () => {
    expect(calcularEmbalagem().total).toBe(arredondar(somarValores(TABELA.EMBALAGEM)));
  });
});

// ── PREÇO DE VENDA ─────────────────────────────────────
describe('calcularPrecoVenda', () => {
  test('aplica margem sobre o preço (custo 100, margem 60% => 250)', () => {
    const r = calcularPrecoVenda(100, 60);
    expect(r.preco_venda).toBe(250);
    expect(r.lucro).toBe(150);
  });

  test('margem zero mantém o custo', () => {
    const r = calcularPrecoVenda(80, 0);
    expect(r.preco_venda).toBe(80);
    expect(r.lucro).toBe(0);
  });

  test('lança erro se margem for >= 100', () => {
    expect(() => calcularPrecoVenda(100, 100)).toThrow('Margem de lucro');
  });
});

// ── CUSTO TOTAL ────────────────────────────────────────
describe('calcularCustoTotal', () => {
  const baseDados = {
    materialArmacao: 'acetato',
    tipoLente: 'sol',
    materialLente: 'cr39',
    tratamentos: [],
    taxaPerda: 0,
    complexidade: 'simples',
    custoHora: 28,
    volumeProducao: 1000,
  };

  test('retorna o detalhamento completo', () => {
    const r = calcularCustoTotal(baseDados);
    expect(r).toHaveProperty('materiais');
    expect(r).toHaveProperty('mao_de_obra');
    expect(r).toHaveProperty('overhead');
    expect(r).toHaveProperty('embalagem');
    expect(r.resumo).toHaveProperty('custo_fabricacao');
    expect(r.resumo).toHaveProperty('preco_venda_sugerido');
  });

  test('custo de fabricação = materiais + MOD + overhead + embalagem', () => {
    const r = calcularCustoTotal(baseDados);
    const mat = calcularCustoMateriais(baseDados);
    const mod = calcularMaoDeObra(baseDados);
    const ovh = calcularOverhead(baseDados);
    const emb = calcularEmbalagem();
    const esperado = arredondar(mat.real + mod.custo + ovh.unitario + emb.total);
    expect(r.resumo.custo_fabricacao).toBe(esperado);
  });

  test('aplica a margem no preço de venda sugerido', () => {
    const r = calcularCustoTotal({ ...baseDados, margemLucro: 60 });
    expect(r.resumo.preco_venda_sugerido).toBe(arredondar(r.resumo.custo_fabricacao / (1 - 0.6)));
  });

  test('lança erro se faltar campos obrigatórios', () => {
    expect(() => calcularCustoTotal({ materialArmacao: 'acetato' }))
      .toThrow('Informe materialArmacao, tipoLente, materialLente e volumeProducao');
  });
});
