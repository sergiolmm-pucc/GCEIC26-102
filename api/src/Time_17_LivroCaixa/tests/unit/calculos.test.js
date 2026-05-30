const calc = require('../../src/services/calculosService');

describe('calculosService - calcularSaldo', () => {
  test('saldo zero quando lista vazia', () => {
    expect(calc.calcularSaldo([])).toEqual({
      totalEntradas: 0,
      totalSaidas: 0,
      saldo: 0
    });
  });

  test('calcula entradas e saídas corretamente', () => {
    const lancamentos = [
      { tipo: 'entrada', valor: 1000 },
      { tipo: 'entrada', valor: 500 },
      { tipo: 'saida', valor: 300 }
    ];
    expect(calc.calcularSaldo(lancamentos)).toEqual({
      totalEntradas: 1500,
      totalSaidas: 300,
      saldo: 1200
    });
  });

  test('lida com valores decimais', () => {
    const lancamentos = [
      { tipo: 'entrada', valor: 100.55 },
      { tipo: 'saida', valor: 50.25 }
    ];
    const r = calc.calcularSaldo(lancamentos);
    expect(r.saldo).toBe(50.30);
  });

  test('saldo pode ser negativo', () => {
    const lancamentos = [
      { tipo: 'saida', valor: 1000 },
      { tipo: 'entrada', valor: 200 }
    ];
    expect(calc.calcularSaldo(lancamentos).saldo).toBe(-800);
  });
});

describe('calculosService - filtrarAteData', () => {
  const lancamentos = [
    { data: '2026-01-15', valor: 100, tipo: 'entrada' },
    { data: '2026-03-20', valor: 200, tipo: 'entrada' },
    { data: '2026-06-10', valor: 300, tipo: 'entrada' }
  ];

  test('filtra inclusivo até a data', () => {
    const r = calc.filtrarAteData(lancamentos, '2026-03-20');
    expect(r).toHaveLength(2);
  });

  test('retorna vazio se data anterior a todos', () => {
    expect(calc.filtrarAteData(lancamentos, '2025-12-31')).toHaveLength(0);
  });

  test('retorna todos se data muito posterior', () => {
    expect(calc.filtrarAteData(lancamentos, '2027-01-01')).toHaveLength(3);
  });
});

describe('calculosService - resumirPorMes', () => {
  test('agrupa por mês corretamente', () => {
    const lancamentos = [
      { data: '2026-01-15', tipo: 'entrada', valor: 1000 },
      { data: '2026-01-20', tipo: 'saida', valor: 200 },
      { data: '2026-03-10', tipo: 'entrada', valor: 500 }
    ];
    const r = calc.resumirPorMes(lancamentos, 2026);
    expect(r.meses[0].entradas).toBe(1000);
    expect(r.meses[0].saidas).toBe(200);
    expect(r.meses[0].saldo).toBe(800);
    expect(r.meses[2].entradas).toBe(500);
    expect(r.totalAno.entradas).toBe(1500);
    expect(r.totalAno.saidas).toBe(200);
  });

  test('ignora lançamentos de outro ano', () => {
    const lancamentos = [
      { data: '2025-12-31', tipo: 'entrada', valor: 999 },
      { data: '2026-01-01', tipo: 'entrada', valor: 100 }
    ];
    const r = calc.resumirPorMes(lancamentos, 2026);
    expect(r.totalAno.entradas).toBe(100);
  });

  test('retorna 12 meses com zero quando vazio', () => {
    const r = calc.resumirPorMes([], 2026);
    expect(r.meses).toHaveLength(12);
    expect(r.totalAno.saldo).toBe(0);
  });
});

describe('calculosService - agruparPorCategoria', () => {
  const lancamentos = [
    { tipo: 'saida', valor: 500, categoria: 'Funcionários', data: '2026-01-01' },
    { tipo: 'saida', valor: 300, categoria: 'Funcionários', data: '2026-02-01' },
    { tipo: 'saida', valor: 200, categoria: 'Insumos', data: '2026-03-01' },
    { tipo: 'entrada', valor: 1000, categoria: 'Venda', data: '2026-01-01' }
  ];

  test('soma valores por categoria do tipo informado', () => {
    const r = calc.agruparPorCategoria(lancamentos, 'saida');
    expect(r.categorias).toHaveLength(2);
    expect(r.categorias[0].categoria).toBe('Funcionários');
    expect(r.categorias[0].total).toBe(800);
    expect(r.totalGeral).toBe(1000);
  });

  test('calcula percentuais', () => {
    const r = calc.agruparPorCategoria(lancamentos, 'saida');
    expect(r.categorias[0].percentual).toBe(80);
    expect(r.categorias[1].percentual).toBe(20);
  });

  test('filtra por ano quando informado', () => {
    const r = calc.agruparPorCategoria(lancamentos, 'saida', 2025);
    expect(r.totalGeral).toBe(0);
  });
});

describe('calculosService - calcularLivroCaixaAnual', () => {
  test('marca como obrigatório quando excede R$ 4,8 milhões', () => {
    const lancamentos = [
      { data: '2026-06-01', tipo: 'entrada', valor: 5000000 }
    ];
    const r = calc.calcularLivroCaixaAnual(lancamentos, 2026);
    expect(r.obrigatorioDeclarar).toBe(true);
    expect(r.diferenca).toBe(200000);
  });

  test('não obrigatório quando abaixo do limite', () => {
    const lancamentos = [
      { data: '2026-06-01', tipo: 'entrada', valor: 1000000 }
    ];
    const r = calc.calcularLivroCaixaAnual(lancamentos, 2026);
    expect(r.obrigatorioDeclarar).toBe(false);
    expect(r.diferenca).toBe(0);
  });

  test('considera apenas entradas (não saídas) na movimentação', () => {
    const lancamentos = [
      { data: '2026-06-01', tipo: 'entrada', valor: 3000000 },
      { data: '2026-06-02', tipo: 'saida', valor: 5000000 }
    ];
    const r = calc.calcularLivroCaixaAnual(lancamentos, 2026);
    expect(r.totalMovimentado).toBe(3000000);
    expect(r.obrigatorioDeclarar).toBe(false);
  });

  test('limite exato de 4.800.000 não é obrigatório (apenas >)', () => {
    const lancamentos = [
      { data: '2026-06-01', tipo: 'entrada', valor: 4800000 }
    ];
    const r = calc.calcularLivroCaixaAnual(lancamentos, 2026);
    expect(r.obrigatorioDeclarar).toBe(false);
  });
});

describe('calculosService - gerarCSV', () => {
  test('gera cabeçalho correto', () => {
    const csv = calc.gerarCSV([]);
    expect(csv).toBe('Data;Tipo;Categoria;Descricao;Valor;Saldo');
  });

  test('calcula saldo corrente em cada linha', () => {
    const lancamentos = [
      { data: '2026-01-01', tipo: 'entrada', valor: 1000, categoria: 'A', descricao: 'x' },
      { data: '2026-01-02', tipo: 'saida', valor: 300, categoria: 'B', descricao: 'y' }
    ];
    const csv = calc.gerarCSV(lancamentos);
    const linhas = csv.split('\n');
    expect(linhas[1]).toContain('1000,00;1000,00');
    expect(linhas[2]).toContain('300,00;700,00');
  });

  test('ordena por data', () => {
    const lancamentos = [
      { data: '2026-02-01', tipo: 'entrada', valor: 100, categoria: 'A', descricao: 'segundo' },
      { data: '2026-01-01', tipo: 'entrada', valor: 200, categoria: 'A', descricao: 'primeiro' }
    ];
    const csv = calc.gerarCSV(lancamentos);
    const linhas = csv.split('\n');
    expect(linhas[1]).toContain('primeiro');
    expect(linhas[2]).toContain('segundo');
  });

  test('escapa aspas dentro de descrição', () => {
    const lancamentos = [
      { data: '2026-01-01', tipo: 'entrada', valor: 100, categoria: 'A', descricao: 'Venda "premium"' }
    ];
    const csv = calc.gerarCSV(lancamentos);
    expect(csv).toContain('"Venda ""premium"""');
  });
});
