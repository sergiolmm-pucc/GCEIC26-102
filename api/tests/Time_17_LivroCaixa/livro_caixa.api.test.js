const request = require('supertest');
const express = require('express');
const livrocaixaRouter = require('../../src/Time_17_LivroCaixa/livrocaixa');

const app = express();
app.use(express.json());
app.use('/livrocaixa', livrocaixaRouter);

describe('API Livro Caixa', () => {
    // Testes da API 1 (Livro Caixa Rural) 
    it('Calcula corretamente o livro caixa', async () => {
        const res = await request(app).post('/livrocaixa/calc-livro').send({
            receita: 50000, 
            despesa: 20000, 
            investimento: 5000
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.resultado).toBe(25000);
    });

    // Testes da API 2 (Prejuízo Acumulado)
    it('Calcula novo prejuizo acumulado', async () => {
        const res = await request(app).post('/livrocaixa/calc-preju').send({ 
            resultadoAno: 40000, 
            prejuizoAcumulado: 15000 
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.novoResultado).toBe(25000);
    });

    // Testes da API 3 (Limite de Arbitramento)
    it('Calcula limite de arbitramento em 20%', async () => {
        const res = await request(app).post('/livrocaixa/calc-arbitramento').send({
            receita: 100000
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.limite).toBe(20000);
    });
});