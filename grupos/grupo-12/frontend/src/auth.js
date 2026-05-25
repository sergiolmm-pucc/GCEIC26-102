export const CREDENCIAIS_GRUPO12 = {
  usuario: 'grupo12',
  senha: 'grupo12',
};

export function autenticarGrupo12(usuario, senha) {
  return usuario === CREDENCIAIS_GRUPO12.usuario && senha === CREDENCIAIS_GRUPO12.senha;
}
