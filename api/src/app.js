const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const etec1 = require('./Time_2(ETEC1)/etec1.route');
const exgRouter = require("./exg/exgApp");
const etec11Salario = require("./Time_11(ETEC)/routes/salario");
const etec11Ferias = require("./Time_11(ETEC)/routes/ferias");
const etec11Decimo = require("./Time_11(ETEC)/routes/decimoTerceiro");
const etec11Rescisao = require("./Time_11(ETEC)/routes/rescisao");
const etec11Health = require("./Time_11(ETEC)/routes/health");
const financeRouter = require("./financecar/financeApp");
const cltRouter = require("./clt/cltApp");
const flpRouter = require('./flp/flpApp');
const markup = require("./markup/markup.app");
const dasn = require("./Time_8(DASN)/dasn");
const mkpRouter = require("./mkp/app");
const piscina1 = require('./Time_10_piscina/app_piscina');
const susRoutes = require('./Time_16(SUS)/susRoutes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// checa se api no ar
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    by: "SLMM36",
    turma: "101",
  });
});

app.get("/api/tabelas", (req, res) => {
  const { TABELA, calcular } = require("./funcoes");
  res.json({
    success: true,
    data: {
      base: TABELA.BASE_CALC.faixas,
      referencia: `${TABELA.REFERENCIA * 100}%`,
    },
  });
});

// POST /api/calcular
app.post("/api/calcular", (req, res) => {
  try {
    const { TABELA, calcular } = require("./funcoes");
    const dados = req.body;
    console.log(dados);
    if (!dados || typeof dados !== "object") {
      return res.status(400).json({ error: "Corpo da requisição inválido" });
    }
    const resultado = calcular(dados);
    console.log(resultado);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Rotas Markup
app.use("/api/markup", markup);
// Rotas EXG
app.use("/api/exg", exgRouter);
app.use("/api/financecar", financeRouter);
// Rotas ETEC1
app.use("/ETEC1", etec1);

// Rotas ETEC11
app.use("/ETEC11/health", etec11Health);
app.use("/ETEC11/salario", etec11Salario);
app.use("/ETEC11/ferias", etec11Ferias);
app.use("/ETEC11/decimo-terceiro", etec11Decimo);
app.use("/ETEC11/rescisao", etec11Rescisao);

// Rotas CLT
app.use("/api/clt", cltRouter);
// Rotas FLP
app.use('/api/flp', flpRouter);
// Rotas DASN
app.use("/DASN", dasn);
// Rotas MKP
app.use("/MKP", mkpRouter);
// Rotas Piscina
app.use("/api/Time_10_piscina", piscina1);
// Rotas CD (compilado TS)
const cdRouter = require("./cdd/routes/dividendRouter").default;
app.use("/api/cdd", cdRouter);
// Rotas SUS - Calculadora de Sustentabilidade (Time 16)
app.use("/SUS", susRoutes);

module.exports = app;