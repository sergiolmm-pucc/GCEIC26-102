const request = require('supertest');
const app = require('../../../src/app');

const PAYLOAD_BASE = {
    salarioBruto: 4000,
    dataAdmissao: '2025-06-10',
    dataRescisao: '2025-08-10',
    tipoRescisao: 'semJustaCausa',
    diasTrabalhados: 20,
};

async function post(payload) {
    return request(app).post('/ETEC11/rescisao').send(payload);
}

function payload(overrides) {
    return { ...PAYLOAD_BASE, ...overrides };
}

describe('Teste do endpoint de cálculo da rescisão', () => {
    test('Deve retornar 400 quando salário bruto for nulo', async () => {
        const res = await post(payload({ salarioBruto: null }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Salário Bruto é obrigatório');
    });

    test('Deve retornar 400 quando salário bruto for menor que zero', async () => {
        const res = await post(payload({ salarioBruto: -1000 }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Salário Bruto deve ser um número maior que zero');
    });

    test('Deve retornar 400 quando salário bruto for igual a zero', async () => {
        const res = await post(payload({ salarioBruto: 0 }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Salário Bruto deve ser um número maior que zero');
    });

    test('Deve retornar 400 quando data admissão for nulo', async () => {
        const res = await post(payload({ salarioBruto: 2000, dataAdmissao: null }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Data de Admissão é obrigatória (formato: AAAA-MM-DD)');
    });

    test('Deve retornar 400 quando data rescisão for nulo', async () => {
        const res = await post(payload({ salarioBruto: 4000, dataRescisao: null }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Data de Rescisão é obrigatória (formato: AAAA-MM-DD)');
    });

    test('Deve retornar 400 quando tipo rescisão for nulo', async () => {
        const res = await post(payload({ tipoRescisao: null }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Tipo de Rescisão é obrigatório');
    });

    test('Deve retornar 400 quando dias trabalhados for nulo', async () => {
        const res = await post(payload({ diasTrabalhados: null }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Dias Trabalhados é obrigatório');
    });

    test('Deve retornar 400 quando dias trabalhados for menor que zero', async () => {
        const res = await post(payload({ diasTrabalhados: -1 }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Dias Trabalhados deve ser um número entre 1 e 31');
    });

    test('Deve retornar 400 quando dias trabalhados for igual a zero', async () => {
        const res = await post(payload({ diasTrabalhados: 0 }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Dias Trabalhados deve ser um número entre 1 e 31');
    });

    test('Deve retornar 400 quando dias trabalhados for maior que 31', async () => {
        const res = await post(payload({ diasTrabalhados: 32 }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Dias Trabalhados deve ser um número entre 1 e 31');
    });

    test('Deve retornar 400 quando todos os argumentos forem nulo', async () => {
        const res = await post({ salarioBruto: null, dataAdmissao: null, dataRescisao: null, tipoRescisao: null, diasTrabalhados: null });
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Salário Bruto é obrigatório');
    });

    test('Deve retornar 400 quando tipo rescisão for um tipo inválido', async () => {
        const res = await post(payload({ tipoRescisao: 'tipoInvalido' }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toContain('tipoRescisao inválido. Use: ');
    });

    test('Deve retornar 400 quando data admissão tiver formato inválido', async () => {
        const res = await post(payload({ dataAdmissao: 'data-invalida' }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Data de Admissão inválida. Use o formato AAAA-MM-DD');
    });

    test('Deve retornar 400 quando data rescisão tiver formato inválido', async () => {
        const res = await post(payload({ dataRescisao: 'data-invalida' }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Data de Rescisão inválida. Use o formato AAAA-MM-DD');
    });

    test('Deve retornar 400 quando data rescisão for anterior à data admissão', async () => {
        const res = await post(payload({ dataAdmissao: '2025-08-10', dataRescisao: '2025-06-10' }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Data de Rescisão deve ser posterior à dataAdmissao');
    });

    test('Deve retornar 400 quando data rescisão for igual à data admissão', async () => {
        const res = await post(payload({ dataAdmissao: '2025-06-10', dataRescisao: '2025-06-10' }));
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual('Data de Rescisão deve ser posterior à dataAdmissao');
    });

    test('Deve retornar 400 quando o service lançar uma exceção', async () => {
        const mensagemErro = 'Falha inesperada no cálculo';
        let appComServiceQueLanca;
        jest.isolateModules(() => {
            jest.doMock('../../../src/Time_11(ETEC)/services/rescisaoService', () => ({
                calcularRescisao: () => { throw new Error(mensagemErro); },
            }));
            appComServiceQueLanca = require('../../../src/app');
        });
        const res = await request(appComServiceQueLanca).post('/ETEC11/rescisao').send(PAYLOAD_BASE);
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toStrictEqual(mensagemErro);
    });

    test('Deve retornar 200 quando todos os dados forem válidos', async () => {
        const res = await post(payload({ tipoRescisao: 'comJustaCausa' }));
        expect(res.statusCode).toBe(200);
    });
});