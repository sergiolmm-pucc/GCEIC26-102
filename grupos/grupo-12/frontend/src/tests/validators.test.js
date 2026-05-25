import test from 'node:test';
import assert from 'node:assert/strict';
import { validarCamposObrigatorios, validarNumerosPositivos } from '../validators.js';

test('valida campos obrigatorios ausentes', () => {
  const resultado = validarCamposObrigatorios({ receitaMensal: '', aliquota: '6' }, [
    'receitaMensal',
    'aliquota',
  ]);

  assert.equal(resultado.valido, false);
  assert.deepEqual(resultado.faltantes, ['receitaMensal']);
});

test('valida numeros positivos', () => {
  const resultado = validarNumerosPositivos({ receitaMensal: '10000', aliquota: '-1' }, [
    'receitaMensal',
    'aliquota',
  ]);

  assert.equal(resultado.valido, false);
  assert.deepEqual(resultado.invalidos, ['aliquota']);
});
