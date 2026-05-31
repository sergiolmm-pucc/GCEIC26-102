const request = require('supertest');
const app = require('../../src/app');


describe('API - Health Check', () => {
    test('deve retornar status ok na rota /health', async () => {
        const response = await request(app).get('/api/frete/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});

describe('API - Frete', () => {
    describe('GET /api/frete/tipos', () => {
        test('deve retornar os tipos de frete com suas alíquotas', async () => {
            const response = await request(app).get('/api/frete/tipos');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data).toEqual([
                {
                    tipo: 'economico',
                    aliquota: 0.015,
                    aliquotaPercentual: '1.5%'
                },
                {
                    tipo: 'normal',
                    aliquota: 0.025,
                    aliquotaPercentual: '2.5%'
                },
                {
                    tipo: 'expresso',
                    aliquota: 0.04,
                    aliquotaPercentual: '4%'
                },
                {
                    tipo: 'urgente',
                    aliquota: 0.06,
                    aliquotaPercentual: '6%'
                }
            ]);
        });
    });

    describe('POST /api/frete/calcular', () => {
        test('deve calcular frete com importação e seguro', async () => {
            const response = await request(app)
                .post('/api/frete/calcular')
                .send({
                    comprimento: 40,
                    largura: 30,
                    altura: 20,
                    pesoReal: 8,
                    distanciaKm: 250,
                    tipoFrete: 'normal',
                    valorDeclarado: 1000,
                    importado: true,
                    segurado: true
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data).toEqual({
                pesoCubado: 2,
                pesoFaturado: 8,
                valorBase: 50,
                taxaImportacao: 150,
                taxaSeguro: 50,
                valorFinal: 250
            });
        });

        test('deve calcular frete sem importação e sem seguro', async () => {
            const response = await request(app)
                .post('/api/frete/calcular')
                .send({
                    comprimento: 40,
                    largura: 30,
                    altura: 20,
                    pesoReal: 8,
                    distanciaKm: 250,
                    tipoFrete: 'normal',
                    valorDeclarado: 1000,
                    importado: false,
                    segurado: false
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.valorBase).toBe(50);
            expect(response.body.data.taxaImportacao).toBe(0);
            expect(response.body.data.taxaSeguro).toBe(0);
            expect(response.body.data.valorFinal).toBe(50);
        });

        test('deve retornar erro 400 quando o tipo de frete for inválido', async () => {
            const response = await request(app)
                .post('/api/frete/calcular')
                .send({
                    comprimento: 40,
                    largura: 30,
                    altura: 20,
                    pesoReal: 8,
                    distanciaKm: 250,
                    tipoFrete: 'turbo',
                    valorDeclarado: 1000,
                    importado: true,
                    segurado: true
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Tipo de frete inválido!');
        });

        test('deve retornar erro 400 quando algum campo numérico obrigatório for inválido', async () => {
            const response = await request(app)
                .post('/api/frete/calcular')
                .send({
                    comprimento: -40,
                    largura: 30,
                    altura: 20,
                    pesoReal: 8,
                    distanciaKm: 250,
                    tipoFrete: 'normal',
                    valorDeclarado: 1000,
                    importado: true,
                    segurado: true
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Comprimento deve ser um valor positivo!');
        });

        test('deve retornar erro 400 quando valorDeclarado for inválido e produto for importado', async () => {
            const response = await request(app)
                .post('/api/frete/calcular')
                .send({
                    comprimento: 40,
                    largura: 30,
                    altura: 20,
                    pesoReal: 8,
                    distanciaKm: 250,
                    tipoFrete: 'normal',
                    valorDeclarado: 0,
                    importado: true,
                    segurado: false
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Valor Declarado deve ser um valor positivo!');
        });

        test('deve retornar erro 400 quando valorDeclarado for inválido e produto for segurado', async () => {
            const response = await request(app)
                .post('/api/frete/calcular')
                .send({
                    comprimento: 40,
                    largura: 30,
                    altura: 20,
                    pesoReal: 8,
                    distanciaKm: 250,
                    tipoFrete: 'normal',
                    valorDeclarado: 0,
                    importado: false,
                    segurado: true
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Valor Declarado deve ser um valor positivo!');
        });
    });
});