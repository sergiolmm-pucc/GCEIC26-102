export function validarCamposObrigatorios(dados, campos) {
  const faltantes = campos.filter((campo) => {
    const valor = dados[campo];
    return valor === undefined || valor === null || valor === '';
  });

  return {
    valido: faltantes.length === 0,
    faltantes,
    mensagem: faltantes.length ? `Preencha: ${faltantes.join(', ')}` : '',
  };
}

export function validarNumerosPositivos(dados, campos) {
  const invalidos = campos.filter((campo) => {
    const valor = Number(String(dados[campo]).replace(',', '.'));
    return !Number.isFinite(valor) || valor < 0;
  });

  return {
    valido: invalidos.length === 0,
    invalidos,
    mensagem: invalidos.length ? `Revise valores numericos: ${invalidos.join(', ')}` : '',
  };
}
