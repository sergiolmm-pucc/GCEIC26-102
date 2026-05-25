const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

function iniciarServidor() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

test('GET /api/grupo12/health retorna status da API', async () => {
  const { server, baseUrl } = await iniciarServidor();
  try {
    const resposta = await fetch(`${baseUrl}/api/grupo12/health`);
    const corpo = await resposta.json();

    assert.equal(resposta.status, 200);
    assert.equal(corpo.success, true);
    assert.equal(corpo.grupo, 'Grupo 12');
  } finally {
    server.close();
  }
});

test('POST /api/grupo12/impostos-pj calcula imposto estimado', async () => {
  const { server, baseUrl } = await iniciarServidor();
  try {
    const resposta = await fetch(`${baseUrl}/api/grupo12/impostos-pj`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receitaMensal: 10000,
        receitaAnualEstimativa: 120000,
        aliquota: 6,
      }),
    });
    const corpo = await resposta.json();

    assert.equal(resposta.status, 200);
    assert.equal(corpo.success, true);
    assert.equal(corpo.data.impostoEstimado, 600);
  } finally {
    server.close();
  }
});

test('POST /api/grupo12/simulador valida campos obrigatorios', async () => {
  const { server, baseUrl } = await iniciarServidor();
  try {
    const resposta = await fetch(`${baseUrl}/api/grupo12/simulador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receitaMensal: 10000 }),
    });
    const corpo = await resposta.json();

    assert.equal(resposta.status, 400);
    assert.equal(corpo.success, false);
    assert.match(corpo.error, /proLabore e obrigatorio/);
  } finally {
    server.close();
  }
});
