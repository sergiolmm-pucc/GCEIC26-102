const { calcularFerias } = require('../../../src/Time_11(ETEC)/feriasService');

describe('Teste do cálculo de férias', () => {
    test('Deve calcular férias de 30 dias como salário cheio + 1/3 constitucional', () => {
        const valorEsperado =
            {
                salarioBruto: 3000,
                diasConcedidos: 30,
                valorFerias: 3000,
                umTercoConstitucional: 1000,
                totalBruto: 4000,
                inssEmpregado: 368.6,
                observacao: 'Férias + 1/3 são isentas de IRRF',
                totalLiquido: 3631.4
            };

        const salarioBruto = 3000;

        const res = calcularFerias(salarioBruto);

        expect(res).toEqual(valorEsperado);
    });

    test('Deve calcular férias proporcionais de 15 dias como metade do salário', () => {
        const valorEsperado =
            {
                salarioBruto: 3000,
                diasConcedidos: 15,
                valorFerias: 1500,
                umTercoConstitucional: 500,
                totalBruto: 2000,
                inssEmpregado: 155.69,
                observacao: 'Férias + 1/3 são isentas de IRRF',
                totalLiquido: 1844.31
            };

        const salarioBruto = 3000;
        const diasDireito = 30;
        const diasConcedidos = 15;

        const res = calcularFerias(salarioBruto, diasDireito, diasConcedidos);

        expect(res).toEqual(valorEsperado);
    });

    test('Deve descontar INSS sobre o total bruto (férias + 1/3), não só sobre o valor das férias', () => {
        const valorEsperado =
            {
                salarioBruto: 5000,
                diasConcedidos: 30,
                valorFerias: 5000,
                umTercoConstitucional: 1666.67,
                totalBruto: 6666.67,
                inssEmpregado: 734.85,
                observacao: 'Férias + 1/3 são isentas de IRRF',
                totalLiquido: 5931.82
            };

        const salarioBruto = 5000;

        const res = calcularFerias(salarioBruto);

        expect(res).toEqual(valorEsperado);
    });

    test('Deve isentar IRRF: totalLiquido reflete apenas dedução de INSS e observação informa a isenção', () => {
        const valorEsperado =
            {
                salarioBruto: 4000,
                diasConcedidos: 30,
                valorFerias: 4000,
                umTercoConstitucional: 1333.33,
                totalBruto: 5333.33,
                inssEmpregado: 548.18,
                observacao: 'Férias + 1/3 são isentas de IRRF',
                totalLiquido: 4785.15
            };

        const salarioBruto = 4000;

        const res = calcularFerias(salarioBruto);

        expect(res).toEqual(valorEsperado);
    });
});
