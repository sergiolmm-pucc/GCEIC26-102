const request = require('supertest');
const app     = require('../../../src/app');

describe('Tese do endpoint de cálculo de salário', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório',
        };

        const payload = {
            salarioBruto: null,
        };

        const res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for uma string não numérica', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser um número',
        };

        const payload = {
            salarioBruto: 'abc',
        };

        const res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for menor que zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero',
        };

        const payload = {
            salarioBruto: -1600.00,
        };

        const res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for igual a zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero',
        };

        const payload = {
            salarioBruto: 0,
        };

        const res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for menor que o mínimo', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário não pode ser inferior ao mínimo de R$ 1.621,00 (2026)',
        };

        const payload = {
            salarioBruto: 1600.00,
        };

        const res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 200 quando salário bruto for um valor válido', async () => {
        const respostaEsperada = {
            status: 200,
            salarioBruto: 4000.00,
        };

        const payload = {
            salarioBruto: 4000.00,
        };

        const res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });
})
