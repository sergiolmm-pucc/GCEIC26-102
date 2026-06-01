const TABELA = {
  BASE_CALC: {
    faixas: [
      { ate: 15, alicota: 0.01 },
      { ate: 30, alicota: 0.03 },
    ],
  },
  REFERENCIA: 20 / 100,
};

// Re-exports FLP (Time 13)
const { calcularINSS, calcularIRRF, calcularFolha, TABELA_INSS, TABELA_IRRF } = require('./flp/flpFuncoes');

function calcularArea(base, altura) {
  if (base <= 0) throw new Error('Base com valor errado');
  if (altura <= 0) throw new Error('Altura com valor errado');
  let resultado = 0;
  resultado = base * altura;
  return resultado.toFixed(2);
}

function calcular(dados) {
  console.log(dados);
  const { altura = 0, largura = 0 } = dados;
  if (altura <= 0) throw new Error('Base com valor errado');
  if (largura <= 0) throw new Error('Altura com valor errado');
  let resultado = 0;
  resultado = largura * altura;
  return resultado.toFixed(2);
}

function calcularMKM(dv, df, ml) {
  /*
    Calcule o Markup Multiplicador
    Fórmula: MKM = 100 / (100 - (DV + DF + ML))
    Onde:
      DV = percentual de despesas variáveis
      DF = percentual de despesas fixas
      ML = percentual de margem de lucro desejado
  */
  if (dv <= 0) throw new Error('Despesas variáveis com valor errado');
  if (df <= 0) throw new Error('Despesas fixas com valor errado');
  if (ml <= 0) throw new Error('Margem de lucro com valor errado');
  return 100 / (100 - (dv + df + ml));
}

function calcularPrecoVenda(dados) {
  console.log(dados);
  const { preco = 0, dv = 0, df = 0, ml = 0 } = dados;
  if (preco <= 0) throw new Error('Custo com valor errado');
  if (dv <= 0) throw new Error('Despesas variáveis com valor errado');
  if (df <= 0) throw new Error('Despesas fixas com valor errado');
  if (ml <= 0) throw new Error('Margem de lucro com valor errado');
  let precoVenda = 0;
  precoVenda = preco * calcularMKM(dv, df, ml);
  return precoVenda.toFixed(2);
}

function calcularDesconto(dados) {
  const { preco = 0, desconto = 0 } = dados;
  if (preco <= 0) throw new Error('Preço com valor errado');
  if (desconto < 0 || desconto > 100) throw new Error('Desconto com valor errado');
  let precoComDesconto = 0;
  precoComDesconto = preco - (preco * (desconto / 100));
  return precoComDesconto.toFixed(2);
}

module.exports = {
  // Time_13 (FLP)
  TABELA,
  calcularArea,
  calcular,
  calcularINSS,
  calcularIRRF,
  calcularFolha,
  TABELA_INSS,
  TABELA_IRRF,
  // main (Markup)
  calcularMKM,
  calcularPrecoVenda,
  calcularDesconto,
};