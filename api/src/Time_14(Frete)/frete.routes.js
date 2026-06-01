const express = require('express');

const {
    TIPOS_FRETE,
    ALIQUOTA_TIPOS_FRETE,
    calcularFreteCompleto
} = require('./frete.functions');

const router = express.Router();


// Health check da API
router.get('/health', (req, res) => {

    return res.status(200).json({
        status: 'ok',
        message: 'API de cálculo de frete está funcionando',
        timestamp: new Date().toISOString()
    });
});


// Endpoint principal para cotação do frete
router.post('/calcular', (req, res) => {

    try{

        const{
            comprimento,
            largura,
            altura,
            pesoReal,
            distanciaKm,
            tipoFrete,
            valorDeclarado,
            importado,
            segurado
        } = req.body;

        const valorCotacao = calcularFreteCompleto(
            comprimento,
            largura,
            altura,
            pesoReal,
            distanciaKm,
            tipoFrete,
            valorDeclarado,
            importado,
            segurado
        );

        return res.status(200).json({
            success: true,
            data: valorCotacao
        });

    } catch(err) {
        
        return res.status(400).json({
            success: false,
            error: err.message
        });

    }
});


router.get('/tipos', (req, res) => {
    const tipos = Object.values(TIPOS_FRETE).map((tipo) => {
        return {
            tipo,
            aliquota: ALIQUOTA_TIPOS_FRETE[tipo],
            aliquotaPercentual: `${ALIQUOTA_TIPOS_FRETE[tipo] * 100}%`
        };
    });

    return res.status(200).json({
        success: true,
        data: tipos
    });
});



module.exports = router;