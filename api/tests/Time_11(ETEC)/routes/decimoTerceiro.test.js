const request = require('supertest');
const app     = require('../../../src/app');
const { calcularDecimoTerceiro } = require('../../../src/Time_11(ETEC)/services/decimoTerceiroService');
let respostaEsperada;
let payload;
let res;

describe('Teste do endpoint de cálculo do décimo terceiro', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório'
        };

         payload = {
            salarioBruto: null,
            mesesTrabalhados: 2,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando salário bruto for uma string não numérica', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser um número'
        };

         payload = {
            salarioBruto: 'abc',
            mesesTrabalhados: 2,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for igual a zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero'
        };

         payload = {
            salarioBruto: 0.0,
            mesesTrabalhados: 2,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando salário bruto for menor que zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero'
        };

         payload = {
            salarioBruto: -2000.0,
            mesesTrabalhados: 2,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados é obrigatório'
        };

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: null,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for menor que zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

         payload = {
            salarioBruto: 2000.0,
            mesesTrabalhados: -2,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for igual a zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

         payload = {
            salarioBruto: 2000.0,
            mesesTrabalhados: 0,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto e meses tralhados for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório'
        };

         payload = {
            salarioBruto: null,
            mesesTrabalhados: null,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for menor que 1', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: -1, // Dando erro quando for 0, cai no if da route
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    })


    test('Deve retornar 400 quando meses trabalhados for uma string não numérica', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser um número'
        };

         payload = {
            salarioBruto: 2000.0,
            mesesTrabalhados: 'abc',
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando meses trabalhados for maior que 12', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: 13, // Dando erro quando for 0, cai no if da route
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);

    })

    test('Deve retornar 400 quando meses trabalhados for 0', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Meses Trabalhados deve ser entre 1 e 12'
        };

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: 0,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    })

    test('Deve retornar 400 quando meses trabalhador for um número não inteiro', async () => {
         respostaEsperada = {
            status: 400,
                erro: 'Meses Trabalhados deve ser um número inteiro',
        };

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: 2.21,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    })

    test('Deve retornar 400 quando o service lançar uma exceção', async () => {
         mensagemErro = 'Falha inesperada no cálculo';

        let appComServiceQueLanca;
        jest.isolateModules(() => {
            jest.doMock('../../../src/Time_11(ETEC)/services/decimoTerceiroService', () => ({
                calcularDecimoTerceiro: () => { throw new Error(mensagemErro); },
            }));
            appComServiceQueLanca = require('../../../src/app');
        });

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: 2,
        };

         res = (await request(appComServiceQueLanca).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual(mensagemErro);
    });

    test('Deve retornar 200 quando salário bruto e meses trabalhados for um valor válido', async () => {
         respostaEsperada = {
            status: 200,
        };

         payload = {
            salarioBruto: 2000,
            mesesTrabalhados: 12,
        };

         res = (await request(app).post('/ETEC11/decimo-terceiro').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
    })
})
