const { calcularINSSProgressivo } = require('../../../src/Time_11(ETEC)/services/inssService')

describe('Teste do cálculo do INSS', () => {
    test('Deve retornar 0 quando salário bruto for menor que 0', async () => {
        const valorEsperado = 0;
        const salarioBruto = -1000;
        
        const res = calcularINSSProgressivo(salarioBruto);
        expect(res).toEqual(valorEsperado)
    })

    test('Deve retornar 0 quando salário bruto for 0', async () => {
        const valorEsperado = 0;
        const salarioBruto = 0; 

        const res = calcularINSSProgressivo(salarioBruto);
        expect(res).toEqual(valorEsperado)
    })

    test('Deve calcular INSS quando salário bruto for um valor válido', async () => {
        const valorEsperado = 248.6;
        const salarioBruto = 3000;

        const res = calcularINSSProgressivo(salarioBruto);
        expect(res).toBe(valorEsperado);
    })
})

