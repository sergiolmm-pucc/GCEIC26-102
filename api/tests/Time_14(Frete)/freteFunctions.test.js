// Testes unitários para as funções de api

const {
    calcularPesoCubado,
    calcularValorBase,
    calcularPesoFaturado,
    calcularTaxaImportacao,
    calcularTaxaSeguro,
    calcularFreteCompleto
} = require('../../src/Time_14(Frete)/frete.functions.js');


const {
    TIPOS_FRETE
} = require('../../src/Time_14(Frete)/frete.functions.js');


// Teste das funções componentes

describe('Teste da função calcularPesoCubado e validação de entrada dos valores', () => {

    test('Calcular peso cubado corretamente', () => {
        const resultado = calcularPesoCubado(40, 30, 20);

        // pesoCubado = (comprimento * largura * altura) / FATOR_CUBAGEM;

        // Lembrando que a saída é um number com dois pontos decimais...
        expect(resultado).toBe(2.00);
    });

    test('Deve lancar erro se houver um valor nulo', () => {
        expect(() => calcularPesoCubado(0, 30, 20)).toThrow(
            'Comprimento deve ser um valor positivo!'
        );
    });

    test('Deve lancar erro se houver um valor negativo', () => {
        expect(() => calcularPesoCubado(10, -30, 20)).toThrow(
            'Largura deve ser um valor positivo!'
        );  
    });

    test("Lançar erro se um dos argumentos não for number", () => {
        
        expect(() => calcularPesoCubado(10, 30, 'a')).toThrow(
            'Altura deve ser um valor positivo!'
        )
    });
});


describe('Teste da funçao calcularPesoFaturado', () => {

    test('Calcular valor maior corretamente', () => {
        
        const resultado = calcularPesoFaturado(30, 50);

        expect(resultado).toBe(50);
    
    });

});

describe('Teste da funçao calcularValorBase', () => {

    // function calcularValorBase(distanciaKm, pesoFaturado, tipoFrete)

    // const valorBase = distanciaKm * pesoFaturado * aliquotaFrete

    /*
        const ALIQUOTA_TIPOS_FRETE = {
        [TIPOS_FRETE.ECONOMICO]: 0.015,
        [TIPOS_FRETE.NORMAL]: 0.025,
        [TIPOS_FRETE.EXPRESSO]: 0.04,
        [TIPOS_FRETE.URGENTE]: 0.06
    
    */

    test('Cálculo para frete tipo economico', () => {

        // Aliquota = 1.5%
        const resultado = calcularValorBase(100, 50, TIPOS_FRETE.ECONOMICO);

        expect(resultado).toBe(75.00)

    });

    
    test('Cálculo para frete tipo normal', () => {

        // Aliquota = 2.5%
        const resultado = calcularValorBase(100, 50, TIPOS_FRETE.NORMAL);

        expect(resultado).toBe(125.00);
    });

    test('Cálculo para frete tipo expresso', () => {

        // Aliquota = 4%
        const resultado = calcularValorBase(100, 50, TIPOS_FRETE.EXPRESSO);

        expect(resultado).toBe(200.00);
    });

    test('Cálculo para frete tipo urgente', () => {

        // Aliquota = 6%
        const resultado = calcularValorBase(100, 50, TIPOS_FRETE.URGENTE);

        expect(resultado).toBe(300.00);
    });

    test('Calculo para frete de tipo não existente', () => {

        expect(() => calcularValorBase(100, 50, TIPOS_FRETE.TESTE)).toThrow(
            'Tipo de frete inválido!'
        )
    });
});

describe('Teste do Cálculo da Taxa de Importação', () => {


    // const TAXA_IMPORTACAO = 0.15;

    test('Cálculo para ver se a taxa é aplicável', () => {

        const resultado = calcularTaxaImportacao(200, false);
        expect(resultado).toBe(0.00);
    });

    test('Cálculo correto da taxa quando aplicável', () => {

        const resultado = calcularTaxaImportacao(100, true);
        expect(resultado).toBe(15.00);

    });

});

describe('Teste do cálculo da taxa de seguro', () => {

    // const TAXA_SEGURO = 0.05;

    test('Valor zero quando bem não segurado', () => {

        const resultado = calcularTaxaSeguro(100, false);
        expect(resultado).toBe(0.00);

    });

    test('Cálculo correto da taxa de seguro', () => {

        const resultado = calcularTaxaSeguro(100, true);
        expect(resultado).toBe(5.00);

    });
});


// Teste da função agregadora calcularFreteCompleto

describe('Teste de calcularFreteCompleto', () => {
    test('deve calcular o frete completo com importação e seguro', () => {
        const resultado = calcularFreteCompleto(
            40, // comprimento
            30, // largura
            20, // altura
            8,  // pesoReal
            250, // distanciaKm
            TIPOS_FRETE.NORMAL,
            1000, // valorDeclarado
            true, // importado
            true  // segurado
        );

        expect(resultado).toEqual({
            pesoCubado: 2,
            pesoFaturado: 8,
            valorBase: 50,
            taxaImportacao: 150,
            taxaSeguro: 50,
            valorFinal: 250
        });
    });

    test('deve calcular o frete completo sem importação e sem seguro', () => {
        const resultado = calcularFreteCompleto(
            40,
            30,
            20,
            8,
            250,
            TIPOS_FRETE.NORMAL,
            1000,
            false,
            false
        );

        expect(resultado).toEqual({
            pesoCubado: 2,
            pesoFaturado: 8,
            valorBase: 50,
            taxaImportacao: 0,
            taxaSeguro: 0,
            valorFinal: 50
        });
    });

    test('deve aplicar apenas taxa de importação quando importado for true', () => {
        const resultado = calcularFreteCompleto(
            40,
            30,
            20,
            8,
            250,
            TIPOS_FRETE.NORMAL,
            1000,
            true,
            false
        );

        expect(resultado.valorBase).toBe(50);
        expect(resultado.taxaImportacao).toBe(150);
        expect(resultado.taxaSeguro).toBe(0);
        expect(resultado.valorFinal).toBe(200);
    });

    test('deve aplicar apenas taxa de seguro quando segurado for true', () => {
        const resultado = calcularFreteCompleto(
            40,
            30,
            20,
            8,
            250,
            TIPOS_FRETE.NORMAL,
            1000,
            false,
            true
        );

        expect(resultado.valorBase).toBe(50);
        expect(resultado.taxaImportacao).toBe(0);
        expect(resultado.taxaSeguro).toBe(50);
        expect(resultado.valorFinal).toBe(100);
    });

    test('deve lançar erro quando tipo de frete for inválido', () => {
        expect(() => {
            calcularFreteCompleto(
                40,
                30,
                20,
                8,
                250,
                'turbo-master',
                1000,
                true,
                true
            );
        }).toThrow('Tipo de frete inválido!');
    });

    test('deve lançar erro quando algum valor numérico obrigatório for inválido', () => {
        expect(() => {
            calcularFreteCompleto(
                -40,
                30,
                20,
                8,
                250,
                TIPOS_FRETE.NORMAL,
                1000,
                true,
                true
            );
        }).toThrow('Comprimento deve ser um valor positivo!');
    });

    test('deve lançar erro quando valorDeclarado for inválido e importado for true', () => {
        expect(() => {
            calcularFreteCompleto(
                40,
                30,
                20,
                8,
                250,
                TIPOS_FRETE.NORMAL,
                0,
                true,
                false
            );
        }).toThrow('Valor Declarado deve ser um valor positivo!');
    });

    test('deve lançar erro quando valorDeclarado for inválido e segurado for true', () => {
        expect(() => {
            calcularFreteCompleto(
                40,
                30,
                20,
                8,
                250,
                TIPOS_FRETE.NORMAL,
                0,
                false,
                true
            );
        }).toThrow('Valor Declarado deve ser um valor positivo!');
    });
});
