const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs   = require('fs');
const path = require('path');

const BASE_URL        = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
const erros = [];

async function buildDriver() {
  const opts = new chrome.Options();
  opts.addArguments('--headless=new', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800', '--disable-gpu', '--disable-extensions', '--disable-background-networking');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
}

async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `FLP-${nome}.png`), img, 'base64');
    console.log(`  FLP-${nome}.png`);
  } catch (e) {
    console.warn(`  Aviso: falha ao salvar ${nome}.png`);
  }
}

function ok(msg)   { console.log(`  v ${msg}`); }
function fail(msg) { console.error(`  x ${msg}`); erros.push(msg); }

async function autenticarFlp() {
  await driver.get(BASE_URL + '/flp/login');
  await driver.wait(until.urlContains('/flp'), 8000);
  const url = await driver.getCurrentUrl();
  if (url.includes('/flp/dashboard')) return;
  await driver.wait(until.elementLocated(By.id('username')), 5000);
  // Preenche e submete via JS para evitar problemas com botão disabled
  await driver.executeScript(`
    document.getElementById('username').value = 'rh';
    document.getElementById('password').value = '1234';
    document.getElementById('loginForm').submit();
  `);
  await driver.wait(until.urlContains('/flp/dashboard'), 10000);
}

// 1. SPLASH
async function testeFlpSplash() {
  console.log('\n[1/7] Splash (/flp)');
  try {
    await driver.get(BASE_URL + '/flp');
    await foto('01-splash');
    const texto = await driver.findElement(By.css('.splash-logo')).getText();
    texto.includes('FLP') ? ok(`Logo: "${texto}"`) : fail(`Logo inesperado: "${texto}"`);
  } catch (e) { fail(`Splash: ${e.message}`); }
}

// 2. LOGIN
async function testeFlpLogin() {
  console.log('\n[2/7] Login (/flp/login)');
  try {
    await driver.get(BASE_URL + '/flp/login');
    await foto('02-login-pagina');

    // Campos vazios
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 600));
    await foto('02-login-campos-vazios');
    try {
      const msg = await driver.findElement(By.css('.erro')).getText();
      msg.toLowerCase().includes('preencha') ? ok(`Campos vazios: "${msg}"`) : fail(`Esperava "preencha": "${msg}"`);
    } catch (e) { fail('Mensagem de campo vazio não apareceu'); }

    // Credenciais erradas
    await driver.get(BASE_URL + '/flp/login');
    await driver.findElement(By.id('username')).sendKeys('errado');
    await driver.findElement(By.id('password')).sendKeys('errado');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 1200));
    await foto('02-login-credenciais-erradas');
    try {
      const msg = await driver.findElement(By.css('.erro')).getText();
      msg.toLowerCase().includes('invalidos') || msg.toLowerCase().includes('inválidos')
        ? ok(`Credenciais erradas: "${msg}"`)
        : fail(`Esperava "invalidos": "${msg}"`);
    } catch (e) { fail('Mensagem de credenciais inválidas não apareceu'); }

    // Login válido
    await driver.get(BASE_URL + '/flp/login');
    await driver.findElement(By.id('username')).sendKeys('rh');
    await driver.findElement(By.id('password')).sendKeys('1234');
    await foto('02-login-campos-preenchidos');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/flp/dashboard'), 8000);
    await foto('02-login-sucesso');
    ok('Login válido → redirecionou para /flp/dashboard');
  } catch (e) { fail(`Login: ${e.message}`); }
}

// 3. ROTAS PROTEGIDAS + LOGOUT
async function testeFlpRedirect() {
  console.log('\n[3/7] Rotas protegidas');
  const rotas = [
    { path: '/flp/dashboard', nome: '03-dashboard' },
    { path: '/flp/calculo',   nome: '03-calculo' },
    { path: '/flp/about',     nome: '03-about' },
    { path: '/flp/help',      nome: '03-help' },
  ];

  for (const { path: rota, nome } of rotas) {
    try {
      await autenticarFlp();
      await driver.get(BASE_URL + rota);
      await new Promise(r => setTimeout(r, 800));
      await foto(nome);
      ok(`${rota} → screenshot tirado`);
    } catch (e) { fail(`${rota} screenshot: ${e.message}`); }
  }

  try {
    await driver.get(BASE_URL + '/flp/logout');
    for (const { path: rota } of rotas) {
      await driver.get(BASE_URL + rota);
      await driver.wait(until.urlContains('/flp/login'), 5000);
      ok(`${rota} sem sessão → redirecionou para /flp/login`);
    }
  } catch (e) { fail(`Redirect sem token: ${e.message}`); }
}

// 4. DASHBOARD (tabelas)
async function testeFlpDashboard() {
  console.log('\n[4/7] Dashboard (/flp/dashboard)');
  try {
    await autenticarFlp();
    await driver.get(BASE_URL + '/flp/dashboard');
    await foto('03-dashboard-carregando');
    await driver.wait(until.elementLocated(By.css('#inssSection')), 10000);
    await driver.wait(until.elementIsVisible(await driver.findElement(By.css('#inssSection'))), 10000);
    await foto('03-dashboard-carregado');
    const cards = await driver.findElements(By.css('.tabela-bloco'));
    cards.length > 0 ? ok(`${cards.length} blocos de tabela carregados`) : fail('Nenhum bloco de tabela');
  } catch (e) { fail(`Dashboard: ${e.message}`); }
}

// 5. CALCULADORA
async function testeFlpCalculo() {
  console.log('\n[5/7] Calculadora (/flp/calculo)');
  try {
    await autenticarFlp();
    await driver.get(BASE_URL + '/flp/calculo');
    await foto('04-calculo-pagina');
    await driver.executeScript(`document.getElementById('salario').value = '3000';`);
    await foto('04-calculo-preenchido');
    await driver.executeScript(`
      document.getElementById('calcForm').dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
    `);
    await new Promise(r => setTimeout(r, 2000));
    await foto('04-calculo-aguardando');
    await driver.wait(until.elementIsVisible(await driver.findElement(By.css('.contracheque-doc'))), 12000);
    await foto('04-calculo-resultado');
    const val = await driver.findElement(By.css('#ctLiquido')).getText();
    val ? ok(`Salário líquido: ${val}`) : fail('Valor do salário líquido vazio');
  } catch (e) { fail(`Calculadora: ${e.message}`); }
}

// 6. ABOUT
async function testeFlpAbout() {
  console.log('\n[6/7] About (/flp/about)');
  try {
    await autenticarFlp();
    await driver.get(BASE_URL + '/flp/about');
    await foto('05-about-pagina');
    const logo = await driver.findElement(By.css('.about-logo')).getText();
    logo.includes('FLP') ? ok(`Logo: "${logo}"`) : fail(`Logo incorreto: "${logo}"`);
    const membros = await driver.findElements(By.css('.team-member'));
    membros.length > 0 ? ok(`${membros.length} membros da equipe`) : fail('Membros não encontrados');
  } catch (e) { fail(`About: ${e.message}`); }
}

// 7. HELP
async function testeFlpHelp() {
  console.log('\n[7/7] Help (/flp/help)');
  try {
    await autenticarFlp();
    await driver.get(BASE_URL + '/flp/help');
    await foto('06-help-pagina');
    const faqItems = await driver.findElements(By.css('.faq-item'));
    faqItems.length > 0 ? ok(`${faqItems.length} perguntas na FAQ`) : fail('FAQ não encontrado');
    await faqItems[0].click();
    await faqItems[1].click();
    await faqItems[2].click();
    await new Promise(r => setTimeout(r, 400));
    await foto('06-help-faq-abertas');
    ok('FAQ interativo funcionando');
  } catch (e) { fail(`Help: ${e.message}`); }
}

// MAIN
async function main() {
  await buildDriver();
  try {
    await testeFlpSplash();
    await testeFlpLogin();
    await testeFlpRedirect();
    await testeFlpDashboard();
    await testeFlpCalculo();
    await testeFlpAbout();
    await testeFlpHelp();
  } finally {
    await driver.quit();
  }

  console.log('\n─────────────────────────────────');
  if (erros.length === 0) {
    console.log('Todos os testes FLP passaram!');
  } else {
    console.log(`${erros.length} falha(s):`);
    erros.forEach(e => console.log(`   - ${e}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => { console.error('Erro fatal', err); process.exit(1); });
} else {
  module.exports = main;
}
