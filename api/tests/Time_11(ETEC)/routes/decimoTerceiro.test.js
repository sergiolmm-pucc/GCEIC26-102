const request = require('supertest');
const app     = require('../../../src/app');
const { calcularDecimoTerceiro } = require('../../../src/Time_11(ETEC)/decimoTerceiroService');

describe('Teste do endpoint de cálculo do décimo terceiro', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório'
        };

        const payload = {
            salarioBruto: null,
            mesesTrabalhados: 2,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando salário bruto for uma string não numérica', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser um número'
        };

        const payload = {
            salarioBruto: 'abc',
            mesesTrabalhados: 2,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for igual a zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero'
        };

        const payload = {
            salarioBruto: 0.0,
            mesesTrabalhados: 2,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando salário bruto for menor que zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero'
        };

        const payload = {
            salarioBruto: -2000.0,
            mesesTrabalhados: 2,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for nulo', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados é obrigatório'
        };

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: null,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for menor que zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

        const payload = {
            salarioBruto: 2000.0,
            mesesTrabalhados: -2,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for igual a zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

        const payload = {
            salarioBruto: 2000.0,
            mesesTrabalhados: 0,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto e meses tralhados for nulo', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório'
        };

        const payload = {
            salarioBruto: null,
            mesesTrabalhados: null,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for menor que 1', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: -1, // Dando erro quando for 0, cai no if da route
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    })


    test('Deve retornar 400 quando meses trabalhados for uma string não numérica', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser um número'
        };

        const payload = {
            salarioBruto: 2000.0,
            mesesTrabalhados: 'abc',
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for maior que 12', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: 13, // Dando erro quando for 0, cai no if da route
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);

    })

    test('Deve retornar 400 quando meses trabalhados for 0', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: 0,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    })

    test('Deve retornar 400 quando meses trabalhador for um número não inteiro', async () => {
        const respostaEsperada = {
            status: 400,
                erro: 'Meses Trabalhados deve ser um número inteiro',
        };

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: 2.21,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    })

    test('Deve retornar 400 quando o service lançar uma exceção', async () => {
        const mensagemErro = 'Falha inesperada no cálculo';

        let appComServiceQueLanca;
        jest.isolateModules(() => {
            jest.doMock('../../../src/Time_11(ETEC)/decimoTerceiroService', () => ({
                calcularDecimoTerceiro: () => { throw new Error(mensagemErro); },
            }));
            appComServiceQueLanca = require('../../../src/app');
        });

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: 2,
        };

        const res = (await request(appComServiceQueLanca).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual(mensagemErro);
    });

    test('Deve retornar 200 quando salário bruto e meses trabalhados for um valor válido', async () => {
        const respostaEsperada = {
            status: 200,
        };

        const payload = {
            salarioBruto: 2000.00,
            mesesTrabalhados: 12,
        };

        const res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
    })
})
