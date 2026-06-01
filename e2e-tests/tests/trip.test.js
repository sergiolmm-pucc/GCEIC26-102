const request = require('supertest');
const express = require('express');
// Sobe um nível para 'api' e entra em 'routes'
const tripRoutes = require('../api/routes/tripRoutes');
const app = express();
app.use(express.json());
app.use('/api/v1/trip', tripRoutes);

describe('Testes Unitários - Módulo TRIP (Cálculo de Viagem)', () => {
    
    // ==========================================
    // TESTES DO ENDPOINT: /cost
    // ==========================================
    describe('POST /cost - Custo de Combustível', () => {
        test('Deve calcular o custo de combustível corretamente', async () => {
            const response = await request(app)
                .post('/api/v1/trip/cost')
                .send({
                    distanceKm: 200,
                    autonomyKmL: 10,
                    priceGasoline: 5.50,
                    priceAlcohol: 3.80
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.costGasoline).toBe(110.00); // (200/10) * 5.50[cite: 7]
            expect(response.body.costAlcohol).toBe(108.57);  // (200 / (10 * 0.7)) * 3.80
            expect(response.body.litersNeeded).toBe(20.00);
        });

        test('Deve retornar erro 400 se faltar algum parâmetro obrigatório', async () => {
            const response = await request(app)
                .post('/api/v1/trip/cost')
                .send({
                    distanceKm: 200
                    // faltando os outros parâmetros deliberadamente
                });
            
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    // ==========================================
    // TESTES DO ENDPOINT: /tolls
    // ==========================================
    describe('POST /tolls - Pedágios', () => {
        test('Deve calcular a quantidade e valor dos pedágios para longas distâncias', async () => {
            const response = await request(app)
                .post('/api/v1/trip/tolls')
                .send({ distanceKm: 160 });

            expect(response.statusCode).toBe(200);
            expect(response.body.tollCount).toBe(2);
            expect(response.body.totalTollCost).toBe(24.00);
        });

        test('Deve retornar pelo menos 1 pedágio se a distância for maior que zero mas menor que 80km', async () => {
            const response = await request(app)
                .post('/api/v1/trip/tolls')
                .send({ distanceKm: 40 });

            expect(response.statusCode).toBe(200);
            expect(response.body.tollCount).toBe(1); // Regra do Math.max(1, ...)[cite: 6]
            expect(response.body.totalTollCost).toBe(12.00);
        });

        test('Deve retornar 0 pedágios se a distância for exatamente 0', async () => {
            const response = await request(app)
                .post('/api/v1/trip/tolls')
                .send({ distanceKm: 0 });

            expect(response.statusCode).toBe(200);
            expect(response.body.tollCount).toBe(0);
            expect(response.body.totalTollCost).toBe(0.00);
        });

        test('Deve retornar erro 400 se a distância não for enviada', async () => {
            const response = await request(app)
                .post('/api/v1/trip/tolls')
                .send({}); // Corpo vazio

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Distância é necessária.');
        });

    });

    // ==========================================
    // TESTES DO ENDPOINT: /time
    // ==========================================
    describe('POST /time - Tempo de Viagem', () => {
        test('Deve calcular o tempo estimado de viagem', async () => {
            const response = await request(app)
                .post('/api/v1/trip/time')
                .send({ distanceKm: 180, averageSpeedKmH: 90 });

            expect(response.statusCode).toBe(200);
            expect(response.body.formattedTime).toBe('2h 0min');
        });

        test('Deve retornar erro 400 se a velocidade ou distância estiverem ausentes', async () => {
            const response = await request(app)
                .post('/api/v1/trip/time')
                .send({ distanceKm: 180 }); // faltando velocidade

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
