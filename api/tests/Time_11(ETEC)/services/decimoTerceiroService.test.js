const { calcularDecimoTerceiro } = require('../../../src/Time_11(ETEC)/services/decimoTerceiroService')

describe('Teste do cálculo do décimo terceiro', () => {
    test('Deve retornar erro ao inserir mês -1', () => {
        const salario = 4000.0;
        const mes = -1;
        expect(() => calcularDecimoTerceiro(salario, mes)).toThrow('Meses trabalhados deve ser entre 1 e 12');
    });

    test('Deve retornar erro ao inserir mês 0', () => {
        const salario = 4000.0;
        const mes = 0;
        expect(() => calcularDecimoTerceiro(salario, mes)).toThrow('Meses trabalhados deve ser entre 1 e 12');
    });

    test('Deve retornar cálculo do décimo terceiro válido ao inserir mês 2', () => {
        const valorEsperado =
            {
                salarioBruto: 4000,
                mesesTrabalhados: 2,
                totalBruto: 666.67,
                primeiraParcela: 333.33,
                inssEmpregado: 50,
                segundaParcela: 283.34,
                observacao: 'INSS incide sobre o valor total na 2ª parcela. IRRF não calculado (depende de outras rendas)'
            }
        const salario = 4000.0;
        const mes = 2;

        const res = calcularDecimoTerceiro(salario, mes);
        expect(res).toEqual(valorEsperado);
    })
})
