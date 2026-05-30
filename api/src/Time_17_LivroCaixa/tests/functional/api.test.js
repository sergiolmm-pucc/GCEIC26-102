const request = require('supertest');
const app = require('../../src/server');
const db = require('../../src/data/db');

describe('API LCX - Testes Funcionais', () => {
  beforeEach(() => {
    db.reset();
  });

  // ============ ALUNO 1: Lançamentos & Saldo ============

  describe('POST /LCX/lancamento', () => {
    test('cria lançamento válido e retorna 201', async () => {
      const res = await request(app)
        .post('/LCX/lancamento')
        .send({
          data: '2026-05-15',
          valor: 1500,
          tipo: 'entrada',
          descricao: 'Venda de soja',
          categoria: 'Receita - Venda'
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.valor).toBe(1500);
    });

    test('retorna 400 sem campos obrigatórios', async () => {
      const res = await request(app).post('/LCX/lancamento').send({ valor: 100 });
      expect(res.status).toBe(400);
    });

    test('retorna 400 para tipo inválido', async () => {
      const res = await request(app).post('/LCX/lancamento').send({
        data: '2026-05-15',
        valor: 100,
        tipo: 'transferencia',
        descricao: 'x',
        categoria: 'y'
      });
      expect(res.status).toBe(400);
    });

    test('retorna 400 para valor não-positivo', async () => {
      const res = await request(app).post('/LCX/lancamento').send({
        data: '2026-05-15',
        valor: 0,
        tipo: 'entrada',
        descricao: 'x',
        categoria: 'y'
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /LCX/lancamentos', () => {
    test('lista vazia inicialmente', async () => {
      const res = await request(app).get('/LCX/lancamentos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('retorna lançamentos cadastrados', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 100, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).get('/LCX/lancamentos');
      expect(res.body).toHaveLength(1);
    });

    test('filtra por período', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 100, tipo: 'entrada', descricao: 'jan', categoria: 'y'
      });
      await request(app).post('/LCX/lancamento').send({
        data: '2026-06-01', valor: 200, tipo: 'entrada', descricao: 'jun', categoria: 'y'
      });
      const res = await request(app).get('/LCX/lancamentos?inicio=2026-05-01&fim=2026-12-31');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].descricao).toBe('jun');
    });
  });

  describe('GET /LCX/saldo', () => {
    test('retorna saldo zero sem lançamentos', async () => {
      const res = await request(app).get('/LCX/saldo');
      expect(res.body.saldo).toBe(0);
    });

    test('calcula saldo correto', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 1000, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-02', valor: 300, tipo: 'saida', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).get('/LCX/saldo');
      expect(res.body.saldo).toBe(700);
      expect(res.body.totalEntradas).toBe(1000);
      expect(res.body.totalSaidas).toBe(300);
    });

    test('respeita dataReferencia', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 1000, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      await request(app).post('/LCX/lancamento').send({
        data: '2026-06-01', valor: 500, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).get('/LCX/saldo?dataReferencia=2026-03-01');
      expect(res.body.saldo).toBe(1000);
    });
  });

  // ============ ALUNO 2: Agregações ============

  describe('GET /LCX/resumo-mensal', () => {
    test('retorna 12 meses zerados quando vazio', async () => {
      const res = await request(app).get('/LCX/resumo-mensal?ano=2026');
      expect(res.body.meses).toHaveLength(12);
      expect(res.body.totalAno.saldo).toBe(0);
    });

    test('agrupa lançamentos por mês', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-15', valor: 1000, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      await request(app).post('/LCX/lancamento').send({
        data: '2026-03-10', valor: 500, tipo: 'saida', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).get('/LCX/resumo-mensal?ano=2026');
      expect(res.body.meses[0].entradas).toBe(1000);
      expect(res.body.meses[2].saidas).toBe(500);
    });
  });

  describe('GET /LCX/por-categoria', () => {
    test('agrupa por categoria', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 500, tipo: 'saida', descricao: 'x', categoria: 'Funcionários'
      });
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-02', valor: 300, tipo: 'saida', descricao: 'x', categoria: 'Funcionários'
      });
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-03', valor: 200, tipo: 'saida', descricao: 'x', categoria: 'Insumos'
      });
      const res = await request(app).get('/LCX/por-categoria?tipo=saida');
      expect(res.body.categorias[0].categoria).toBe('Funcionários');
      expect(res.body.categorias[0].total).toBe(800);
    });

    test('valida tipo inválido', async () => {
      const res = await request(app).get('/LCX/por-categoria?tipo=invalido');
      expect(res.status).toBe(400);
    });
  });

  // ============ ALUNO 3: Anual & Exportação ============

  describe('GET /LCX/livro-caixa-anual', () => {
    test('flag obrigatório=true quando excede R$ 4,8mi', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-06-01', valor: 5000000, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).get('/LCX/livro-caixa-anual?ano=2026');
      expect(res.body.obrigatorioDeclarar).toBe(true);
      expect(res.body.diferenca).toBe(200000);
    });

    test('flag obrigatório=false abaixo do limite', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-06-01', valor: 1000000, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).get('/LCX/livro-caixa-anual?ano=2026');
      expect(res.body.obrigatorioDeclarar).toBe(false);
    });
  });

  describe('GET /LCX/exportar-csv', () => {
    test('retorna content-type CSV', async () => {
      const res = await request(app).get('/LCX/exportar-csv');
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
    });

    test('CSV contém cabeçalho e dados', async () => {
      await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 1000, tipo: 'entrada',
        descricao: 'Venda', categoria: 'Receita'
      });
      const res = await request(app).get('/LCX/exportar-csv');
      expect(res.text).toContain('Data;Tipo;Categoria;Descricao;Valor;Saldo');
      expect(res.text).toContain('1000,00');
    });
  });

  describe('DELETE /LCX/lancamento/:id', () => {
    test('remove lançamento existente', async () => {
      const criado = await request(app).post('/LCX/lancamento').send({
        data: '2026-01-01', valor: 100, tipo: 'entrada', descricao: 'x', categoria: 'y'
      });
      const res = await request(app).delete(`/LCX/lancamento/${criado.body.id}`);
      expect(res.status).toBe(204);
      const lista = await request(app).get('/LCX/lancamentos');
      expect(lista.body).toHaveLength(0);
    });

    test('404 para id inexistente', async () => {
      const res = await request(app).delete('/LCX/lancamento/inexistente');
      expect(res.status).toBe(404);
    });
  });
});
