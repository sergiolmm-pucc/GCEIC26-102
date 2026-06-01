const express = require('express');
const {
  calcularFolha,
  TABELA_INSS,
  TABELA_IRRF,
  IRRF_REDUTOR_2026,
  SALARIO_MINIMO,
  DEDUCAO_DEPENDENTE,
  FGTS_ALIQUOTA,
} = require('./flpFuncoes');

const router = express.Router();

const VALID_USER   = 'rh';
const VALID_PASS   = 'rh';
const STATIC_TOKEN = 'token-flp-2026';

router.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha)
    return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
  if (usuario === VALID_USER && senha === VALID_PASS)
    return res.json({ token: STATIC_TOKEN });
  res.status(401).json({ erro: 'Usuário ou senha inválidos' });
});

router.post('/auth', (req, res) => {
  const { token } = req.body;
  if (token === STATIC_TOKEN) return res.json({ token });
  res.status(401).json({ erro: 'Token inválido' });
});

router.get('/tabelas', (_req, res) => {
  const ultimaIRRF = TABELA_IRRF[TABELA_IRRF.length - 1];
  res.json({
    inss: {
      faixas:           TABELA_INSS.faixas,
      teto:             TABELA_INSS.teto,
    },
    irrf:               TABELA_IRRF.filter(f => f.ate !== Infinity).concat(
                          [{ ate: '> R$ 4.664,68', aliquota: ultimaIRRF.aliquota, deducao: ultimaIRRF.deducao }]
                        ),
    irrf_redutor_2026:  IRRF_REDUTOR_2026,
    salario_minimo:     SALARIO_MINIMO,
    deducao_dependente: DEDUCAO_DEPENDENTE,
    fgts_aliquota:      FGTS_ALIQUOTA,
  });
});

router.post('/calcular', (req, res) => {
  const { salarioBase, dependentes, horas50, horas100, token,
          custoVT, pgtVT, beneficioVA, pctDescontoVA, descontoVA,
          planoSaude, pgtPlanoSaude, diasFalta, horasAtraso, horaMes } = req.body;

  if (token !== STATIC_TOKEN)
    return res.status(401).json({ erro: 'Token inválido' });

  if (salarioBase === undefined || salarioBase === null)
    return res.status(400).json({ erro: 'Informe "salarioBase"' });

  if (typeof salarioBase !== 'number' || salarioBase <= 0)
    return res.status(400).json({ erro: '"salarioBase" deve ser um número positivo' });

  try {
    res.json(calcularFolha({
      salarioBase,
      dependentes:   dependentes   || 0,
      horas50:       horas50       || 0,
      horas100:      horas100      || 0,
      custoVT:       custoVT       || 0,
      pgtVT:         pgtVT         || 'clt',
      beneficioVA:   beneficioVA   || 0,
      pctDescontoVA: pctDescontoVA !== undefined ? pctDescontoVA : 20,
      descontoVA:    descontoVA    || 0,
      planoSaude:    planoSaude    || 0,
      pgtPlanoSaude: pgtPlanoSaude || 'funcionario',
      diasFalta:     diasFalta     || 0,
      horasAtraso:   horasAtraso   || 0,
      horaMes:       horaMes       || undefined,
    }));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;
