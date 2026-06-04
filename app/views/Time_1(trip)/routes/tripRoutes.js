const express = require('express');
const router = express.Router();

// 1. Endpoint de Custo de Combustível (Gasolina vs Álcool)
router.post('/cost', (req, res) => {
    const { distanceKm, autonomyKmL, priceGasoline, priceAlcohol } = req.body;

    if (!distanceKm || !autonomyKmL || !priceGasoline || !priceAlcohol) {
        return res.status(400).json({ error: 'Todos os parâmetros são necessários.' });
    }

    const litersNeeded = distanceKm / autonomyKmL;
    const totalGasoline = litersNeeded * priceGasoline;
    // O álcool rende em média 70% da gasolina, ajustando o consumo para o cálculo real
    const totalAlcohol = (distanceKm / (autonomyKmL * 0.7)) * priceAlcohol;

    return res.json({
        litersNeeded: parseFloat(litersNeeded.toFixed(2)),
        costGasoline: parseFloat(totalGasoline.toFixed(2)),
        costAlcohol: parseFloat(totalAlcohol.toFixed(2))
    });
});

// 2. Endpoint de Pedágios (Estimativa a cada 80km + valor fixo de R$ 12,00)
router.post('/tolls', (req, res) => {
    const { distanceKm } = req.body;

    // CORREÇÃO: Garante que o número 0 seja aceito como um parâmetro válido
    if (distanceKm === undefined || distanceKm === null) {
        return res.status(400).json({ error: 'Distância é necessária.' });
    }

    if (typeof distanceKm !== 'number' || distanceKm < 0) {
        return res.status(400).json({ error: 'A distância deve ser um número maior ou igual a zero.' });
    }

    // Define 1 pedágio a cada 80km rodados (mínimo de 1 se a viagem for maior que zero mas menor que 80, ou 0 se for zero)
    const tollCount = distanceKm > 0 ? Math.max(1, Math.floor(distanceKm / 80)) : 0;
    const pricePerToll = 12.00;
    const totalTollCost = tollCount * pricePerToll;

    return res.json({
        tollCount,
        pricePerToll,
        totalTollCost: parseFloat(totalTollCost.toFixed(2))
    });
});

// 3. Endpoint de Tempo Médio de Destino
router.post('/time', (req, res) => {
    const { distanceKm, averageSpeedKmH } = req.body;

    if (!distanceKm || !averageSpeedKmH) {
        return res.status(400).json({ error: 'Distância e velocidade média são necessárias.' });
    }

    const totalHours = distanceKm / averageSpeedKmH;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    return res.json({
        formattedTime: `${hours}h ${minutes}min`,
        hours,
        minutes
    });
});

module.exports = router;