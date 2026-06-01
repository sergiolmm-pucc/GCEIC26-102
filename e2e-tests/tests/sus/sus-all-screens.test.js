const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
const erros = [];

function ok(msg)   { console.log('  OK ' + msg); }
function fail(msg) { console.error('  ERRO ' + msg); erros.push(msg); }

async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `SUS-${nome}.png`), img, 'base64');
    console.log('  Foto: SUS-' + nome + '.png');
  } catch (e) {
    console.warn('  Aviso: falha ao salvar ' + nome + '.png');
  }
}

async function logarSus() {
  await driver.get(BASE_URL + '/sus/login');
  const url = await driver.getCurrentUrl();
  if (url.includes('/sus/dashboard')) return;
  await driver.findElement(By.id('usuario')).sendKeys('admin');
  await driver.findElement(By.id('senha')).sendKeys('admin');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/sus/dashboard'), 5000);
}

async function testeSplash() {
  console.log('\n[SUS 1/7] Splash');
  try {
    await driver.get(BASE_URL + '/sus');
    await foto('01-splash');
    // espera redirecionar pra login
    await driver.wait(until.urlContains('/sus/login'), 4000);
    ok('Splash redirecionou para login');
  } catch (e) {
    fail('Splash: ' + e.message);
  }
}

async function testeLoginErrado() {
  console.log('\n[SUS 2/7] Login com credencial errada');
  try {
    await driver.get(BASE_URL + '/sus/login');
    await foto('02-login-pagina');
    await driver.findElement(By.id('usuario')).sendKeys('xxxxx');
    await driver.findElement(By.id('senha')).sendKeys('yyyyy');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((r) => setTimeout(r, 600));
    await foto('02-login-errado');
    const erro = await driver.findElement(By.css('.error')).getText();
    erro.toLowerCase().includes('invalid')
      ? ok('Mostrou mensagem de erro')
      : fail('Nao mostrou mensagem esperada, veio: ' + erro);
  } catch (e) {
    fail('Login errado: ' + e.message);
  }
}

async function testeLoginCerto() {
  console.log('\n[SUS 3/7] Login OK');
  try {
    await logarSus();
    await foto('03-dashboard');
    const url = await driver.getCurrentUrl();
    url.includes('/sus/dashboard') ? ok('Entrou no dashboard') : fail('URL inesperada: ' + url);
  } catch (e) {
    fail('Login certo: ' + e.message);
  }
}

async function testeTransporte() {
  console.log('\n[SUS 4/7] Calculo de transporte');
  try {
    await driver.get(BASE_URL + '/sus/transporte');
    await foto('04-transporte-form');
    await driver.findElement(By.id('km')).sendKeys('20');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((r) => setTimeout(r, 800));
    await foto('04-transporte-resultado');
    const txt = await driver.findElement(By.css('.resultado')).getText();
    txt.includes('kg') ? ok('Resultado exibido') : fail('Resultado nao apareceu');
  } catch (e) {
    fail('Transporte: ' + e.message);
  }
}

async function testePegada() {
  console.log('\n[SUS 5/7] Pegada mensal');
  try {
    await driver.get(BASE_URL + '/sus/pegada');
    await foto('05-pegada-form');
    await driver.findElement(By.id('energiaKwh')).clear();
    await driver.findElement(By.id('energiaKwh')).sendKeys('150');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((r) => setTimeout(r, 800));
    await foto('05-pegada-resultado');
    const txt = await driver.findElement(By.css('.resultado')).getText();
    txt.toLowerCase().includes('total') ? ok('Total calculado') : fail('Sem total');
  } catch (e) {
    fail('Pegada: ' + e.message);
  }
}

async function testeArvores() {
  console.log('\n[SUS 6/7] Arvores');
  try {
    await driver.get(BASE_URL + '/sus/arvores');
    await foto('06-arvores-form');
    await driver.findElement(By.id('kg_co2')).sendKeys('44');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((r) => setTimeout(r, 800));
    await foto('06-arvores-resultado');
    const txt = await driver.findElement(By.css('.resultado')).getText();
    txt.includes('2') ? ok('Calculou 2 arvores para 44kg') : fail('Resultado inesperado: ' + txt);
  } catch (e) {
    fail('Arvores: ' + e.message);
  }
}

async function testeSobreHelp() {
  console.log('\n[SUS 7/7] Sobre + Help');
  try {
    await driver.get(BASE_URL + '/sus/sobre');
    await foto('07-sobre');
    const sobre = await driver.findElement(By.css('.sobre-container')).getText();
    sobre.includes('Felipe') ? ok('Sobre lista integrantes') : fail('Sem integrantes em /sobre');

    await driver.get(BASE_URL + '/sus/help');
    await foto('07-help');
    ok('Pagina de help carregou');
  } catch (e) {
    fail('Sobre/Help: ' + e.message);
  }
}

async function runSusTests(externalDriver) {
  // pode receber driver de fora (base.test.js) ou criar o seu
  let criouAqui = false;
  if (externalDriver) {
    driver = externalDriver;
  } else {
    const opts = new chrome.Options();
    opts.addArguments('--headless=new','--no-sandbox','--disable-dev-shm-usage','--window-size=1280,800','--disable-gpu');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
    criouAqui = true;
  }

  try {
    await testeSplash();
    await testeLoginErrado();
    await testeLoginCerto();
    await testeTransporte();
    await testePegada();
    await testeArvores();
    await testeSobreHelp();
  } finally {
    if (criouAqui && driver) await driver.quit();
  }

  if (erros.length > 0) {
    console.error('\n[SUS] Testes finalizaram com ' + erros.length + ' erro(s)');
    if (criouAqui) process.exit(1);
    throw new Error('Falhas nos testes SUS');
  } else {
    console.log('\n[SUS] Todos os testes passaram!');
  }
}

if (require.main === module) {
  runSusTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = runSusTests;
