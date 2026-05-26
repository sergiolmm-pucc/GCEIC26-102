// Tabela INSS 2026 - Portaria Interministerial MTP/ME
// Cálculo PROGRESSIVO por faixas (não alíquota única)
const FAIXAS_INSS_2026 = [
    { limite: 1621.00,  aliquota: 0.075 },
    { limite: 2902.84,  aliquota: 0.09  },
    { limite: 4354.27,  aliquota: 0.12  },
    { limite: 8475.55,  aliquota: 0.14  },
];

function calcularINSSProgressivo(salarioBruto) {
    let inssTotal = 0;
    let faixaAnterior = 0;

    for (const faixa of FAIXAS_INSS_2026) {
        if (salarioBruto <= 0) break;

        const base = Math.min(salarioBruto, faixa.limite) - faixaAnterior;
        if (base <= 0) break;

        inssTotal += base * faixa.aliquota;
        faixaAnterior = faixa.limite;

        if (salarioBruto <= faixa.limite) break;
    }

    return parseFloat(inssTotal.toFixed(2));
}

module.exports = { calcularINSSProgressivo };
