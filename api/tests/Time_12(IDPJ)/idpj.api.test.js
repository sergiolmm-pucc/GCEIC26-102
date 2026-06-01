const request = require('supertest');
const app = require('../../src/app');

describe('API IDPJ - metadata', () => {
  test('GET /IDPJ identifica o Time_12', async () => {
    const res = await request(app).get('/IDPJ');

    expect(res.statusCode).toBe(200);
    expect(res.body.equipe).toBe('Time_12');
    expect(res.body.sigla).toBe('IDPJ');
    expect(res.body.rotas).toContain('/calcular-simples');
  });
});

describe('API IDPJ - calculos', () => {
  test('POST /IDPJ/fator-r calcula anexo aplicavel', async () => {
    const res = await request(app).post('/IDPJ/fator-r').send({
      receita12Meses: 120000,
      folha12Meses: 33600,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.anexo).toBe('III');
    expect(res.body.data.fatorRPercentual).toBe(28);
  });

  test('POST /IDPJ/calcular-simples calcula DAS mensal', async () => {
    const res = await request(app).post('/IDPJ/calcular-simples').send({
      receitaMensal: 30000,
      receita12Meses: 300000,
      folha12Meses: 30000,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.anexo).toBe('V');
    expect(res.body.data.das).toBe(4950);
    expect(res.body.data.receitaAposDas).toBe(25050);
  });

  test('POST /IDPJ/pro-labore-minimo retorna sugestao mensal', async () => {
    const res = await request(app).post('/IDPJ/pro-labore-minimo').send({
      receita12Meses: 240000,
      folha12Meses: 48000,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.folhaMinima).toBe(67200);
    expect(res.body.data.sugestaoMensal).toBe(1600);
  });

  test('retorna 400 para payload invalido', async () => {
    const res = await request(app).post('/IDPJ/calcular-simples').send({
      receitaMensal: 10000,
      receita12Meses: 0,
      folha12Meses: 0,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.erro).toMatch(/maior que zero/i);
  });
});
