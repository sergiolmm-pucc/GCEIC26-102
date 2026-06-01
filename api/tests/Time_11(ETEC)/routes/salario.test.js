const request = require('supertest');
const app     = require('../../../src/app');
let respostaEsperada;
let payload;
let res;

describe('Tese do endpoint de cálculo de salário', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório',
        };

         payload = {
            salarioBruto: null,
        };

         res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for uma string não numérica', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser um número',
        };

         payload = {
            salarioBruto: 'abc',
        };

         res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for menor que zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero',
        };

         payload = {
            salarioBruto: -1600,
        };

         res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for igual a zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero',
        };

         payload = {
            salarioBruto: 0,
        };

         res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for menor que o mínimo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário não pode ser inferior ao mínimo de R$ 1.621,00 (2026)',
        };

         payload = {
            salarioBruto: 1600,
        };

         res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });

    test('Deve retornar 200 quando salário bruto for um valor válido', async () => {
         respostaEsperada = {
            status: 200,
            salarioBruto: 4000,
        };

         payload = {
            salarioBruto: 4000,
        };

         res = (await request(app).post('/ETEC11/salario').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toBe(respostaEsperada.erro);
    });
})
