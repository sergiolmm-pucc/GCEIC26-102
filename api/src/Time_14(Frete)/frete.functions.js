const TIPOS_FRETE = {
    ECONOMICO: 'economico',
    NORMAL: 'normal',
    EXPRESSO: 'expresso',
    URGENTE: 'urgente'
};

const ALIQUOTA_TIPOS_FRETE = {
    [TIPOS_FRETE.ECONOMICO]: 0.015,
    [TIPOS_FRETE.NORMAL]: 0.025,
    [TIPOS_FRETE.EXPRESSO]: 0.04,
    [TIPOS_FRETE.URGENTE]: 0.06
};

const TAXA_IMPORTACAO = 0.15;
const TAXA_SEGURO = 0.05;
const FATOR_CUBAGEM = 12000;


function validarNumeroPositivo(valor, nomeCampo) {
    const numero = Number(valor);

    if (Number.isNaN(numero) || numero <= 0) {
        throw new Error(`${nomeCampo} deve ser um valor positivo!`);
    }
};

// O peso cubado calcula o quão volumoso é uma encomenda.
// Uma encomenda pode ser muito volumosa, apesar de leve, o que acaba ocupando muito espaço nos veículos de entrega.
// Por outro lado, uma encomenda pode ser muito pesada (densa) o que acaba impactando também o custo do frete.

function calcularPesoCubado(comprimentoCm, larguraCm, alturaCm){

    // Passar as entradas por validacao:

    validarNumeroPositivo(comprimentoCm, 'Comprimento');
    validarNumeroPositivo(larguraCm, 'Largura');
    validarNumeroPositivo(alturaCm, 'Altura');


    const pesoCubado = (comprimentoCm * larguraCm * alturaCm) / FATOR_CUBAGEM;

    // Tipar para Number!
    return Number(pesoCubado.toFixed(2));

}


// O peso faturado decidirá qual métrica será usada para o cálculo do frete.
// Se a carga é muito volumosa comparada ao seu peso real (pesoCubado > pesoReal), então este (pesoCubado) parâmetro guiará o custo.
// Se a carga é muito massiva comparada ao seu volume (pesoReal > pesoCubado), este parâmetro (pesoReal) será a métrica de custo.
// O maior valor entre os dois será utilizado no cálculo do custo do frete.

function calcularPesoFaturado(pesoReal, pesoCubado){

    validarNumeroPositivo(pesoCubado, 'Peso Cubado');
    validarNumeroPositivo(pesoReal, 'Peso Real');

    return Math.max(pesoReal, pesoCubado);
}


// Decidido o Peso Faturado, adiciona-se a métrica de distância ao cálculo do frete.

function calcularValorBase(distanciaKm, pesoFaturado, tipoFrete){
    
    validarNumeroPositivo(distanciaKm, 'Distancia KM');
    validarNumeroPositivo(pesoFaturado, 'Peso Faturado');

    const aliquotaFrete = ALIQUOTA_TIPOS_FRETE[tipoFrete];

    if(aliquotaFrete === undefined){
        throw new Error('Tipo de frete inválido!')
    }

    const valorBase = distanciaKm * pesoFaturado * aliquotaFrete

    return Number(valorBase.toFixed(2));

}

function calcularTaxaImportacao(valorDeclarado, importado){

    if(!importado){
        return 0;
    };

    validarNumeroPositivo(valorDeclarado, 'Valor Declarado');

    const taxaImportacao = valorDeclarado * TAXA_IMPORTACAO;

    return Number(taxaImportacao.toFixed(2));
};

function calcularTaxaSeguro(valorDeclarado, segurado){

    if(!segurado){
        return 0;
    };

    validarNumeroPositivo(valorDeclarado, 'Valor Declarado');

    const taxaSeguro = valorDeclarado * TAXA_SEGURO;

    return Number(taxaSeguro.toFixed(2));
};


// Função que retorna o preço total do frete. Aqui encadeia toda a lógica de preciifcação

function calcularFreteCompleto(
    comprimento,
    largura,
    altura,
    pesoReal,
    distanciaKm,
    tipoFrete,
    valorDeclarado = 0,
    importado = false,
    segurado = false
) {

    const pesoCubado = calcularPesoCubado(comprimento, largura, altura);
    const pesoFaturado = calcularPesoFaturado(pesoReal, pesoCubado)
    const valorBase = calcularValorBase(distanciaKm, pesoFaturado, tipoFrete);

    const taxaImportacao = calcularTaxaImportacao(valorDeclarado, importado);
    const taxaSeguro = calcularTaxaSeguro(valorDeclarado, segurado);

    const valorFinal = valorBase + taxaImportacao + taxaSeguro;

    return{
        pesoCubado,
        pesoFaturado,
        valorBase,
        taxaImportacao,
        taxaSeguro,
        valorFinal: Number(valorFinal.toFixed(2))
    };

};



module.exports = {
TIPOS_FRETE,
  ALIQUOTA_TIPOS_FRETE,
  TAXA_IMPORTACAO,
  TAXA_SEGURO,
  FATOR_CUBAGEM,
  calcularPesoCubado,
  calcularPesoFaturado,
  calcularValorBase,
  calcularTaxaImportacao,
  calcularTaxaSeguro,
  calcularFreteCompleto
};

