const { calcularRescisao } = require('../../../src/Time_11(ETEC)/services/rescisaoService');

describe('Teste do cálculo de rescisão', () => {
    test('Deve calcular a rescisão quando for sem justa causa', () => {
        const valorEsperado = {
            salarioBruto: 3000,
            tipoRescisao: 'semJustaCausa',
            anosCompletos: 3,
            saldoSalario: 2000,
            feriasProporcionais: 4000,
            decimoTerceiro: 1000,
            descontos: { inss: 248.60 },
            avisoPrevioIndenizado: 3900,
            observacaoFGTS: 'A empregada pode sacar FGTS (8%) + reserva indenizatória (3,2%) acumulados. O empregador NÃO paga multa de 40% na rescisão — esse valor já foi recolhido mensalmente via eSocial (LC 150/2015).',
            totalBruto: 10900,
            totalLiquido: 10651.40,
        };        
        const salarioBruto = 3000;
        const dataAdmissao = '2023-01-10';
        const dataRescisao = '2026-04-20';
        const tipoRescisao = 'semJustaCausa';
        const diasTrabalhados = 20;

        const res = calcularRescisao(
            salarioBruto, 
            dataAdmissao, 
            dataRescisao, 
            tipoRescisao, 
            diasTrabalhados);

        expect(res).toEqual(valorEsperado);
    })

    test('Deve calcular a rescisão quando for acordo comum', () => {
        const valorEsperado = {
            salarioBruto: 2500,
            tipoRescisao: 'acordoComum',
            anosCompletos: 1,
            saldoSalario: 416.67,
            feriasProporcionais: 3333.33,
            decimoTerceiro: 2500,
            descontos: { inss: 238.6 },
            avisoPrevioIndenizado: 1375,
            observacaoFGTS: 'A empregada pode sacar até 80% do FGTS. Reserva indenizatória: 20% do acumulado. Sem seguro-desemprego.',
            totalBruto: 7625,
            totalLiquido: 7386.4,
        };
        
        const salarioBruto = 2500;
        const dataAdmissao = '2024-06-01';
        const dataRescisao = '2026-05-05';
        const tipoRescisao = 'acordoComum';
        const diasTrabalhados = 5;

        const res = calcularRescisao(
            salarioBruto, 
            dataAdmissao, 
            dataRescisao, 
            tipoRescisao, 
            diasTrabalhados);

        expect(res).toEqual(valorEsperado);
    })

    test('Deve calcular a rescisão quando for pedido de demissão', () => {
        const valorEsperado = {
            salarioBruto: 1800,
            tipoRescisao: 'pedidoDemissao',
            anosCompletos: 1,
            saldoSalario: 900,
            feriasProporcionais: 2400,
            decimoTerceiro: 600,
            descontos: { inss: 112.5 },
            observacaoFGTS: 'Sem saque de FGTS. Reserva indenizatória retorna ao empregador.',
            totalBruto: 3900,
            totalLiquido: 3787.5,
        }

        const salarioBruto = 1800;
        const dataAdmissao = '2025-02-01';
        const dataRescisao = '2026-05-15';
        const tipoRescisao = 'pedidoDemissao';
        const diasTrabalhados = 15;

        const res = calcularRescisao(
            salarioBruto,
            dataAdmissao,
            dataRescisao,
            tipoRescisao,
            diasTrabalhados);

        expect(res).toEqual(valorEsperado);
    });

    test('Deve calcular a rescisão quando for com justa causa', () => {
        const valorEsperado = {
            salarioBruto: 2200,
            tipoRescisao: 'comJustaCausa',
            anosCompletos: 0,
            saldoSalario: 733.33,
            feriasProporcionais: 1955.56,
            decimoTerceiro: 1650,
            descontos: { inss: 190.18 },
            observacaoFGTS: 'Sem FGTS, sem aviso prévio, sem férias proporcionais. Apenas saldo de salário e férias vencidas (se houver).',
            totalBruto: 733.33,
            totalLiquido: 543.15,
        }

        const salarioBruto = 2200;
        const dataAdmissao = '2025-09-01';
        const dataRescisao = '2026-05-10';
        const tipoRescisao = 'comJustaCausa';
        const diasTrabalhados = 10;

        const res = calcularRescisao(
            salarioBruto,
            dataAdmissao,
            dataRescisao,
            tipoRescisao,
            diasTrabalhados);

        expect(res).toEqual(valorEsperado);
    })

    test('Não deve apliar regra de comJustaCausa para tipo desconhecido', () => {
        const salarioBruto = 2200;
        const dataAdmissao = '2025-09-01';
        const dataRescisao = '2026-05-10';
        const tipoRescisao = 'tipoInvalido';
        const diasTrabalhados = 10;

        const res = calcularRescisao(salarioBruto, dataAdmissao, dataRescisao, tipoRescisao, diasTrabalhados);

        expect(res).not.toHaveProperty('observacaoFGTS');
        expect(res.totalBruto).toBeUndefined();
    })
})
