const { calcularSalario } = require('../../../src/Time_11(ETEC)/services/salarioService');

describe('Teste do cálculo do salário', () => {
    test('Deve lançar erro quando o salário for menor que o mínimo', () => {
        const salario = 1600;

        expect(() => calcularSalario(salario))
            .toThrow('Salário não pode ser inferior ao mínimo de R$ 1.621,00 (2026)');
    });

    test('Deve calcular corretamente o salário mínimo de 2026', () => {
        const salario = 1621.00

        const valorEsperado = {
            salarioBruto: 1621.00,
            inssEmpregado: 121.57,
            salarioLiquido: 1499.43,
            encargosEmpregador: {
                inssPatronal: 129.68,
                fgts: 129.68,
                reservaIndenizatoria: 51.87,
                seguroAcidente: 12.97,
                custoTotalEmpregador: 1945.20,
            },
        };
        
        const res = calcularSalario(salario);

        expect(res).toEqual(valorEsperado);
    });

    test('Deve calcular corretamente um salário de R$ 3.000,00', () => {
        const salario = 3000.00;

        const valorEsperado = {
            salarioBruto: 3000.00,
            inssEmpregado: 248.60,
            salarioLiquido: 2751.40,
            encargosEmpregador: {
                inssPatronal: 240.00,
                fgts: 240.00, 
                reservaIndenizatoria: 96.00, 
                seguroAcidente: 24.00,
                custoTotalEmpregador: 3600.00
            },
        };

        const res = calcularSalario(salario);

        expect(res).toEqual(valorEsperado);

    });
    
    test('Deve calcular corretamente um salário acima do teto das faixas do INSS', () => {
        const salario = 9000.00;

        const valorEsperado = {
            salarioBruto: 9000.00,
            inssEmpregado: 988.09,
            salarioLiquido: 8011.91,
            encargosEmpregador: {
                inssPatronal: 720.00,
                fgts: 720.00, 
                reservaIndenizatoria: 288.00, 
                seguroAcidente: 72.00,
                custoTotalEmpregador: 10800.00
            },
        };

        const res = calcularSalario(salario);

        expect(res).toEqual(valorEsperado);

    });

})
