const request = require('supertest');
const app     = require('../../src/app');

const TOKEN = 'token-flp-2026';

// ── AUTH ──────────────────────────────────────────────────────────────────────

describe('POST /api/flp/login', () => {
  test('retorna token com credenciais válidas', async () => {
    const res = await request(app).post('/api/flp/login').send({ usuario: 'rh', senha: 'rh' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('token retornado é string não vazia', async () => {
    const res = await request(app).post('/api/flp/login').send({ usuario: 'rh', senha: 'rh' });
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  test('retorna 401 com usuário errado', async () => {
    const res = await request(app).post('/api/flp/login').send({ usuario: 'errado', senha: 'rh' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  test('retorna 401 com senha errada', async () => {
    const res = await request(app).post('/api/flp/login').send({ usuario: 'rh', senha: 'errada' });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 sem body', async () => {
    const res = await request(app).post('/api/flp/login').send({});
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 para credenciais em maiúsculo', async () => {
    const res = await request(app).post('/api/flp/login').send({ usuario: 'RH', senha: 'RH' });
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/flp/auth', () => {
  test('valida token correto', async () => {
    const res = await request(app).post('/api/flp/auth').send({ token: TOKEN });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe(TOKEN);
  });

  test('retorna 401 para token inválido', async () => {
    const res = await request(app).post('/api/flp/auth').send({ token: 'invalido' });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 para token vazio', async () => {
    const res = await request(app).post('/api/flp/auth').send({ token: '' });
    expect(res.statusCode).toBe(401);
  });

  test('token do login é aceito no auth', async () => {
    const login = await request(app).post('/api/flp/login').send({ usuario: 'rh', senha: 'rh' });
    const auth  = await request(app).post('/api/flp/auth').send({ token: login.body.token });
    expect(auth.statusCode).toBe(200);
  });
});

// ── TABELAS ───────────────────────────────────────────────────────────────────

describe('GET /api/flp/tabelas', () => {
  test('retorna 200 com tabelas INSS e IRRF', async () => {
    const res = await request(app).get('/api/flp/tabelas');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('inss');
    expect(res.body).toHaveProperty('irrf');
  });

  test('tabela INSS tem 4 faixas', async () => {
    const res = await request(app).get('/api/flp/tabelas');
    expect(res.body.inss.faixas).toHaveLength(4);
  });

  test('tabela INSS tem teto definido', async () => {
    const res = await request(app).get('/api/flp/tabelas');
    expect(res.body.inss).toHaveProperty('teto');
    expect(res.body.inss.teto).toBeGreaterThan(0);
  });

  test('retorna deducao_dependente e fgts_aliquota', async () => {
    const res = await request(app).get('/api/flp/tabelas');
    expect(res.body).toHaveProperty('deducao_dependente');
    expect(res.body).toHaveProperty('fgts_aliquota');
  });
});

// ── CALCULAR ──────────────────────────────────────────────────────────────────

describe('POST /api/flp/calcular', () => {
  test('calcula folha para salário R$3000', async () => {
    const res = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 3000,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('salario_liquido');
    expect(res.body.salario_liquido).toBeGreaterThan(0);
  });

  test('resposta tem estrutura completa de descontos', async () => {
    const res = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 4000,
    });
    expect(res.body.descontos).toHaveProperty('inss');
    expect(res.body.descontos).toHaveProperty('irrf');
    expect(res.body.descontos).toHaveProperty('irrf_aliquota');
    expect(res.body.descontos).toHaveProperty('deducao_dependentes');
    expect(res.body.descontos).toHaveProperty('total');
    expect(res.body).toHaveProperty('fgts');
    expect(res.body).toHaveProperty('base_irrf');
  });

  test('dependentes reduzem IRRF', async () => {
    const sem = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 5000, dependentes: 0,
    });
    const com = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 5000, dependentes: 2,
    });
    expect(com.body.descontos.irrf).toBeLessThanOrEqual(sem.body.descontos.irrf);
  });

  test('horas extras 50% aumentam salário bruto', async () => {
    const sem = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 3000, horas50: 0,
    });
    const com = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 3000, horas50: 10,
    });
    expect(com.body.salario_bruto).toBeGreaterThan(sem.body.salario_bruto);
  });

  test('horas extras 100% aumentam salário bruto', async () => {
    const sem = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 3000, horas100: 0,
    });
    const com = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 3000, horas100: 5,
    });
    expect(com.body.salario_bruto).toBeGreaterThan(sem.body.salario_bruto);
  });

  test('salário mínimo 2026 (R$1621) isento de IRRF', async () => {
    const res = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 1621,
    });
    expect(res.body.descontos.irrf).toBe(0);
  });

  test('reforma 2026: salário R$5000 isento de IRRF', async () => {
    const res = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 5000,
    });
    expect(res.body.descontos.irrf).toBe(0);
  });

  test('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/flp/calcular').send({ salarioBase: 3000 });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 com token inválido', async () => {
    const res = await request(app).post('/api/flp/calcular').send({
      token: 'errado', salarioBase: 3000,
    });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 400 sem salarioBase', async () => {
    const res = await request(app).post('/api/flp/calcular').send({ token: TOKEN });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 400 com salário zero', async () => {
    const res = await request(app).post('/api/flp/calcular').send({ token: TOKEN, salarioBase: 0 });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 400 com salário negativo', async () => {
    const res = await request(app).post('/api/flp/calcular').send({ token: TOKEN, salarioBase: -500 });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 400 com salário não numérico', async () => {
    const res = await request(app).post('/api/flp/calcular').send({ token: TOKEN, salarioBase: 'abc' });
    expect(res.statusCode).toBe(400);
  });

  test('FGTS = 8% do salário bruto', async () => {
    const res = await request(app).post('/api/flp/calcular').send({
      token: TOKEN, salarioBase: 4000,
    });
    expect(res.body.fgts).toBeCloseTo(res.body.salario_bruto * 0.08, 2);
  });
});
