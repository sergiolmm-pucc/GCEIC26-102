const request = require('supertest');
const app = require('../../src/app');
const {
  arredondar,
  somarValores,
  TABELA,
} = require('../../src/Time_5_oculos/funcoes_oculos');

// ============================================================
describe('GET /api/Time_5_oculos/tabelas', () => {
  test('deve retornar as constantes da tabela', async () => {
    const res = await request(app).get('/api/Time_5_oculos/tabelas');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('ARMACAO');
    expect(res.body.data).toHaveProperty('LENTE_BASE');
    expect(res.body.data).toHaveProperty('OVERHEAD_MENSAL');
  });
});

// ============================================================
describe('POST /api/Time_5_oculos/materiais', () => {
  test('deve calcular o custo dos materiais', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/materiais')
      .send({ materialArmacao: 'acetato', tipoLente: 'sol', materialLente: 'cr39', taxaPerda: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const esperado = TABELA.ARMACAO.acetato + TABELA.LENTE_BASE.cr39 * 2
      + somarValores(TABELA.COMPONENTES) + TABELA.INSUMOS_CONSUMO;
    expect(res.body.data.nominal).toBe(arredondar(esperado));
  });

  test('deve retornar erro 400 se faltar campos', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/materiais')
      .send({ materialArmacao: 'acetato' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('deve retornar erro 400 se material for inválido', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/materiais')
      .send({ materialArmacao: 'madeira', tipoLente: 'sol', materialLente: 'cr39' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/armação/);
  });
});

// ============================================================
describe('POST /api/Time_5_oculos/mao-de-obra', () => {
  test('deve calcular a mão de obra', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/mao-de-obra')
      .send({ complexidade: 'simples', custoHora: 28 });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.data.custo).toBe('number');
    expect(res.body.data.fator).toBe(1.0);
  });

  test('deve retornar erro 400 se complexidade for inválida', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/mao-de-obra')
      .send({ complexidade: 'extrema' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
describe('POST /api/Time_5_oculos/overhead', () => {
  test('deve ratear o overhead pelo volume', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/overhead')
      .send({ volumeProducao: 1000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.unitario).toBe(arredondar(somarValores(TABELA.OVERHEAD_MENSAL) / 1000));
  });

  test('deve retornar erro 400 se volume não informado', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/overhead')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('deve retornar erro 400 se volume for negativo', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/overhead')
      .send({ volumeProducao: -1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
describe('GET /api/Time_5_oculos/embalagem', () => {
  test('deve retornar o custo de embalagem', async () => {
    const res = await request(app).get('/api/Time_5_oculos/embalagem');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(arredondar(somarValores(TABELA.EMBALAGEM)));
  });
});

// ============================================================
describe('POST /api/Time_5_oculos/preco-venda', () => {
  test('deve calcular o preço de venda pela margem', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/preco-venda')
      .send({ custo: 100, margemLucro: 60 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.preco_venda).toBe(250);
  });

  test('deve retornar erro 400 se custo não informado', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/preco-venda')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
describe('POST /api/Time_5_oculos/calcular-total', () => {
  test('deve retornar o resumo completo e coerente', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/calcular-total')
      .send({
        materialArmacao: 'acetato',
        tipoLente: 'sol',
        materialLente: 'cr39',
        tratamentos: [],
        taxaPerda: 0,
        complexidade: 'simples',
        custoHora: 28,
        volumeProducao: 1000,
        margemLucro: 60,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const r = res.body.data.resumo;
    // custo de fabricação = soma dos 4 pilares
    expect(r.custo_fabricacao).toBe(
      arredondar(r.custo_materiais + r.custo_mao_de_obra + r.custo_overhead + r.custo_embalagem)
    );
    // preço de venda = custo / (1 - margem)
    expect(r.preco_venda_sugerido).toBe(arredondar(r.custo_fabricacao / (1 - 0.6)));
  });

  test('deve retornar erro 400 sem dados', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/calcular-total')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('deve retornar erro 400 se dados forem inválidos', async () => {
    const res = await request(app)
      .post('/api/Time_5_oculos/calcular-total')
      .send({
        materialArmacao: 'metal',
        tipoLente: 'grau',
        materialLente: 'policarbonato',
        complexidade: 'extrema',
        volumeProducao: 1000,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
