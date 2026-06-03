import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { calcularFolha } from "./flpFuncoes.js";
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Iniciando...");
console.log("Deu certo");
console.log("API_URL do env:", process.env.API_URL);
const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:3001";

app.get("/env.js", (req, res) => {
  res.type("application/javascript");
  res.send(`window.ENV = { API_URL: ${JSON.stringify(API_URL)} };`);
});

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.use(express.static(join(__dirname, "public")));
app.use("/public", express.static(join(__dirname, "public")));
app.use("/cdd", express.static(join(__dirname, "views/cdd")));
app.use("/ETEC11", express.static(join(__dirname, "views/Time_11(ETEC)")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/v1/trip', async (req, res) => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const backendUrl = `${API_URL}${req.originalUrl}`;
    const headers = { ...req.headers };
    delete headers.host;

    const opts = {
      method: req.method,
      headers,
    };

    if (!['GET', 'HEAD'].includes(req.method)) {
      // Se o body já foi parseado (JSON), reenvia como JSON
      opts.body = req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : undefined;
    }

    const response = await fetch(backendUrl, opts);

    // Repassa headers e status
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.status(response.status);
    const responseBody = await response.text();
    return res.send(responseBody);
  } catch (error) {
    console.error('Erro ao proxy para API Trip:', error);
    return res.status(502).json({ error: 'Erro ao conectar com o backend Trip.' });
  }
});
app.use('/livro-caixa', express.static(join(__dirname, 'views/Time_17_LivroCaixa')));
app.use( 
  session({
    secret: process.env.SESSION_SECRET || "domestic-worker-secret-2025",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  }),
);

const equipes = [
  { numero: 1, nome: "ETEC1", rota: "/ETEC1/splash" },
  { numero: 2, nome: "EXCHANGE", rota: "/exg" },
  { numero: 3, nome: "CDD", rota: "/cdd" },
  { numero: 4, nome: "CLT", rota: "/clt" },
  { numero: 5, nome: "Equipe-5", rota: "/equipe-5" },
  { numero: 6, nome: "FinanceCar", rota: "/financecar" },
  { numero: 7, nome: "Equipe-7", rota: "/equipe-7" },
  { numero: 8, nome: "DASN-SIMEI", rota: "/DASN" },
  { numero: 9, nome: "Equipe-9", rota: "/equipe-9" },
  { numero: 10, nome: "CalcPiscina", rota: "/piscina" },
  { numero: 11, nome: 'ETEC - Doméstica', rota: '/ETEC11' },
  { numero: 12, nome: "IDPJ", rota: "/IDPJ" },
  { numero: 13, nome: "FLP", rota: "/flp" },
  { numero: 14, nome: "Frete", rota: "/frete" },
  { numero: 15, nome: "MKP", rota: "/MKP" },
  { numero: 16, nome: "Sustentabilidade", rota: "/sus" },
  { numero: 17, nome: "Livro-Caixa-Rural", rota: "/livrocaixa" },
  { numero: 18, nome: "Markup", rota: "/markup" },
  { numero: 19, nome: "Equipe-1(TRIP)", rota: "/equipe-1" },
  { numero: 20, nome: "Equipe-20", rota: "/equipe-20" },
];

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/login");
}

app.get("/", (req, res) => {
  res.render("index", { equipes });
});

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login", { error: null });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    req.session.user = { username: "admin", nome: "Administrador" };
    return res.redirect("/calculo");
  }
  res.render("login", { error: "Usuário ou senha inválidos" });
});

app.get("/calculo", requireAuth, (req, res) => {
  res.render("calculo", { user: req.session.user });
});

app.post("/calcular", requireAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    console.log("passou 1");
    const response = await fetch(`${API_URL}/api/calcular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    console.log("passou 1a");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// -- Time_2 ETEC1 --
function requireAuthETEC1(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/ETEC1/login");
}

app.get("/ETEC1/splash", (req, res) => res.render("Time_2(ETEC1)/splash"));
app.get("/ETEC1/login", (req, res) =>
  res.render("Time_2(ETEC1)/login", { erro: null }),
);
app.post("/ETEC1/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === "admin" && senha === "1234") {
    req.session.user = { username: usuario };
    return res.redirect("/ETEC1/calculo");
  }
  res.render("Time_2(ETEC1)/login", { erro: "Usuário ou senha inválidos." });
});
app.get("/ETEC1/calculo", requireAuthETEC1, (req, res) =>
  res.render("Time_2(ETEC1)/calculo"),
);
app.get("/ETEC1/sobre", requireAuthETEC1, (req, res) =>
  res.render("Time_2(ETEC1)/sobre"),
);
app.get("/ETEC1/help", requireAuthETEC1, (req, res) =>
  res.render("Time_2(ETEC1)/help"),
);
app.get("/ETEC1/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/ETEC1/login");
  });
});
app.post("/ETEC1/:rota", requireAuthETEC1, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/ETEC1/${req.params.rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -- Rotas EXG --
function requireExgAuth(req, res, next) {
  if (req.session && req.session.exgUser) return next();
  res.redirect("/exg/login");
}

app.get("/exg", (req, res) => {
  res.render("exg/splash");
});

app.get("/exg/login", (req, res) => {
  if (req.session.exgUser) return res.redirect("/exg/dashboard");
  res.render("exg/login", { error: null });
});

app.post("/exg/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render("exg/login", { error: "Preencha todos os campos" });
  if (username === "adm" && password === "adm") {
    req.session.exgUser = { username: "adm", nome: "Administrador" };
    return res.redirect("/exg/dashboard");
  }
  res.render("exg/login", { error: "Usuário ou senha invalidos" });
});

app.get("/exg/logout", (req, res) => {
  req.session.exgUser = null;
  res.redirect("/exg/login");
});

app.get("/exg/dashboard", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.render("exg/dashboard", { user: req.session.exgUser, currencies });
  } catch (err) {
    res.render("exg/dashboard", { user: req.session.exgUser, currencies: [] });
  }
});

app.get("/exg/exchange", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.render("exg/exchange", {
      user: req.session.exgUser,
      currencies,
      preselected: req.query.currency || "",
    });
  } catch (err) {
    res.render("exg/exchange", {
      user: req.session.exgUser,
      currencies: [],
      preselected: req.query.currency || "",
    });
  }
});

app.post("/exg/exchange", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const payload = {
      ...req.body,
      token: "token-simulado-123",
      value: Number.parseFloat(req.body.value),
    };
    const response = await fetch(`${API_URL}/api/exg/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/exg/currencies", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.json(currencies);
  } catch (err) {
    res.status(503).json([]);
  }
});

app.get("/exg/about", requireExgAuth, (req, res) => {
  res.render("exg/about", { user: req.session.exgUser });
});

app.get("/exg/help", requireExgAuth, (req, res) => {
  res.render("exg/help", { user: req.session.exgUser });
});

// -- Rotas FINANCECAR (Time 6) --
function requireFinanceAuth(req, res, next) {
  if (req.session && req.session.financeUser) return next();
  res.redirect("/financecar/login");
}

app.get("/financecar", (req, res) => {
  res.render("financecar/splash");
});

app.get("/financecar/login", (req, res) => {
  if (req.session.financeUser) return res.redirect("/financecar/home");
  res.render("financecar/login", { error: null });
});

app.post("/financecar/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render("financecar/login", {
      error: "Preencha todos os campos",
    });
  if (username === "adm" && password === "adm") {
    req.session.financeUser = { username: "adm", nome: "Administrador" };
    return res.redirect("/financecar/home");
  }
  res.render("financecar/login", { error: "Usuário ou senha inválidos" });
});

app.get("/financecar/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    return res.redirect("/financecar/login");
  });
});

app.get("/financecar/home", requireFinanceAuth, (req, res) => {
  res.render("financecar/home", { user: req.session.financeUser });
});
app.get("/financecar/juros", requireFinanceAuth, (req, res) => {
  res.render("financecar/juros", { user: req.session.financeUser });
});
app.get("/financecar/financiamento", requireFinanceAuth, (req, res) => {
  res.render("financecar/financiamento", { user: req.session.financeUser });
});
app.get("/financecar/fundo", requireFinanceAuth, (req, res) => {
  res.render("financecar/fundo", { user: req.session.financeUser });
});
app.get("/financecar/regra", requireFinanceAuth, (req, res) => {
  res.render("financecar/regra", { user: req.session.financeUser });
});
app.get("/financecar/sobre", requireFinanceAuth, (req, res) => {
  res.render("financecar/sobre", { user: req.session.financeUser });
});

app.post("/api/financecar/juros", requireFinanceAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/financecar/juros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(
  "/api/financecar/financiamento",
  requireFinanceAuth,
  async (req, res) => {
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(`${API_URL}/api/financecar/financiamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

app.post("/api/financecar/fundo", requireFinanceAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/financecar/fundo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/api/financecar/regra", requireFinanceAuth, async (req, res) => {
  console.log("ENTROU NA API REGRA");
  console.log("API_URL =", API_URL);
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/financecar/regra`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    console.log("STATUS =", response.status);
    console.log("URL =", response.url);
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

//======================
// -- Time_10 Piscina --
function requirePiscinaAuth(req, res, next) {
  if (req.session && req.session.piscinaUser) return next();
  res.redirect("/piscina/login");
}

app.get("/piscina", (req, res) => {
  res.render("Time_10_Piscina/splash");
});

app.get("/piscina/login", (req, res) => {
  if (req.session.piscinaUser) return res.redirect("/piscina/calculo");
  res.render("Time_10_Piscina/login", { error: null });
});

app.post("/piscina/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    req.session.piscinaUser = username;
    return res.redirect("/piscina/calculo");
  }
  res.render("Time_10_Piscina/login", { error: "Usuário ou senha inválidos" });
});

app.get("/piscina/calculo", requirePiscinaAuth, (req, res) => {
  res.render("Time_10_Piscina/calculo", { resultado: null });
});

app.post("/piscina/calculo", requirePiscinaAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${API_URL}/api/Time_10_piscina/calcular-total`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comprimento: Number(req.body.comprimento),
          largura: Number(req.body.largura),
          profundidade: Number(req.body.profundidade),
          temIluminacao: req.body.temIluminacao === "on",
        }),
      },
    );

    const resultado = await response.json();

    res.render("Time_10_Piscina/calculo", { resultado });
  } catch (error) {
    console.log(error);
    res.render("Time_10_Piscina/calculo", { resultado: null });
  }
});

app.get("/piscina/sobre", requirePiscinaAuth, (req, res) => {
  res.render("Time_10_Piscina/sobre");
});
app.get("/piscina/help", requirePiscinaAuth, (req, res) => {
  res.render("Time_10_Piscina/help");
});
app.get("/piscina/logout", (req, res) => {
  req.session.piscinaUser = null;
  res.redirect("/piscina/login");
});
//========================

// -- Rota CDD (React compilado) --
app.get("/cdd", (req, res) => {
  res.sendFile(join(__dirname, "views/cdd/index.html"));
});

// -- Rotas MKP --
app.get("/MKP", (req, res) => {
  res.render("mkp/mkp");
});

// -- Time 17 (Livro Caixa Rural) --
app.get('/livro-caixa', (req, res) => {
  res.sendFile(join(__dirname, 'views/Time_17_LivroCaixa', 'index.html'));
});

async function proxyMkpToApi(path, req, res) {
  try {
    const target = `${API_URL}${path}`;
    const fetchRes = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await fetchRes.text();
    res.status(fetchRes.status).type("application/json").send(data);
  } catch (err) {
    console.error("Proxy error", err);
    res
      .status(500)
      .json({ error: "Erro ao encaminhar a requisição para a API." });
  }
}

app.post("/MKP/markup", (req, res) => proxyMkpToApi("/MKP/markup", req, res));
app.post("/MKP/custos", (req, res) => proxyMkpToApi("/MKP/custos", req, res));
app.post("/MKP/preco-venda", (req, res) =>
  proxyMkpToApi("/MKP/preco-venda", req, res),
);

// -- Rotas CLT --
function requireCltAuth(req, res, next) {
  if (req.session && req.session.cltUser) return next();
  res.redirect("/clt/login");
}

app.get("/clt", (_req, res) => {
  res.render("clt/splash");
});

app.get("/clt/login", (req, res) => {
  if (req.session.cltUser) return res.redirect("/clt/dashboard");
  res.render("clt/login", { error: null });
});

app.post("/clt/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "").trim();
  if (!username || !password)
    return res.render("clt/login", { error: "Preencha usuário e senha" });
  if (username === "admin" && password === "admin") {
    req.session.cltUser = { username: "admin", nome: "Administrador" };
    return res.redirect("/clt/dashboard");
  }
  return res.render("clt/login", { error: "Usuário ou senha inválidos" });
});

app.get("/clt/logout", (req, res) => {
  req.session.cltUser = null;
  res.redirect("/clt/login");
});

app.get("/clt/dashboard", requireCltAuth, (req, res) => {
  res.render("clt/dashboard", { user: req.session.cltUser });
});
app.get("/clt/calculadora", requireCltAuth, (req, res) => {
  res.render("clt/calculadora", { user: req.session.cltUser });
});

app.post("/clt/calcular", requireCltAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const payload = { ...req.body, token: "token-clt-empresarial-123" };
    const response = await fetch(`${API_URL}/api/clt/resultado-contratacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(400).json({ success: false, erro: err.message });
  }
});

app.get("/clt/about", requireCltAuth, (req, res) => {
  res.render("clt/about", { user: req.session.cltUser });
});
app.get("/clt/help", requireCltAuth, (req, res) => {
  res.render("clt/help", { user: req.session.cltUser });
});

// -- Rotas FLP (Time 13) --
function requireFlpAuth(req, res, next) {
  if (req.session && req.session.flpUser) return next();
  res.redirect("/flp/login");
}

const funcionarios = [];
let nextId = 1;

app.get("/flp", (req, res) => {
  res.render("flp/splash");
});

app.get("/flp/login", (req, res) => {
  if (req.session.flpUser) return res.redirect("/flp/dashboard");
  res.render("flp/login", { error: null });
});

app.post("/flp/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render("flp/login", { error: "Preencha todos os campos" });
  if (username === "rh" && password === "1234") {
    req.session.flpUser = { username: "rh", nome: "Depto. Pessoal" };
    return res.redirect("/flp/dashboard");
  }
  res.render("flp/login", { error: "Usuário ou senha inválidos" });
});

app.get("/flp/logout", (req, res) => {
  req.session.flpUser = null;
  res.redirect("/flp/login");
});

app.get("/flp/dashboard", requireFlpAuth, (req, res) => {
  res.render("flp/dashboard", { user: req.session.flpUser });
});

app.get("/flp/tabelas", requireFlpAuth, (req, res) => {
  res.json({
    inss: {
      faixas: [
        { ate: 1621.00, aliquota: 0.075 },
        { ate: 2902.84, aliquota: 0.090 },
        { ate: 4354.27, aliquota: 0.120 },
        { ate: 8475.55, aliquota: 0.140 },
      ],
      teto: 988.09,
    },
    irrf: [
      { ate: 2428.80, aliquota: 0,     deducao: 0      },
      { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
      { ate: 3751.05, aliquota: 0.150, deducao: 394.16 },
      { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
      { ate: '> R$ 4.664,68', aliquota: 0.275, deducao: 908.73 },
    ],
    irrf_redutor_2026: {
      limite_isencao: 5000.00,
      limite_reducao: 7350.00,
      reducao_maxima: 312.89,
    },
    salario_minimo:     1621.00,
    deducao_dependente: 189.59,
    fgts_aliquota:      0.08,
  });
});

app.get("/flp/calculo", requireFlpAuth, (req, res) => {
  res.render("flp/calculo", { user: req.session.flpUser });
});

app.post("/flp/calcular", requireFlpAuth, (req, res) => {
  try {
    const dados = {
      salarioBase: parseFloat(req.body.salarioBase),
      dependentes: parseInt(req.body.dependentes) || 0,
      horas50:     parseFloat(req.body.horas50) || 0,
      horas100:    parseFloat(req.body.horas100) || 0,
      horaMes:     parseInt(req.body.horaMes) || 220,
      custoVT:       parseFloat(req.body.custoVT) || 0,
      pgtVT:         req.body.pgtVT || "clt",
      beneficioVA:   parseFloat(req.body.beneficioVA) || 0,
      pctDescontoVA: parseFloat(req.body.pctDescontoVA) !== undefined ? parseFloat(req.body.pctDescontoVA) : 20,
      planoSaude:    parseFloat(req.body.planoSaude) || 0,
      pgtPlanoSaude: req.body.pgtPlanoSaude || "funcionario",
      diasFalta:     parseFloat(req.body.diasFalta) || 0,
      horasAtraso:   parseFloat(req.body.horasAtraso) || 0,
    };
    const data = calcularFolha(dados);
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, erro: err.message });
  }
});

app.get("/flp/funcionarios", requireFlpAuth, (req, res) => {
  res.render("flp/funcionarios", {
    user: req.session.flpUser,
    funcionarios,
    editando: null,
    erro: null,
  });
});

app.get("/flp/funcionarios/:id/editar", requireFlpAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const f = funcionarios.find((f) => f.id === id);
  if (!f) return res.redirect("/flp/funcionarios");
  res.render("flp/funcionarios", {
    user: req.session.flpUser,
    funcionarios,
    editando: f,
    erro: null,
  });
});

app.post("/flp/funcionarios/:id/atualizar", requireFlpAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = funcionarios.findIndex((f) => f.id === id);
  if (idx === -1) return res.redirect("/flp/funcionarios");
  const {
    nome,
    cargo,
    salarioBase,
    custoVT,
    pgtVT,
    beneficioVA,
    pctDescontoVA,
    planoSaude,
    pgtPlanoSaude,
    horas50,
    horas100,
    diasFalta,
    horasAtraso,
    jornadaMensal,
  } = req.body;
  const sal = parseFloat(salarioBase);
  if (!nome || !cargo || isNaN(sal) || sal <= 0) {
    return res.render("flp/funcionarios", {
      user: req.session.flpUser,
      funcionarios,
      editando: funcionarios[idx],
      erro: "Preencha nome, cargo e salário válido.",
    });
  }
  funcionarios[idx] = {
    ...funcionarios[idx],
    nome: nome.trim(),
    cargo: cargo.trim(),
    salarioBase: sal,
    jornadaMensal: parseInt(jornadaMensal) || 220,
    horas50: parseFloat(horas50) || 0,
    horas100: parseFloat(horas100) || 0,
    diasFalta: parseFloat(diasFalta) || 0,
    horasAtraso: parseFloat(horasAtraso) || 0,
    custoVT: parseFloat(custoVT) || 0,
    pgtVT: pgtVT || "clt",
    beneficioVA: parseFloat(beneficioVA) || 0,
    pctDescontoVA: parseInt(pctDescontoVA) || 20,
    planoSaude: parseFloat(planoSaude) || 0,
    pgtPlanoSaude: pgtPlanoSaude || "funcionario",
  };
  res.redirect("/flp/funcionarios");
});

app.post("/flp/funcionarios", requireFlpAuth, (req, res) => {
  const {
    nome,
    cargo,
    salarioBase,
    custoVT,
    pgtVT,
    beneficioVA,
    pctDescontoVA,
    planoSaude,
    pgtPlanoSaude,
    horas50,
    horas100,
    diasFalta,
    horasAtraso,
    jornadaMensal,
  } = req.body;
  const sal = parseFloat(salarioBase);
  if (!nome || !cargo || isNaN(sal) || sal <= 0) {
    return res.render("flp/funcionarios", {
      user: req.session.flpUser,
      funcionarios,
      erro: "Preencha nome, cargo e salário válido.",
      editando: null,
    });
  }
  funcionarios.push({
    id: nextId++,
    nome: nome.trim(),
    cargo: cargo.trim(),
    salarioBase: sal,
    dependentes: 0,
    jornadaMensal: parseInt(jornadaMensal) || 220,
    horas50: parseFloat(horas50) || 0,
    horas100: parseFloat(horas100) || 0,
    diasFalta: parseFloat(diasFalta) || 0,
    horasAtraso: parseFloat(horasAtraso) || 0,
    custoVT: parseFloat(custoVT) || 0,
    pgtVT: pgtVT || "clt",
    beneficioVA: parseFloat(beneficioVA) || 0,
    pctDescontoVA: parseInt(pctDescontoVA) || 20,
    planoSaude: parseFloat(planoSaude) || 0,
    pgtPlanoSaude: pgtPlanoSaude || "funcionario",
  });
  res.redirect("/flp/funcionarios");
});

app.post("/flp/funcionarios/:id/remover", requireFlpAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = funcionarios.findIndex((f) => f.id === id);
  if (idx !== -1) funcionarios.splice(idx, 1);
  res.redirect("/flp/funcionarios");
});

app.get("/flp/folha", requireFlpAuth, (req, res) => {
  if (funcionarios.length === 0)
    return res.render("flp/folha", {
      user: req.session.flpUser,
      resultados: [],
    });
  try {
    const resultados = funcionarios.map((f) => {
      const holerite = calcularFolha({
        salarioBase:   f.salarioBase,
        dependentes:   f.dependentes,
        horaMes:       f.jornadaMensal || 220,
        horas50:       f.horas50,
        horas100:      f.horas100,
        custoVT:       f.custoVT || 0,
        pgtVT:         f.pgtVT || "clt",
        beneficioVA:   f.beneficioVA || 0,
        pctDescontoVA: f.pctDescontoVA !== undefined ? f.pctDescontoVA : 20,
        planoSaude:    f.planoSaude || 0,
        pgtPlanoSaude: f.pgtPlanoSaude || "funcionario",
        diasFalta:     f.diasFalta || 0,
        horasAtraso:   f.horasAtraso || 0,
      });
      return { funcionario: f, holerite };
    });
    res.render("flp/folha", { user: req.session.flpUser, resultados });
  } catch (err) {
    res.redirect("/flp/funcionarios");
  }
});

app.get("/flp/about", requireFlpAuth, (req, res) => {
  res.render("flp/about", { user: req.session.flpUser });
});
app.get("/flp/help", requireFlpAuth, (req, res) => {
  res.render("flp/help", { user: req.session.flpUser });
});

// Time_8 DASN-SIMEI 
function requireAuthDASN(req, res, next) {
  if (req.session && req.session.dasnUser) return next();
  res.redirect("/DASN/login");
}

app.get("/DASN", (req, res) => res.render("Time_8(DASN)/splash"));
app.get("/DASN/login", (req, res) => res.render("Time_8(DASN)/login", { erro: null }));
app.post("/DASN/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === "admin" && senha === "1234") {
    req.session.dasnUser = { username: usuario };
    return res.redirect("/DASN/calculo");
  }
  res.render("Time_8(DASN)/login", { erro: "Usuário ou senha inválidos." });
});

app.get("/DASN/calculo", requireAuthDASN, (req, res) => res.render("Time_8(DASN)/calculo"));
app.get("/DASN/sobre", requireAuthDASN, (req, res) => res.render("Time_8(DASN)/sobre"));
app.get("/DASN/help", requireAuthDASN, (req, res) => res.render("Time_8(DASN)/help"));
app.get("/DASN/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/DASN/login"));
});

app.post("/DASN/:rota", requireAuthDASN, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/DASN/${req.params.rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -- Time_12 IDPJ --
function requireAuthIDPJ(req, res, next) {
  if (req.session && req.session.idpjUser) return next();
  res.redirect("/IDPJ/login");
}

app.get("/IDPJ", (req, res) => res.render("Time_12(IDPJ)/splash"));
app.get("/IDPJ/login", (req, res) => {
  if (req.session.idpjUser) return res.redirect("/IDPJ/calculo");
  res.render("Time_12(IDPJ)/login", { erro: null });
});
app.post("/IDPJ/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    req.session.idpjUser = { username: "admin", nome: "Administrador" };
    return res.redirect("/IDPJ/calculo");
  }
  res.render("Time_12(IDPJ)/login", { erro: "Usuario ou senha invalidos." });
});
app.get("/IDPJ/calculo", requireAuthIDPJ, (req, res) =>
  res.render("Time_12(IDPJ)/calculo", { user: req.session.idpjUser }),
);
app.get("/IDPJ/sobre", requireAuthIDPJ, (req, res) =>
  res.render("Time_12(IDPJ)/sobre", { user: req.session.idpjUser }),
);
app.get("/IDPJ/help", requireAuthIDPJ, (req, res) =>
  res.render("Time_12(IDPJ)/help", { user: req.session.idpjUser }),
);
app.get("/IDPJ/logout", (req, res) => {
  req.session.idpjUser = null;
  res.redirect("/IDPJ/login");
});
app.post("/IDPJ/:rota", requireAuthIDPJ, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/IDPJ/${req.params.rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(400).json({ success: false, erro: err.message });
  }
});

// -- Rotas Markup --
function requireMarkupAuth(req, res, next) {
  if (req.session && req.session.markupUser) return next();
  res.redirect("/markup/login");
}

app.get("/markup", (req, res) => {
  res.render("markup/splash", { user: req.session.markupUser || null });
});

app.get("/markup/login", (req, res) => {
  if (req.session.markupUser) return res.redirect("/markup/dashboard");
  res.render("markup/login", { error: null, user: null });
});

app.post("/markup/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render("markup/login", {
      error: "Preencha todos os campos",
      user: null,
    });
  if (username === "admin" && password === "admin") {
    req.session.markupUser = { username: "admin", nome: "Administrador" };
    return res.redirect("/markup/dashboard");
  }
  res.render("markup/login", {
    error: "Usuário ou senha inválidos",
    user: null,
  });
});

app.get("/markup/logout", (req, res) => {
  req.session.markupUser = null;
  res.redirect("/markup/login");
});

app.get("/markup/dashboard", requireMarkupAuth, (req, res) => {
  res.render("markup/calculo", {
    user: req.session.markupUser,
    tipo: "preco-venda",
  });
});
app.get("/markup/preco-venda", requireMarkupAuth, (req, res) => {
  res.render("markup/calculo", {
    user: req.session.markupUser,
    tipo: "preco-venda",
  });
});
app.get("/markup/margem-lucro", requireMarkupAuth, (req, res) => {
  res.render("markup/margemLucro", {
    user: req.session.markupUser,
    tipo: "margem-lucro",
  });
});
app.get("/markup/desconto", requireMarkupAuth, (req, res) => {
  res.render("markup/desconto", {
    user: req.session.markupUser,
    tipo: "desconto",
  });
});
app.get("/markup/markup-multiplicador", requireMarkupAuth, (req, res) => {
  res.render("markup/calcularMarkupMultiplicador", {
    user: req.session.markupUser,
    tipo: "markup-multiplicador",
  });
});
app.get("/markup/sobre", requireMarkupAuth, (req, res) => {
  res.render("markup/sobre", { user: req.session.markupUser });
});
app.get("/markup/help", requireMarkupAuth, (req, res) => {
  res.render("markup/help", { user: req.session.markupUser });
});

app.post("/markup/calcularPrecoVenda", requireMarkupAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/markup/calcularPrecoVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/markup/calcularDesconto", requireMarkupAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/markup/calcularDesconto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post(
  "/markup/calcularMarkupMultiplicador",
  requireMarkupAuth,
  async (req, res) => {
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(
        `${API_URL}/api/markup/calcularMarkupMultiplicador`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        },
      );
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);
app.get("/equipe-1", (req, res) => {
  res.render("Time_1(trip)/trip");
});

// Time 17 Livro Caixa
function requireAuthLivroCaixa(req, res, next) {
  if (req.session && req.session.livroCaixaUser) return next();
  res.redirect("/livrocaixa/login");
}

app.get("/livrocaixa", (req, res) => res.render("Time_17_LivroCaixa/splash"));
app.get("/livrocaixa/login", (req, res) => res.render("Time_17_LivroCaixa/login", { erro: null }));
app.post("/livrocaixa/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === "admin" && senha === "1234") {
    req.session.livroCaixaUser = { username: usuario };
    return res.redirect("/livrocaixa/calculo");
  }
  res.render("Time_17_LivroCaixa/login", { erro: "Usuário ou senha inválidos." });
});

app.get("/livrocaixa/calculo", requireAuthLivroCaixa, (req, res) => res.render("Time_17_LivroCaixa/calculo"));
app.get("/livrocaixa/sobre", requireAuthLivroCaixa, (req, res) => res.render("Time_17_LivroCaixa/sobre"));
app.get("/livrocaixa/help", requireAuthLivroCaixa, (req, res) => res.render("Time_17_LivroCaixa/help"));
app.get("/livrocaixa/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/livrocaixa/login"));
});

app.post("/livrocaixa/:rota", requireAuthLivroCaixa, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/livrocaixa/${req.params.rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -- Time_16 SUS - Calculadora de Sustentabilidade --
function requireSusAuth(req, res, next) {
  if (req.session && req.session.susUser) return next();
  res.redirect("/sus/login");
}

async function chamarApiSus(rota, body) {
  const fetch = (await import("node-fetch")).default;
  const r = await fetch(`${API_URL}/SUS/${rota}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

app.get("/sus", (req, res) => res.render("Time_16(SUS)/splash"));

app.get("/sus/login", (req, res) => {
  if (req.session.susUser) return res.redirect("/sus/dashboard");
  res.render("Time_16(SUS)/login", { erro: null });
});

app.post("/sus/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === "admin" && senha === "admin") {
    req.session.susUser = { username: usuario };
    return res.redirect("/sus/dashboard");
  }
  res.render("Time_16(SUS)/login", { erro: "Usuario ou senha invalidos." });
});

app.get("/sus/logout", (req, res) => {
  req.session.susUser = null;
  res.redirect("/sus/login");
});

app.get("/sus/dashboard", requireSusAuth, (req, res) => {
  res.render("Time_16(SUS)/dashboard");
});

app.get("/sus/transporte", requireSusAuth, (req, res) => {
  res.render("Time_16(SUS)/transporte", { resultado: null });
});

app.post("/sus/transporte", requireSusAuth, async (req, res) => {
  try {
    const data = await chamarApiSus("emissao-transporte", {
      transporte: req.body.transporte,
      km: Number(req.body.km),
    });
    res.render("Time_16(SUS)/transporte", { resultado: data });
  } catch (err) {
    res.render("Time_16(SUS)/transporte", {
      resultado: { success: false, error: err.message },
    });
  }
});

app.get("/sus/pegada", requireSusAuth, (req, res) => {
  res.render("Time_16(SUS)/pegada", { resultado: null });
});

app.post("/sus/pegada", requireSusAuth, async (req, res) => {
  try {
    const kmPorTransporte = {
      carro_gasolina: Number(req.body.km_carro_gasolina) || 0,
      onibus:         Number(req.body.km_onibus) || 0,
      metro:          Number(req.body.km_metro) || 0,
      moto:           Number(req.body.km_moto) || 0,
      aviao:          Number(req.body.km_aviao) || 0,
    };
    const data = await chamarApiSus("pegada-mensal", {
      kmPorTransporte,
      energiaKwh:  Number(req.body.energiaKwh) || 0,
      pessoasCasa: Number(req.body.pessoasCasa) || 1,
      dieta:       req.body.dieta || "mista",
    });
    res.render("Time_16(SUS)/pegada", { resultado: data });
  } catch (err) {
    res.render("Time_16(SUS)/pegada", {
      resultado: { success: false, error: err.message },
    });
  }
});

app.get("/sus/arvores", requireSusAuth, (req, res) => {
  res.render("Time_16(SUS)/arvores", {
    resultado: null,
    kgPre: req.query.kg || "",
  });
});

app.post("/sus/arvores", requireSusAuth, async (req, res) => {
  try {
    const data = await chamarApiSus("compensacao-arvores", {
      kg_co2: Number(req.body.kg_co2),
    });
    res.render("Time_16(SUS)/arvores", { resultado: data, kgPre: req.body.kg_co2 });
  } catch (err) {
    res.render("Time_16(SUS)/arvores", {
      resultado: { success: false, error: err.message },
      kgPre: req.body.kg_co2,
    });
  }
});

app.get("/sus/sobre", requireSusAuth, (req, res) => {
  res.render("Time_16(SUS)/sobre");
});

app.get("/sus/help", requireSusAuth, (req, res) => {
  res.render("Time_16(SUS)/help");
});

// Endpoints dinâmicos equipe-5 a equipe-20
for (let i = 5; i <= 20; i++) {
  if (i === 12) continue;
  app.get(`/equipe-${i}`, (req, res) => {
    console.log(`/equipe-${i}/equipe`);
    res.render(`equipe`, { numero: i, nome: `Equipe-${i}` });
  });
}

// -- Time_11(ETEC) - Encargos Trabalhistas Empregada Doméstica --
app.get("/ETEC11", (req, res) => {
  res.sendFile(join(__dirname, "views/Time_11(ETEC)/index.html"));
});
app.get("/ETEC11/*path", (req, res) => {
  res.sendFile(join(__dirname, "views/Time_11(ETEC)/index.html"));
});

const ETEC11_ROTAS = ['salario', 'ferias', 'decimo-terceiro', 'rescisao'];
ETEC11_ROTAS.forEach(rota => {
  app.post(`/ETEC11/calcular/${rota}`, async (req, res) => {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${API_URL}/ETEC11/${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(400).json({ success: false, erro: err.message });
    }
  });
});

// ------------------ Rotas Time 14 - Frete ------------------------

function requireFreteAuth(req, res, next) {
  if (req.session && req.session.freteUser) {
    return next();
  }

  return res.redirect("/frete/login");
}

// Rota de entrada
app.get("/frete", (req, res) => {
  if (req.session && req.session.freteUser) {
    return res.redirect("/frete/home");
  }

  return res.redirect("/frete/login");
});

app.get("/frete/splash", requireFreteAuth, (req, res) => {
  res.render("Time_14(Frete)/splash");
});

// Rota de Login
app.get("/frete/login", (req, res) => {
  if (req.session.freteUser) {
    return res.redirect("/frete/home");
  }

  return res.render("Time_14(Frete)/login", {
    error: null,
  });
});

app.post("/frete/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("Time_14(Frete)/login", {
      error: "Preencha usuário e senha.",
    });
  }

  if (username === "admin" && password === "1234") {
    req.session.freteUser = {
      username: "admin",
      nome: "Administrador Frete",
    };

    return res.redirect("/frete/splash");
  }

  return res.render("Time_14(Frete)/login", {
    error: "Usuário ou senha inválidos.",
  });
});

app.get("/frete/home", requireFreteAuth, (req, res) => {
  res.render("Time_14(Frete)/home", {
    user: req.session.freteUser,
  });
});

app.get("/frete/logout", (req, res) => {
  req.session.freteUser = null;
  return res.redirect("/frete/login");
});

app.get("/frete/help", requireFreteAuth, (req, res) => {
  res.render("Time_14(Frete)/help", {
    user: req.session.freteUser,
  });
});

app.get("/frete/about", requireFreteAuth, (req, res) => {
  res.render("Time_14(Frete)/about", {
    user: req.session.freteUser,
  });
});

app.get("/frete/calcular", requireFreteAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${API_URL}/api/frete/tipos`);
    const data = await response.json();

    res.render("Time_14(Frete)/calcular", {
      user: req.session.freteUser,
      tiposFrete: data.data || [],
      resultado: null,
      error: null,
    });
  } catch (err) {
    res.render("Time_14(Frete)/calcular", {
      user: req.session.freteUser,
      tiposFrete: [],
      resultado: null,
      error: "Não foi possível carregar os tipos de frete.",
    });
  }
});

app.post("/frete/calcular", requireFreteAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const payload = {
      comprimento: Number.parseFloat(req.body.comprimento),
      largura: Number.parseFloat(req.body.largura),
      altura: Number.parseFloat(req.body.altura),
      pesoReal: Number.parseFloat(req.body.pesoReal),
      distanciaKm: Number.parseFloat(req.body.distanciaKm),
      tipoFrete: req.body.tipoFrete,
      valorDeclarado: Number.parseFloat(req.body.valorDeclarado),
      importado: req.body.importado === true || req.body.importado === "on",
      segurado: req.body.segurado === true || req.body.segurado === "on",
    };

    const response = await fetch(`${API_URL}/api/frete/calcular`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});


// ajuste 1
app.listen(PORT, () => {
  console.log(`✅ App Doméstica rodando: http://localhost:${PORT}`);
});

export default app;
