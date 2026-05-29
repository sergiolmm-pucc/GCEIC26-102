const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const {
  buildDriver,
  screenshot,
  click,
  type,
  autenticar
} = require('./helpers');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true }); 
}

let driver;
const erros = []; 

function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

function fail(msg) {
  console.error(`  ❌ ${msg}`);
  erros.push(msg);
}

/* =========================
   TESTES (ALL SCREENS)
========================= */

async function testeSplash() {
  console.log('\n[1/x] Splash');

  try {
    await driver.get(BASE_URL + "/financecar");

    await driver.wait(async () => {
        const readyState = await driver.executeScript(
            "return document.readyState"
        );
        return readyState === "complete";
    }, 10000);

    const logo = await driver.wait(
      until.elementLocated(By.css('.logo-splash')),
      3000
    );

    ok('Splash apareceu');
    await screenshot(driver, '01-splash');

    await driver.wait(
      until.stalenessOf(logo),
      6000
    );

    ok('Splash desapareceu');

    await driver.wait(
      until.urlContains('/financecar/login'),
      5000
    );

    ok('Redirecionou para login');
    await screenshot(driver, '01-login');

  } catch (e) {
    fail(`Splash: ${e.message}`);
  }
}

async function esperarErro(timeout = 5000) {
  const erroEl = await driver.wait(
    until.elementLocated(By.css('.error')),
    timeout
  );

  await driver.wait(async () => {
    const texto = await erroEl.getText();
    return texto.trim().length > 0;
  }, timeout);

  return await erroEl.getText();
}

async function testeLogin() {
  console.log('\n[LOGIN]');

  try {
    await driver.get(BASE_URL + '/financecar/login');

    await driver.wait(async () => {
        const readyState = await driver.executeScript(
            "return document.readyState"
        );
        return readyState === "complete";
    }, 10000);

    await screenshot(driver, 'login-pagina');

    // CASO 1 - campos vazios
    await click(driver, 'button');

    let erro = await esperarErro();

    erro.toLowerCase().includes('preencha')
      ? ok('Campos vazios ok')
      : fail(`Erro inesperado: ${erro}`);

    // CASO 2 - senha inválida
    await driver.get(BASE_URL + '/financecar/login');

    await driver.wait(async () => {
        const readyState = await driver.executeScript(
            "return document.readyState"
        );
        return readyState === "complete";
    }, 10000);

    await type(driver, '[data-testid="user-input"]', 'adm');
    await type(driver, '[data-testid="password-input"]', 'senha_errada');

    await click(driver, '[data-testid="login-button"]');

    erro = await esperarErro();

    (
      erro.toLowerCase().includes('usuário') ||
      erro.toLowerCase().includes('senha') ||
      erro.toLowerCase().includes('inválid')
    )
      ? ok('Credencial inválida ok')
      : fail(`Erro: ${erro}`);

    // CASO 3 - usuário inexistente
    await driver.get(BASE_URL + '/financecar/login');

    await driver.wait(async () => {
        const readyState = await driver.executeScript(
            "return document.readyState"
        );
        return readyState === "complete";
    }, 10000);

    await type(driver, 'input[type="text"]', 'teste');
    await type(driver, 'input[type="password"]', 'senha_errada');

    await click(driver, '[data-testid="login-button"]');

    erro = await esperarErro();

    (
      erro.toLowerCase().includes('usuário') ||
      erro.toLowerCase().includes('senha') ||
      erro.toLowerCase().includes('inválid')
    )
      ? ok('Credenciais inválidas ok')
      : fail(`Erro: ${erro}`);

    // CASO 4 - login válido
    await driver.get(BASE_URL + '/financecar/login');

    await driver.wait(async () => {
        const readyState = await driver.executeScript(
            "return document.readyState"
        );
        return readyState === "complete";
    }, 10000);

    await type(driver, 'input[type="text"]', 'adm');
    await type(driver, 'input[type="password"]', 'adm');

    await click(driver, '[data-testid="login-button"]');

    await driver.wait(
      until.urlContains('/home'),
      15000
    );

    await screenshot(driver, 'login-sucesso');

    ok('Login realizado com sucesso');

  } catch (e) {
    fail(`Login: ${e.message}`);
    console.error(e);
  }
}

async function testeHome() {
  console.log('\n[2/x] Home');

  try {

    await driver.get(BASE_URL + '/financecar/home');
    await screenshot(driver, '02-home-carregando');

    await driver.wait(
      until.elementLocated(By.css('.cards-funcionalidades')),
      10000
    );

    await screenshot(driver, '02-home-carregado');

    const cards = await driver.findElements(By.css('.card-funcao'));

    cards.length > 0
      ? ok(`${cards.length} cards encontrados`)
      : fail('Nenhum card-funcao encontrado');

    const links = await driver.findElements(By.css('nav a'));

    links.length > 0
      ? ok(`${links.length} links encontrados`)
      : fail('Links de navegação não encontrados');

    const titulo = await driver.findElement(By.css('.hero-texto h1'));
    const texto = await titulo.getText();

    texto.includes('FinanceCar')
      ? ok(`Título correto: ${texto}`)
      : fail(`Título incorreto: ${texto}`);

    const logout = await driver.findElements(By.css('.logout'));

    logout.length > 0
      ? ok('Botão logout encontrado')
      : fail('Logout não encontrado');

  } catch (e) {
    fail(`Home: ${e.message}`);
  }
}

async function testeJuros() {
  console.log('\n[JUROS]');

  try {

    await driver.get(BASE_URL + '/financecar/juros');
    await screenshot(driver, 'juros-pagina');

    // CASO 1
    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    await screenshot(driver, 'juros-vazios');

    let erro = await driver.findElement(By.css('.error')).getText();

    erro.toLowerCase().includes('preencha')
      ? ok('Campos vazios ok')
      : fail(`Erro inesperado: ${erro}`);

    // CASO 2
    await driver.get(BASE_URL + '/financecar/juros');

    await type(driver, '#valorInicial', '-100');
    await type(driver, '#aporteMensal', '10');
    await type(driver, '#taxaJuros', '0');
    await type(driver, '#tempo', '0');

    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    await screenshot(driver, 'juros-invalidos');

    erro = await driver.findElement(By.css('.error')).getText();

    erro.toLowerCase().includes('válidos')
      ? ok('Valores inválidos ok')
      : fail(`Erro inesperado: ${erro}`);

    // CASO 3
    await driver.get(BASE_URL + '/financecar/juros');

    await type(driver, '#valorInicial', '1000');
    await type(driver, '#aporteMensal', '100');
    await type(driver, '#taxaJuros', '1');
    await type(driver, '#tempo', '12');

    await click(driver, '#btn-calcular');

    const resultado = await driver.findElement(By.id('resultadoMsg'));

    await driver.wait(async () => {
      return (await resultado.getText()).trim().length > 0;
    }, 10000);

    await screenshot(driver, 'juros-sucesso');

    const texto = await resultado.getText();

    texto.toLowerCase().includes('montante') ||
    texto.toLowerCase().includes('resultado') ||
    texto.toLowerCase().includes('r$')
      ? ok('Cálculo juros ok')
      : fail(`Resultado inválido: ${texto}`);

  } catch (e) {
    fail(`Juros: ${e.message}`);
  }
}

async function testeFinanciamento() {
  console.log('\n[FINANCIAMENTO]');

  try {

    await driver.get(BASE_URL + '/financecar/financiamento');
    await screenshot(driver, 'financiamento-pagina');

    // vazio
    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    let erro = await driver.findElement(By.id('errorMsg')).getText();

    erro.toLowerCase().includes('preencha')
      ? ok('Campos vazios ok')
      : fail(`Erro: ${erro}`);

    // inválido
    await driver.get(BASE_URL + '/financecar/financiamento');

    await type(driver, '#valorVeiculo', '-50000');
    await type(driver, '#entrada', '-1000');
    await type(driver, '#taxaJuros', '0');
    await type(driver, '#parcelas', '0');

    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    await screenshot(driver, 'financiamento-invalidos');

    erro = await driver.findElement(By.id('errorMsg')).getText();

    erro.toLowerCase().includes('válidos')
      ? ok('Valores inválidos ok')
      : fail(`Erro: ${erro}`);

    // válido
    await driver.get(BASE_URL + '/financecar/financiamento');

    await type(driver, '#valorVeiculo', '50000');
    await type(driver, '#entrada', '10000');
    await type(driver, '#taxaJuros', '1.5');
    await type(driver, '#parcelas', '48');

    await click(driver, '#btn-calcular');

    const resultado = await driver.findElement(By.id('resultadoMsg'));

    await driver.wait(async () => {
      return (await resultado.getText()).trim().length > 0;
    }, 10000);

    await screenshot(driver, 'financiamento-sucesso');

    const texto = await resultado.getText();

    texto.toLowerCase().includes('parcela')
      ? ok('Financiamento ok')
      : fail(`Resultado inválido: ${texto}`);

  } catch (e) {
    fail(`Financiamento: ${e.message}`);
  }
}

async function testeFundo() {
  console.log('\n[FUNDO]');

  try {

    await driver.get(BASE_URL + '/financecar/fundo');
    await screenshot(driver, 'fundo-pagina');

    // vazio
    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    let erro = await driver.findElement(By.id('errorMsg')).getText();

    erro.toLowerCase().includes('preencha')
      ? ok('Campos vazios ok')
      : fail(`Erro: ${erro}`);

    // inválido
    await driver.get(BASE_URL + '/financecar/fundo');

    await type(driver, '#gastosFixos', '-1000');
    await type(driver, '#gastosVariaveis', '-500');
    await type(driver, '#mesesSeguranca', '0');

    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    await screenshot(driver, 'fundo-invalidos');

    erro = await driver.findElement(By.id('errorMsg')).getText();

    erro.toLowerCase().includes('válidos')
      ? ok('Valores inválidos ok')
      : fail(`Erro: ${erro}`);

    // válido
    await driver.get(BASE_URL + '/financecar/fundo');

    await type(driver, '#gastosFixos', '2000');
    await type(driver, '#gastosVariaveis', '1000');
    await type(driver, '#mesesSeguranca', '6');

    await click(driver, '#btn-calcular');

    const resultado = await driver.findElement(By.id('resultadoMsg'));

    await driver.wait(async () => {
      return (await resultado.getText()).trim().length > 0;
    }, 10000);

    await screenshot(driver, 'fundo-sucesso');

    const texto = await resultado.getText();

    texto.toLowerCase().includes('valor')
      ? ok('Fundo ok')
      : fail(`Resultado inválido: ${texto}`);

  } catch (e) {
    fail(`Fundo: ${e.message}`);
  }
}

async function testeRegra() {
  console.log('\n[REGRA]');

  try {

    await driver.get(BASE_URL + '/financecar/regra');
    await screenshot(driver, 'regra-pagina');

    // CASO 1
    await click(driver, '#btn-calcular');
    await driver.sleep(1000);

    let erro = await driver.findElement(By.css('.error')).getText();

    erro.toLowerCase().includes('preencha')
      ? ok('Campo vazio ok')
      : fail(`Erro: ${erro}`);

    // CASO 2
    await driver.get(BASE_URL + '/financecar/regra');

    await type(driver, '#salarioLiquido', '-1000');
    await click(driver, '#btn-calcular');

    erro = await driver.findElement(By.css('.error')).getText();

    erro.toLowerCase().includes('válido')
      ? ok('Valor inválido ok')
      : fail(`Erro: ${erro}`);

    // CASO 3
    await driver.get(BASE_URL + '/financecar/regra');

    await type(driver, '#salarioLiquido', '5000');
    await click(driver, '#btn-calcular');

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Necessidades')]")),
      10000
    );

    await screenshot(driver, 'regra-sucesso');

    const necessidades = await driver.findElement(By.xpath("//*[contains(text(),'Necessidades')]")).getText();
    const desejos = await driver.findElement(By.xpath("//*[contains(text(),'Desejos')]")).getText();
    const investimentos = await driver.findElement(By.xpath("//*[contains(text(),'Investimentos')]")).getText();

    (necessidades && desejos && investimentos)
      ? ok('Regra 50/30/20 ok')
      : fail('Resultado incompleto');

  } catch (e) {
    fail(`Regra: ${e.message}`);
  }
}

async function testeSobre() {
  console.log('\n[3/x] Sobre');

  try {

    await driver.get(BASE_URL + '/financecar/sobre');
    await screenshot(driver, '03-sobre');

    const titulo = await driver.findElement(By.css('.hero-sobre h1'));
    const textoTitulo = await titulo.getText();

    textoTitulo.includes('FinanceCar')
      ? ok(`Título: ${textoTitulo}`)
      : fail(`Título incorreto: ${textoTitulo}`);

    const cards = await driver.findElements(By.css('.card-sobre'));

    cards.length > 0
      ? ok(`${cards.length} cards equipe`)
      : fail('Cards equipe não encontrados');

    const nomes = await driver.findElements(By.css('.card-sobre h2'));

    nomes.length >= 3
      ? ok(`${nomes.length} membros encontrados`)
      : fail('Equipe incompleta');

    const logout = await driver.findElements(By.css('.logout'));

    logout.length > 0
      ? ok('Logout encontrado')
      : fail('Logout não encontrado');

    await logout[0].click();

    await driver.wait(
      until.elementLocated(By.css('.popup')),
      5000
    );

    await screenshot(driver, '03-popup-logout');

    ok('Popup logout apareceu');

    const cancelar = await driver.findElements(By.css('.cancelar'));

    cancelar.length > 0
      ? ok('Botão cancelar encontrado')
      : fail('Cancelar não encontrado');

    await cancelar[0].click();

    ok('Popup fechado');

  } catch (e) {
    fail(`Sobre: ${e.message}`);
  }
}

async function testeHelpGeral() {
  console.log('\n[HELP GERAL]');

  const telasHelp = [
    { nome: 'juros', url: '/financecar/juros' },
    { nome: 'financiamento', url: '/financecar/financiamento' },
    { nome: 'fundo', url: '/financecar/fundo' },
    { nome: 'regra', url: '/financecar/regra' }
  ];

  try {

    for (const tela of telasHelp) {

      console.log(`\n[HELP] ${tela.nome}`);

      await driver.get(BASE_URL + tela.url);

      await driver.wait(
        until.elementLocated(By.css('.help-btn')),
        5000
      );

      await screenshot(driver, `help-${tela.nome}-pagina`);

      const btnHelp = await driver.findElement(By.css('.help-btn'));
      await btnHelp.click();

      await driver.wait(
        until.elementLocated(By.css('.help-modal, .modal, .popup')),
        5000
      );

      await screenshot(driver, `help-${tela.nome}-aberto`);

      const modal = await driver.findElements(
        By.css('.help-modal, .modal, .popup')
      );

      modal.length > 0
        ? ok(`Help ${tela.nome} abriu corretamente`)
        : fail(`Help ${tela.nome} NÃO abriu`);

      // valida se fechou (opcional, se tiver botão fechar)
      const fechar = await driver.findElements(
        By.css('.close, .btn-close, .fechar')
      );

      if (fechar.length > 0) {
        await fechar[0].click();
        ok(`Help ${tela.nome} fechado`);
      }
    }

  } catch (e) {
    fail(`Help Geral: ${e.message}`);
  }
}

/* =========================
   MAIN
========================= */
async function main() {
  driver = await buildDriver();

  await driver.manage().window().setRect({
    width: 1400,
    height: 900
  });

  try {
    await testeSplash();
    await testeLogin();
    await testeHome();
    await testeSobre();
    await testeJuros();
    await testeFinanciamento();
    await testeFundo();
    await testeRegra();
    await testeHelpGeral();

  } finally {
    if (driver) {
      await driver.quit();
    }
  }

  if (erros.length > 0) {
    console.log('\n❌ ERROS:');
    erros.forEach(e => console.log(' - ' + e));
    process.exit(1);
  }

  console.log('\n✅ TODOS OS TESTES PASSARAM');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Erro fatal:', err);

    if (driver) {
      driver.quit();
    }

    process.exit(1);
  });
}

module.exports = main;