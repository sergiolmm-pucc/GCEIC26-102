const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GRUPO12_API_URL
    ? import.meta.env.VITE_GRUPO12_API_URL
    : 'http://localhost:3012';

export async function postGrupo12(endpoint, payload) {
  const resposta = await fetch(`${API_BASE}/api/grupo12${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const corpo = await resposta.json();

  if (!resposta.ok || !corpo.success) {
    throw new Error(corpo.error || 'Nao foi possivel calcular agora.');
  }

  return corpo.data;
}
