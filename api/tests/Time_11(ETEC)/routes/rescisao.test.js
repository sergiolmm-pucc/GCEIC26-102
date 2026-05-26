 request = require('supertest');
 app     = require('../../../src/app');
let respostaEsperada;
let payload;
let res;

describe('Teste do endpoint de cálculo da rescisão', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório',
        };

         payload = {
            salarioBruto: null,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for menor que zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser um número maior que zero',
        };

         payload = {
            salarioBruto: -1000.0,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando salário bruto for igual a zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto deve ser um número maior que zero',
        };

         payload = {
            salarioBruto: 0.0,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando data admissão for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Data de Admissão é obrigatória (formato: AAAA-MM-DD)',
        };

         payload = {
            salarioBruto: 2000.00,
            dataAdmissao: null, 
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando data rescisão for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Data de Rescisão é obrigatória (formato: AAAA-MM-DD)',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: null, 
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando tipo rescisão for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Tipo de Rescisão é obrigatório',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: null, 
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando dias trabalhados for nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Dias Trabalhados é obrigatório',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: null, 
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando dias trabalhados for menor que zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Dias Trabalhados deve ser um número entre 1 e 31',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: -1, 
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando dias trabalhados for igual a zero', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Dias Trabalhados deve ser um número entre 1 e 31',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 0, 
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });


    test('Deve retornar 400 quando dias trabalhados for maior que 31', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Dias Trabalhados deve ser um número entre 1 e 31',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 32, 
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando todos os argumentos forem nulo', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Salário Bruto é obrigatório', // Pega o primeiro erro e já da return
        };

         payload = {
            salarioBruto: null,
            dataAdmissao: null,
            dataRescisao: null, 
            tipoRescisao: null, 
            diasTrabalhados: null,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando tipo rescisão for um tipo inválido', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'tipoRescisao inválido. Use: ',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'tipoInvalido',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toContain(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando data admissão tiver formato inválido', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Data de Admissão inválida. Use o formato AAAA-MM-DD',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: 'data-invalida',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando data rescisão tiver formato inválido', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Data de Rescisão inválida. Use o formato AAAA-MM-DD',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: 'data-invalida',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando data rescisão for anterior à data admissão', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Data de Rescisão deve ser posterior à dataAdmissao',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-08-10',
            dataRescisao: '2025-06-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando data rescisão for igual à data admissão', async () => {
         respostaEsperada = {
            status: 400,
            erro: 'Data de Rescisão deve ser posterior à dataAdmissao',
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-06-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
        expect(res.body.erro).toStrictEqual(respostaEsperada.erro);
    });

    test('Deve retornar 400 quando o service lançar uma exceção', async () => {
         mensagemErro = 'Falha inesperada no cálculo';

        let appComServiceQueLanca;
        jest.isolateModules(() => {
            jest.doMock('../../../src/Time_11(ETEC)/services/rescisaoService', () => ({
                calcularRescisao: () => { throw new Error(mensagemErro); },
            }));
            appComServiceQueLanca = require('../../../src/app');
        });

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'semJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(appComServiceQueLanca).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual(mensagemErro);
    });

    test('Deve retornar 200 quando todos os dados forem válidos', async () => {
         respostaEsperada = {
            status: 200,
        };

         payload = {
            salarioBruto: 4000.00,
            dataAdmissao: '2025-06-10',
            dataRescisao: '2025-08-10',
            tipoRescisao: 'comJustaCausa',
            diasTrabalhados: 20,
        };

         res = (await request(app).post('/ETEC11/rescisao').send(payload));
        expect(res.statusCode).toBe(respostaEsperada.status);
    });
})
