const { v4: uuidv4 } = require('uuid');
const db = require('../data/db');
const calc = require('../services/calculosService');

// ============ ALUNO 1: Lançamentos & Saldo ============

function criarLancamento(req, res) {
  const { data, valor, tipo, descricao, categoria, anexo } = req.body;

  // Validações básicas
  if (!data || !valor || !tipo || !descricao || !categoria) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: data, valor, tipo, descricao, categoria'
    });
  }
  if (!['entrada', 'saida'].includes(tipo)) {
    return res.status(400).json({ erro: 'tipo deve ser "entrada" ou "saida"' });
  }
  if (Number(valor) <= 0) {
    return res.status(400).json({ erro: 'valor deve ser positivo' });
  }

  const novo = {
    id: uuidv4(),
    data,
    valor: Number(valor),
    tipo,
    descricao,
    categoria,
    anexo: anexo || null,
    criadoEm: new Date().toISOString()
  };

  const store = db.load();
  store.lancamentos.push(novo);
  db.save(store);

  res.status(201).json(novo);
}

function listarLancamentos(req, res) {
  const { inicio, fim } = req.query;
  const store = db.load();
  let lista = store.lancamentos;
  if (inicio || fim) lista = calc.filtrarPorPeriodo(lista, inicio, fim);
  // Ordena por data desc
  lista = [...lista].sort((a, b) => new Date(b.data) - new Date(a.data));
  res.json(lista);
}

function obterSaldo(req, res) {
  const dataReferencia = req.query.dataReferencia || new Date().toISOString().slice(0, 10);
  const store = db.load();
  const ate = calc.filtrarAteData(store.lancamentos, dataReferencia);
  const resultado = calc.calcularSaldo(ate);
  res.json({ dataReferencia, ...resultado });
}

function deletarLancamento(req, res) {
  const { id } = req.params;
  const store = db.load();
  const antes = store.lancamentos.length;
  store.lancamentos = store.lancamentos.filter(l => l.id !== id);
  if (store.lancamentos.length === antes) {
    return res.status(404).json({ erro: 'Lançamento não encontrado' });
  }
  db.save(store);
  res.status(204).end();
}

// ============ ALUNO 2: Agregações ============

function resumoMensal(req, res) {
  const ano = Number(req.query.ano) || new Date().getFullYear();
  const store = db.load();
  res.json(calc.resumirPorMes(store.lancamentos, ano));
}

function porCategoria(req, res) {
  const tipo = req.query.tipo || 'saida';
  const ano = req.query.ano ? Number(req.query.ano) : null;
  if (!['entrada', 'saida'].includes(tipo)) {
    return res.status(400).json({ erro: 'tipo deve ser "entrada" ou "saida"' });
  }
  const store = db.load();
  res.json(calc.agruparPorCategoria(store.lancamentos, tipo, ano));
}

// ============ ALUNO 3: Anual & Exportação ============

function livroCaixaAnual(req, res) {
  const ano = Number(req.query.ano) || new Date().getFullYear();
  const store = db.load();
  res.json(calc.calcularLivroCaixaAnual(store.lancamentos, ano));
}

function exportarCSV(req, res) {
  const ano = req.query.ano ? Number(req.query.ano) : null;
  const store = db.load();
  let lista = store.lancamentos;
  if (ano) {
    lista = lista.filter(l => new Date(l.data).getFullYear() === ano);
  }
  const csv = calc.gerarCSV(lista);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="livro-caixa-${ano || 'completo'}.csv"`
  );
  // BOM para Excel pt-BR reconhecer UTF-8
  res.send('\ufeff' + csv);
}

module.exports = {
  criarLancamento,
  listarLancamentos,
  obterSaldo,
  deletarLancamento,
  resumoMensal,
  porCategoria,
  livroCaixaAnual,
  exportarCSV
};
