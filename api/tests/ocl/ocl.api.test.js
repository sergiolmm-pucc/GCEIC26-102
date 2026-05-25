const request = require('supertest');
const app = require('../../src/app');

const basePayload = {
  armacao: 'acetato',
  lente: 'sol_poli',
  componentes: 1.5,
  insumos: 0.8,
  taxaPerda: 8,
  tempoMin: 25,
  custoHora: 22,
  complexidade: 'media',
  custoFixoMensal: 15000,
  capacidadeMensal: 3000,
  estojo: 4.5,
  flanela: 1.2,
  caixa: 1.8,
  certificado: 0.5,
  volumeLote: 1000,
};

describe('POST /api/ocl/materiais', () => {
  test('200 com payload válido', async () => {
    const res = await request(app).post('/api/ocl/materiais').send(basePayload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.custoReal).toBeGreaterThan(0);
  });

  test('400 com armação inválida', async () => {
    const res = await request(app)
      .post('/api/ocl/materiais')
      .send({ ...basePayload, armacao: 'madeira' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/ocl/maoDeObra', () => {
  test('200 com payload válido', async () => {
    const res = await request(app).post('/api/ocl/maoDeObra').send(basePayload);
    expect(res.status).toBe(200);
    expect(res.body.data.mod).toBeGreaterThan(0);
  });

  test('400 com complexidade inválida', async () => {
    const res = await request(app)
      .post('/api/ocl/maoDeObra')
      .send({ ...basePayload, complexidade: 'extrema' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/ocl/custoTotal', () => {
  test('200 com payload completo e retorna custo unitário positivo', async () => {
    const res = await request(app).post('/api/ocl/custoTotal').send(basePayload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.custoUnitario).toBeGreaterThan(0);
    expect(res.body.data.custoTotalLote).toBeGreaterThan(0);
  });

  test('400 com capacidade zero', async () => {
    const res = await request(app)
      .post('/api/ocl/custoTotal')
      .send({ ...basePayload, capacidadeMensal: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Capacidade/);
  });
});
