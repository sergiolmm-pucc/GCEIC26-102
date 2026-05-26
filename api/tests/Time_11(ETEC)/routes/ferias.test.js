const request = require('supertest');
const app     = require('../../../src/app');
const { calcularFerias } = require('../../../src/Time_11(ETEC)/feriasService');

describe('Teste do endpoint de cálculo de férias', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório',
        };

        const payload = {
            salarioBruto: null,
            diasConcedidos: 15,
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto menor que zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero',
        };

        const payload = {
            salarioBruto: -1000.0,
            diasConcedidos: 15,
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto igual a zero', async () => {
        const respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser maior que zero',
        };

        const payload = {
            salarioBruto: 0,
            diasConcedidos: 15,
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 200 quando dias concedidos for nulo e usar como 30 dias concedidos por padrão', async () => {
        const respostaEsperada = {
            status: 200,
            diasConcedidos: 30,
        };

        const payload = {
            salarioBruto: 2000.00,
            diasConcedidos: undefined,
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.diasConcedidos).toBe(respostaEsperada.diasConcedidos);
    });

    test('Deve retornar 200 quando salário bruto e dias concedidos for um valor válido', async () => {
        const respostaEsperada = {
            status: 200,
            salarioBruto: 4000,
            diasConcedidos: 20,
        };

        const payload = {
            salarioBruto: 4000.00,
            diasConcedidos: 20,
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.salarioBruto).toBe(respostaEsperada.salarioBruto);
        expect(res.body.diasConcedidos).toBe(respostaEsperada.diasConcedidos);
    })

    test('Deve retornar 400 quando salário bruto for uma string', async () => {
        const respostaEsperada = {
            status: 400,
            salarioBruto: 'string',
        };

        const payload = {
            salarioBruto: 'string',
            diasConcedidos: 20,
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
    });

    test('Deve retornar 400 quando meses concedidos for uma string', async () => {
        const respostaEsperada = {
            status: 400,
            mesesConcedidos: 'string',
        };

        const payload = {
            salarioBruto: '2000.00',
            diasConcedidos: 'string',
        };

        const res = (await request(app).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
    });

    test('Deve retornar 400 quando o service lançar uma exceção', async () => {
        const mensagemErro = 'Falha inesperada no cálculo';

        let appComServiceQueLanca;
        jest.isolateModules(() => {
            jest.doMock('../../../src/Time_11(ETEC)/feriasService', () => ({
                calcularFerias: () => { throw new Error(mensagemErro); },
            }));
            appComServiceQueLanca = require('../../../src/app');
        });

        const payload = {
            salarioBruto: 4000.00,
            diasConcedidos: 20,
        };

        const res = (await request(appComServiceQueLanca).post('/ETEC11/ferias').send(payload));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual(mensagemErro);
    });

})
