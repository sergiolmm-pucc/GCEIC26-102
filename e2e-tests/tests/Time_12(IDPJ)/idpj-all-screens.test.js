const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
const erros = [];

async function buildDriver() {
  const opts = new chrome.Options();
  opts.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800', '--disable-gpu');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
}

async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `IDPJ-${nome}.png`), img, 'base64');
    console.log(`  Foto: IDPJ-${nome}.png`);
  } catch (e) {
    console.warn(`  Aviso: falha ao salvar ${nome}.png`);
  }
}

function ok(msg) {
  console.log(`  OK ${msg}`);
}

function fail(msg) {
  console.error(`  ERRO ${msg}`);
  erros.push(msg);
}

async function setInput(id, valor) {
  const input = await driver.findElement(By.id(id));
  await input.sendKeys(Key.chord(Key.CONTROL, 'a'));
  await input.sendKeys(valor);
}

async function autenticarIdpj() {
  await driver.get(BASE_URL + '/IDPJ/login');
  const url = await driver.getCurrentUrl();
  if (url.includes('/IDPJ/calculo')) return;
  await driver.findElement(By.id('username')).sendKeys('admin');
  await driver.findElement(By.id('password')).sendKeys('1234');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/IDPJ/calculo'), 5000);
}

async function testeSplash() {
  console.log('\n[IDPJ 1/6] Splash');
  try {
    await driver.get(BASE_URL + '/IDPJ');
    await foto('01-splash');
    const titulo = await driver.findElement(By.css('h1')).getText();
    titulo.includes('IDPJ') ? ok('Splash exibido') : fail(`Titulo inesperado: ${titulo}`);
  } catch (e) {
    fail(`Splash: ${e.message}`);
  }
}

async function testeLogin() {
  console.log('\n[IDPJ 2/6] Login');
  try {
    await driver.get(BASE_URL + '/IDPJ/login');
    await foto('02-login-pagina');

    await driver.findElement(By.id('username')).sendKeys('admin');
    await driver.findElement(By.id('password')).sendKeys('errada');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((resolve) => setTimeout(resolve, 600));
    await foto('02-login-invalido');
    const erro = await driver.findElement(By.css('.erro')).getText();
    erro.toLowerCase().includes('invalidos') ? ok('Credenciais invalidas exibidas') : fail(`Mensagem inesperada: ${erro}`);

    await driver.get(BASE_URL + '/IDPJ/login');
    await driver.findElement(By.id('username')).sendKeys('admin');
    await driver.findElement(By.id('password')).sendKeys('1234');
    await foto('02-login-preenchido');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/IDPJ/calculo'), 5000);
    await foto('02-login-sucesso');
    ok('Login valido redirecionou');
  } catch (e) {
    fail(`Login: ${e.message}`);
  }
}

async function testeRotasProtegidas() {
  console.log('\n[IDPJ 3/6] Rotas protegidas');
  try {
    await driver.get(BASE_URL + '/IDPJ/logout');
    await driver.get(BASE_URL + '/IDPJ/calculo');
    await driver.wait(until.urlContains('/IDPJ/login'), 5000);
    ok('Calculo sem sessao redireciona para login');
  } catch (e) {
    fail(`Protecao: ${e.message}`);
  }
}

async function testeCalculadora() {
  console.log('\n[IDPJ 4/6] Calculadora');
  try {
    await autenticarIdpj();
    await driver.get(BASE_URL + '/IDPJ/calculo');
    await foto('04-calculo-form');

    await setInput('receitaMensal', '10000');
    await setInput('receita12Meses', '120000');
    await setInput('folha12Meses', '36000');
    await driver.findElement(By.id('submitBtn')).click();
    await driver.wait(until.elementTextContains(driver.findElement(By.id('resultadoSimples')), 'Anexo III'), 8000);
    await foto('04-calculo-resultado');
    ok('Resultado do DAS exibido');

    await driver.findElement(By.id('proLaboreBtn')).click();
    await driver.wait(until.elementTextContains(driver.findElement(By.id('resultadoProLabore')), 'Fator R'), 8000);
    await foto('04-fator-r-resultado');
    ok('Resultado do Fator R exibido');
  } catch (e) {
    fail(`Calculadora: ${e.message}`);
  }
}

async function testeSobreHelp() {
  console.log('\n[IDPJ 5/6] Sobre e ajuda');
  try {
    await autenticarIdpj();
    await driver.get(BASE_URL + '/IDPJ/sobre');
    await foto('05-sobre');
    const tituloSobre = await driver.findElement(By.css('h1')).getText();
    const imagens = await driver.findElements(By.css('.idpj-team-photo'));
    tituloSobre.includes('Time 12') && imagens.length === 1 ? ok('Sobre exibido') : fail('Sobre incompleto');

    await driver.get(BASE_URL + '/IDPJ/help');
    await foto('06-help');
    const tituloHelp = await driver.findElement(By.css('h1')).getText();
    tituloHelp.includes('Campos') ? ok('Ajuda exibida') : fail(`Titulo inesperado: ${tituloHelp}`);
  } catch (e) {
    fail(`Sobre/Ajuda: ${e.message}`);
  }
}

async function main() {
  await buildDriver();
  try {
    await testeSplash();
    await testeLogin();
    await testeRotasProtegidas();
    await testeCalculadora();
    await testeSobreHelp();
  } finally {
    await driver.quit();
  }

  if (erros.length > 0) {
    erros.forEach((erro) => console.error(` - ${erro}`));
    process.exit(1);
  }
  console.log('\nTodos os testes IDPJ passaram.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Erro fatal IDPJ', err);
    process.exit(1);
  });
} else {
  module.exports = main;
}
