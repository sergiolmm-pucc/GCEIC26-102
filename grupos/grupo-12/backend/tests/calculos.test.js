const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calcularFaturamentoMensal,
  calcularSimplesNacional,
  calcularProLaboreInss,
  calcularReservaMensal,
  calcularSimuladorCompleto,
} = require('../src/calculos');

test('calcula faturamento mensal por valor hora e horas trabalhadas', () => {
  const resultado = calcularFaturamentoMensal({ valorHora: 120, horasTrabalhadas: 160 });
  assert.equal(resultado.receitaMensal, 19200);
});

test('calcula Simples Nacional com aliquota efetiva aproximada', () => {
  const resultado = calcularSimplesNacional({
    receitaMensal: 10000,
    receitaAnualEstimativa: 120000,
    aliquota: 6,
    deducao: 0,
  });

  assert.equal(resultado.impostoEstimado, 600);
  assert.equal(resultado.aliquotaEfetiva, 6);
  assert.equal(resultado.receitaLiquidaEstimativa, 9400);
});

test('calcula pro-labore liquido apos INSS', () => {
  const resultado = calcularProLaboreInss({ proLabore: 3000, percentualINSS: 11 });
  assert.equal(resultado.valorINSS, 330);
  assert.equal(resultado.proLaboreLiquido, 2670);
});

test('calcula reservas mensais recomendadas', () => {
  const resultado = calcularReservaMensal({
    receitaMensal: 10000,
    percentualReservaImpostos: 10,
    percentualReservaFerias: 8.33,
    percentualReservaEmergencia: 5,
  });

  assert.equal(resultado.reservaImpostos, 1000);
  assert.equal(resultado.reservaFerias, 833);
  assert.equal(resultado.reservaEmergencia, 500);
  assert.equal(resultado.totalReservas, 2333);
});

test('calcula simulacao completa de liquido estimado', () => {
  const resultado = calcularSimuladorCompleto({
    receitaMensal: 10000,
    proLabore: 3000,
    percentualImposto: 6,
    percentualINSS: 11,
    percentualReserva: 10,
  });

  assert.equal(resultado.impostoEstimado, 600);
  assert.equal(resultado.inssEstimado, 330);
  assert.equal(resultado.reservaRecomendada, 1000);
  assert.equal(resultado.valorLiquidoEstimado, 8070);
});

test('valida campos obrigatorios nos calculos', () => {
  assert.throws(
    () => calcularSimplesNacional({ receitaMensal: 10000, aliquota: '' }),
    /aliquota e obrigatorio/,
  );
});
