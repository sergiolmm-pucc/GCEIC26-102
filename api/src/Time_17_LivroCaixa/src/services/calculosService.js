/**
 * Service de cálculos do Livro Caixa.
 * Funções puras - facilita testes unitários.
 */

/**
 * Calcula saldo (entradas - saidas) de uma lista de lançamentos.
 * @param {Array} lancamentos
 * @returns {{totalEntradas:number, totalSaidas:number, saldo:number}}
 */
function calcularSaldo(lancamentos) {
  const totalEntradas = lancamentos
    .filter(l => l.tipo === 'entrada')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const totalSaidas = lancamentos
    .filter(l => l.tipo === 'saida')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  return {
    totalEntradas: round2(totalEntradas),
    totalSaidas: round2(totalSaidas),
    saldo: round2(totalEntradas - totalSaidas)
  };
}

/**
 * Filtra lançamentos até uma determinada data (inclusiva).
 */
function filtrarAteData(lancamentos, dataReferencia) {
  const ref = new Date(dataReferencia);
  return lancamentos.filter(l => new Date(l.data) <= ref);
}

/**
 * Filtra lançamentos por intervalo de datas.
 */
function filtrarPorPeriodo(lancamentos, inicio, fim) {
  return lancamentos.filter(l => {
    const d = new Date(l.data);
    if (inicio && d < new Date(inicio)) return false;
    if (fim && d > new Date(fim)) return false;
    return true;
  });
}

/**
 * Agrupa lançamentos por mês de um ano, retorna totais.
 */
function resumirPorMes(lancamentos, ano) {
  const meses = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    entradas: 0,
    saidas: 0,
    saldo: 0
  }));

  for (const l of lancamentos) {
    const d = new Date(l.data);
    if (d.getFullYear() !== ano) continue;
    const mes = d.getMonth();
    if (l.tipo === 'entrada') meses[mes].entradas += Number(l.valor);
    else if (l.tipo === 'saida') meses[mes].saidas += Number(l.valor);
  }

  meses.forEach(m => {
    m.entradas = round2(m.entradas);
    m.saidas = round2(m.saidas);
    m.saldo = round2(m.entradas - m.saidas);
  });

  const totalAno = meses.reduce(
    (acc, m) => ({
      entradas: acc.entradas + m.entradas,
      saidas: acc.saidas + m.saidas,
      saldo: acc.saldo + m.saldo
    }),
    { entradas: 0, saidas: 0, saldo: 0 }
  );

  return {
    ano,
    meses,
    totalAno: {
      entradas: round2(totalAno.entradas),
      saidas: round2(totalAno.saidas),
      saldo: round2(totalAno.saldo)
    }
  };
}

/**
 * Agrupa por categoria.
 */
function agruparPorCategoria(lancamentos, tipo, ano) {
  const filtrados = lancamentos.filter(l => {
    if (l.tipo !== tipo) return false;
    if (ano && new Date(l.data).getFullYear() !== ano) return false;
    return true;
  });

  const mapa = {};
  let totalGeral = 0;
  for (const l of filtrados) {
    if (!mapa[l.categoria]) mapa[l.categoria] = 0;
    mapa[l.categoria] += Number(l.valor);
    totalGeral += Number(l.valor);
  }

  const categorias = Object.entries(mapa).map(([categoria, total]) => ({
    categoria,
    total: round2(total),
    percentual: totalGeral > 0 ? round2((total / totalGeral) * 100) : 0
  }));

  categorias.sort((a, b) => b.total - a.total);
  return { tipo, categorias, totalGeral: round2(totalGeral) };
}

/**
 * Cálculo anual com verificação do limite de R$ 4,8 milhões.
 * Acima desse valor, produtor PJ rural precisa entregar livro caixa à RF.
 */
const LIMITE_RECEITA_FEDERAL = 4800000;

function calcularLivroCaixaAnual(lancamentos, ano) {
  const doAno = lancamentos.filter(
    l => new Date(l.data).getFullYear() === ano
  );

  const totalMovimentado = doAno
    .filter(l => l.tipo === 'entrada')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const obrigatorio = totalMovimentado > LIMITE_RECEITA_FEDERAL;
  const diferenca = round2(totalMovimentado - LIMITE_RECEITA_FEDERAL);

  return {
    ano,
    totalMovimentado: round2(totalMovimentado),
    limiteReceitaFederal: LIMITE_RECEITA_FEDERAL,
    obrigatorioDeclarar: obrigatorio,
    diferenca: obrigatorio ? diferenca : 0,
    mensagem: obrigatorio
      ? `Movimentação de R$ ${round2(totalMovimentado).toLocaleString('pt-BR')} excede o limite de R$ 4.800.000,00. Declaração obrigatória à Receita Federal.`
      : `Movimentação de R$ ${round2(totalMovimentado).toLocaleString('pt-BR')} dentro do limite. Declaração não obrigatória (recomendada para controle).`
  };
}

/**
 * Gera CSV (separador ; - padrão BR).
 */
function gerarCSV(lancamentos) {
  // Ordena por data
  const ordenados = [...lancamentos].sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );

  const header = ['Data', 'Tipo', 'Categoria', 'Descricao', 'Valor', 'Saldo'].join(';');

  let saldo = 0;
  const linhas = ordenados.map(l => {
    const valorNum = Number(l.valor);
    if (l.tipo === 'entrada') saldo += valorNum;
    else if (l.tipo === 'saida') saldo -= valorNum;
    return [
      l.data,
      l.tipo,
      `"${l.categoria}"`,
      `"${(l.descricao || '').replace(/"/g, '""')}"`,
      formatarValorBR(valorNum),
      formatarValorBR(saldo)
    ].join(';');
  });

  return [header, ...linhas].join('\n');
}

// helpers
function round2(n) {
  return Math.round(n * 100) / 100;
}

function formatarValorBR(n) {
  return n.toFixed(2).replace('.', ',');
}

module.exports = {
  calcularSaldo,
  filtrarAteData,
  filtrarPorPeriodo,
  resumirPorMes,
  agruparPorCategoria,
  calcularLivroCaixaAnual,
  gerarCSV,
  LIMITE_RECEITA_FEDERAL
};
