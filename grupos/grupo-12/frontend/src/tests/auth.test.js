import test from 'node:test';
import assert from 'node:assert/strict';
import { autenticarGrupo12 } from '../auth.js';

test('login permite usuario e senha fixos do Grupo 12', () => {
  assert.equal(autenticarGrupo12('grupo12', 'grupo12'), true);
});

test('login recusa usuario incorreto', () => {
  assert.equal(autenticarGrupo12('outro', 'grupo12'), false);
});
