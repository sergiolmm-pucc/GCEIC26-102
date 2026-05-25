console.log("Iniciando...");
console.log("Deu certo");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:3001";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/cdd", express.static(path.join(__dirname, "views/cdd")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "domestic-worker-secret-2025",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  }),
);

const equipes = [
  { numero: 1, nome: 'ETEC1', rota: '/ETEC1/splash' },
  { numero: 2, nome: 'EXCHANGE', rota: '/exg' },
  { numero: 3, nome: 'CDD', rota: '/cdd' },
  { numero: 4, nome: 'CLT', rota: '/clt' },
  { numero: 5, nome: 'Equipe-5', rota: '/equipe-5' },
  { numero: 6, nome: 'Equipe-6', rota: '/equipe-6' },
  { numero: 7, nome: 'Equipe-7', rota: '/equipe-7' },
  { numero: 8, nome: 'Equipe-8', rota: '/equipe-8' },
  { numero: 9, nome: 'Equipe-9', rota: '/equipe-9' },
  { numero: 10, nome: 'Equipe-10', rota: '/equipe-10' },
  { numero: 11, nome: 'Equipe-11', rota: '/equipe-11' },
  { numero: 12, nome: 'Equipe-12', rota: '/equipe-12' },
  { numero: 13, nome: 'FLP', rota: '/flp' },
  { numero: 14, nome: 'Equipe-14', rota: '/equipe-14' },
  { numero: 15, nome: 'Equipe-15', rota: '/equipe-15' },
  { numero: 16, nome: 'Equipe-16', rota: '/equipe-16' },
  { numero: 17, nome: 'Equipe-17', rota: '/equipe-17' },
  { numero: 18, nome: 'Equipe-18', rota: '/equipe-18' },
  { numero: 19, nome: 'Equipe-19', rota: '/equipe-19' },
  { numero: 20, nome: 'Equipe-20', rota: '/equipe-20' },
];

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/login");
}

app.get("/", (req, res) => {
  res.render('index', { equipes });
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
  if (req.session && req.session.user) { return next(); }
  res.redirect('/ETEC1/login');
}

app.get('/ETEC1/splash', (req, res) => res.render('Time_2(ETEC1)/splash'));
app.get('/ETEC1/login', (req, res) => res.render('Time_2(ETEC1)/login', { erro: null }));
app.post('/ETEC1/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'admin' && senha === '1234') {
    req.session.user = { username: usuario };
    return res.redirect('/ETEC1/calculo');
  }
  res.render('Time_2(ETEC1)/login', { erro: 'Usuário ou senha inválidos.' });
});
app.get('/ETEC1/calculo', requireAuthETEC1, (req, res) => res.render('Time_2(ETEC1)/calculo'));
app.get('/ETEC1/sobre', requireAuthETEC1, (req, res) => res.render('Time_2(ETEC1)/sobre'));
app.get('/ETEC1/help', requireAuthETEC1, (req, res) => res.render('Time_2(ETEC1)/help'));
app.get('/ETEC1/logout', (req, res) => {
  req.session.destroy(() => { res.redirect('/ETEC1/login'); });
});
app.post('/ETEC1/:rota', requireAuthETEC1, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/ETEC1/${req.params.rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Rotas EXG (equipe)

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

// Rota CD - serve o React compilado
app.get("/cdd", (req, res) => {
  res.sendFile(path.join(__dirname, "views/cdd/index.html"));
});

// Rotas CLT Empresarial

function requireCltAuth(req, res, next) {
  if (req.session && req.session.cltUser) return next();
  res.redirect('/clt/login');
}

app.get('/clt', (_req, res) => {
  res.render('clt/splash');
});

app.get('/clt/login', (req, res) => {
  if (req.session.cltUser) return res.redirect('/clt/dashboard');
  res.render('clt/login', { error: null });
});

app.post('/clt/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();
  if (!username || !password) {
    return res.render('clt/login', { error: 'Preencha usuário e senha' });
  }
  if (username === 'admin' && password === 'admin') {
    req.session.cltUser = { username: 'admin', nome: 'Administrador' };
    return res.redirect('/clt/dashboard');
  }
  return res.render('clt/login', { error: 'Usuário ou senha inválidos' });
});

app.get('/clt/logout', (req, res) => {
  req.session.cltUser = null;
  res.redirect('/clt/login');
});

app.get('/clt/dashboard', requireCltAuth, (req, res) => {
  res.render('clt/dashboard', { user: req.session.cltUser });
});

app.get('/clt/calculadora', requireCltAuth, (req, res) => {
  res.render('clt/calculadora', { user: req.session.cltUser });
});

app.post('/clt/calcular', requireCltAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const payload = { ...req.body, token: 'token-clt-empresarial-123' };
    const response = await fetch(`${API_URL}/api/clt/resultado-contratacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(400).json({ success: false, erro: err.message });
  }
});

app.get('/clt/about', requireCltAuth, (req, res) => {
  res.render('clt/about', { user: req.session.cltUser });
});

app.get('/clt/help', requireCltAuth, (req, res) => {
  res.render('clt/help', { user: req.session.cltUser });
});

// ── Rotas FLP (Time 13) ───────────────────────────────────────────────────────

function requireFlpAuth(req, res, next) {
  if (req.session && req.session.flpUser) return next();
  res.redirect('/flp/login');
}

const funcionarios = [];
let nextId = 1;

app.get('/flp', (req, res) => {
  res.render('flp/splash');
});

app.get('/flp/login', (req, res) => {
  if (req.session.flpUser) return res.redirect('/flp/dashboard');
  res.render('flp/login', { error: null });
});

app.post('/flp/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render('flp/login', { error: 'Preencha todos os campos' });
  if (username === 'rh' && password === '1234') {
    req.session.flpUser = { username: 'rh', nome: 'Depto. Pessoal' };
    return res.redirect('/flp/dashboard');
  }
  res.render('flp/login', { error: 'Usuário ou senha inválidos' });
});

app.get('/flp/logout', (req, res) => {
  req.session.flpUser = null;
  res.redirect('/flp/login');
});

app.get('/flp/dashboard', requireFlpAuth, (req, res) => {
  res.render('flp/dashboard', { user: req.session.flpUser });
});

app.get('/flp/tabelas', requireFlpAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/flp/tabelas`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(503).json({ erro: 'Serviço indisponível' });
  }
});

app.get('/flp/calculo', requireFlpAuth, (req, res) => {
  res.render('flp/calculo', { user: req.session.flpUser });
});

app.post('/flp/calcular', requireFlpAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const payload = {
      ...req.body,
      token: 'token-flp-2026',
      salarioBase: parseFloat(req.body.salarioBase),
      dependentes: parseInt(req.body.dependentes) || 0,
      horas50: parseFloat(req.body.horas50) || 0,
      horas100: parseFloat(req.body.horas100) || 0,
      horaMes: parseInt(req.body.horaMes) || 220,
    };
    const response = await fetch(`${API_URL}/api/flp/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, erro: err.message });
  }
});

app.get('/flp/funcionarios', requireFlpAuth, (req, res) => {
  res.render('flp/funcionarios', { user: req.session.flpUser, funcionarios, editando: null, erro: null });
});

app.get('/flp/funcionarios/:id/editar', requireFlpAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const f = funcionarios.find(f => f.id === id);
  if (!f) return res.redirect('/flp/funcionarios');
  res.render('flp/funcionarios', { user: req.session.flpUser, funcionarios, editando: f, erro: null });
});

app.post('/flp/funcionarios/:id/atualizar', requireFlpAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = funcionarios.findIndex(f => f.id === id);
  if (idx === -1) return res.redirect('/flp/funcionarios');
  const { nome, cargo, salarioBase, custoVT, pgtVT, beneficioVA, pctDescontoVA,
    planoSaude, pgtPlanoSaude, horas50, horas100, diasFalta, horasAtraso, jornadaMensal } = req.body;
  const sal = parseFloat(salarioBase);
  if (!nome || !cargo || isNaN(sal) || sal <= 0) {
    return res.render('flp/funcionarios', {
      user: req.session.flpUser, funcionarios, editando: funcionarios[idx],
      erro: 'Preencha nome, cargo e salário válido.',
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
    pgtVT: pgtVT || 'clt',
    beneficioVA: parseFloat(beneficioVA) || 0,
    pctDescontoVA: parseInt(pctDescontoVA) || 20,
    planoSaude: parseFloat(planoSaude) || 0,
    pgtPlanoSaude: pgtPlanoSaude || 'funcionario',
  };
  res.redirect('/flp/funcionarios');
});

app.post('/flp/funcionarios', requireFlpAuth, (req, res) => {
  const { nome, cargo, salarioBase, custoVT, pgtVT, beneficioVA, pctDescontoVA,
    planoSaude, pgtPlanoSaude, horas50, horas100, diasFalta, horasAtraso, jornadaMensal } = req.body;
  const sal = parseFloat(salarioBase);
  if (!nome || !cargo || isNaN(sal) || sal <= 0) {
    return res.render('flp/funcionarios', {
      user: req.session.flpUser, funcionarios,
      erro: 'Preencha nome, cargo e salário válido.',
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
    pgtVT: pgtVT || 'clt',
    beneficioVA: parseFloat(beneficioVA) || 0,
    pctDescontoVA: parseInt(pctDescontoVA) || 20,
    planoSaude: parseFloat(planoSaude) || 0,
    pgtPlanoSaude: pgtPlanoSaude || 'funcionario',
  });
  res.redirect('/flp/funcionarios');
});

app.post('/flp/funcionarios/:id/remover', requireFlpAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = funcionarios.findIndex(f => f.id === id);
  if (idx !== -1) funcionarios.splice(idx, 1);
  res.redirect('/flp/funcionarios');
});

app.get('/flp/folha', requireFlpAuth, async (req, res) => {
  if (funcionarios.length === 0)
    return res.render('flp/folha', { user: req.session.flpUser, resultados: [] });
  try {
    const fetch = (await import('node-fetch')).default;
    const resultados = await Promise.all(funcionarios.map(async f => {
      const payload = {
        token: 'token-flp-2026',
        salarioBase: f.salarioBase,
        dependentes: f.dependentes,
        horaMes: f.jornadaMensal || 220,
        horas50: f.horas50,
        horas100: f.horas100,
        custoVT: f.custoVT || 0,
        pgtVT: f.pgtVT || 'clt',
        beneficioVA: f.beneficioVA || 0,
        pctDescontoVA: f.pctDescontoVA !== undefined ? f.pctDescontoVA : 20,
        planoSaude: f.planoSaude || 0,
        pgtPlanoSaude: f.pgtPlanoSaude || 'funcionario',
        diasFalta: f.diasFalta || 0,
        horasAtraso: f.horasAtraso || 0,
      };
      const r = await fetch(`${API_URL}/api/flp/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      return { funcionario: f, holerite: data };
    }));
    res.render('flp/folha', { user: req.session.flpUser, resultados });
  } catch (err) {
    res.redirect('/flp/funcionarios');
  }
});

app.get('/flp/about', requireFlpAuth, (req, res) => {
  res.render('flp/about', { user: req.session.flpUser });
});

app.get('/flp/help', requireFlpAuth, (req, res) => {
  res.render('flp/help', { user: req.session.flpUser });
});

// Endpoints dinâmicos equipe-5 a equipe-20
for (let i = 5; i <= 20; i++) {
  app.get(`/equipe-${i}`, (req, res) => {
    console.log(`/equipe-${i}/equipe`);
    res.render(`equipe`, {
      numero: i,
      nome: `Equipe-${i}`,
    });
  });
}

app.listen(PORT, () => {
  console.log(`✅ App Doméstica rodando: http://localhost:${PORT}`);
});
module.exports = app;
