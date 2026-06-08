const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR))
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
const erros = [];

function ok(msg) {
  console.log("  OK " + msg);
}
function fail(msg) {
  console.error("  ERRO " + msg);
  erros.push(msg);
}

async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, `OCULOS-${nome}.png`),
      img,
      "base64",
    );
    console.log("  Foto: OCULOS-" + nome + ".png");
  } catch (e) {
    console.warn("  Aviso: falha ao salvar " + nome + ".png");
  }
}

async function logarOculos() {
  await driver.get(BASE_URL + "/oculos/login");
  const url = await driver.getCurrentUrl();
  if (url.includes("/oculos/calculo")) return;
  await driver.findElement(By.name("username")).sendKeys("admin");
  await driver.findElement(By.name("password")).sendKeys("admin");
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains("/oculos/calculo"), 8000);
}

// 1. SPLASH
async function testeSplash() {
  console.log("\n[OCULOS 1/7] Splash");
  try {
    await driver.get(BASE_URL + "/oculos");
    const titulo = await driver
      .findElement(By.css(".splash-title"))
      .getText();
    titulo.includes("Calc")
      ? ok('Splash exibida: "' + titulo + '"')
      : fail("Titulo da splash inesperado: " + titulo);
    // splash redireciona para o login apos 2s
    await driver.wait(until.urlContains("/oculos/login"), 5000);
    ok("Splash redirecionou para /oculos/login");
  } catch (e) {
    fail("Splash: " + e.message);
  }
}

// 2. LOGIN INVALIDO
async function testeLoginInvalido() {
  console.log("\n[OCULOS 2/7] Login com credenciais invalidas");
  try {
    await driver.get(BASE_URL + "/oculos/login");
    await foto("02-login-pagina");
    await driver.findElement(By.name("username")).sendKeys("usuario_errado");
    await driver.findElement(By.name("password")).sendKeys("senha_errada");
    await foto("02-login-preenchido-invalido");
    await driver.findElement(By.css('button[type="submit"]')).click();
    const alerta = await driver.wait(
      until.elementLocated(By.css(".alert")),
      6000,
    );
    await foto("02-login-erro");
    const txt = (await alerta.getText()).toLowerCase();
    txt.includes("inv") || txt.includes("senha")
      ? ok('Mensagem de erro exibida: "' + (await alerta.getText()) + '"')
      : fail("Mensagem de erro inesperada: " + txt);
  } catch (e) {
    fail("Login invalido: " + e.message);
  }
}

// 3. LOGIN VALIDO
async function testeLoginValido() {
  console.log("\n[OCULOS 3/7] Login com credenciais validas");
  try {
    await driver.get(BASE_URL + "/oculos/login");
    await foto("03-login-pagina");
    await driver.findElement(By.name("username")).sendKeys("admin");
    await driver.findElement(By.name("password")).sendKeys("admin");
    await foto("03-login-preenchido");
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains("/oculos/calculo"), 8000);
    await driver.wait(until.elementLocated(By.id("form-oculos")), 6000);
    ok("Login valido redirecionou para a tela de calculo");
  } catch (e) {
    fail("Login valido: " + e.message);
  }
}
/*
// 4. CALCULO DE CUSTO
async function testeCalculo() {
  console.log("\n[OCULOS 4/7] Calculo de custo");
  try {
    await logarOculos();
    await driver.get(BASE_URL + "/oculos/calculo");
    await driver.wait(until.elementLocated(By.id("form-oculos")), 6000);

    // ajusta alguns parametros do formulario
    const volume = await driver.findElement(By.name("volumeProducao"));
    await volume.clear();
    await volume.sendKeys("2000");
    const margem = await driver.findElement(By.name("margemLucro"));
    await margem.clear();
    await margem.sendKeys("65");
    // marca o tratamento de antirreflexo
    await driver
      .findElement(By.css('input[name="tratamentos"][value="antirreflexo"]'))
      .click();

    // dispara o calculo (chamada a API)
    await driver.findElement(By.id("btn-calc")).click();

    // espera o relatorio aparecer (sem pausa fixa curta — aguarda de verdade)
    const resultBody = await driver.wait(
      until.elementLocated(By.id("result-body")),
      12000,
    );
    await driver.wait(until.elementIsVisible(resultBody), 12000);
    // garante que o custo unitario foi preenchido (diferente de 0,00)
    await driver.wait(async () => {
      const t = await driver.findElement(By.id("r-total")).getText();
      return t && t.trim() !== "" && t.trim() !== "0,00";
    }, 12000);

    const total = await driver.findElement(By.id("r-total")).getText();
    const venda = await driver.findElement(By.id("r-venda")).getText();
    const lucro = await driver.findElement(By.id("p-lucro")).getText();
    if (total && total !== "0,00") {
      ok("Custo unitario calculado: R$ " + total);
      ok("Preco de venda sugerido: R$ " + venda);
      ok("Lucro total do lote: " + lucro);
    } else {
      fail("Resultado do calculo nao foi preenchido (r-total: " + total + ")");
    }
  } catch (e) {
    fail("Calculo: " + e.message);
  }
}
*/
// 5. MODAL DE INFORMACAO (ⓘ)
async function testeModalInfo() {
  console.log("\n[OCULOS 5/7] Modal de informacao dos materiais");
  try {
    await logarOculos();
    await driver.get(BASE_URL + "/oculos/calculo");
    await driver.wait(until.elementLocated(By.id("form-oculos")), 6000);
    // clica no primeiro botao de info (ⓘ)
    await driver.findElement(By.css(".info-i")).click();
    const modal = await driver.wait(
      until.elementLocated(By.id("infoModal")),
      4000,
    );
    await driver.wait(
      async () => (await modal.getAttribute("class")).includes("show"),
      4000,
    );
    const titulo = await driver.findElement(By.id("infoTitle")).getText();
    titulo && titulo.length > 0
      ? ok('Modal de info abriu: "' + titulo + '"')
      : fail("Modal de info abriu sem titulo");
    // fecha o modal
    await driver.findElement(By.id("infoClose")).click();
  } catch (e) {
    fail("Modal info: " + e.message);
  }
}

// 6. SOBRE
async function testeSobre() {
  console.log("\n[OCULOS 6/7] Sobre a equipe");
  try {
    await logarOculos();
    await driver.get(BASE_URL + "/oculos/sobre");
    await driver.wait(until.elementLocated(By.css(".team")), 6000);
    const txt = await driver.findElement(By.css(".team")).getText();
    txt.includes("Vitor Hugo") || txt.includes("Henrique") || txt.includes("Guilherme")
      ? ok("Tela Sobre lista os integrantes da equipe")
      : fail("Tela Sobre nao listou os integrantes esperados");
  } catch (e) {
    fail("Sobre: " + e.message);
  }
}

// 7. AJUDA
async function testeAjuda() {
  console.log("\n[OCULOS 7/7] Central de ajuda");
  try {
    await logarOculos();
    await driver.get(BASE_URL + "/oculos/help");
    const h1 = await driver.wait(until.elementLocated(By.css("h1")), 6000);
    const titulo = await h1.getText();
    titulo.toLowerCase().includes("cálculo") ||
    titulo.toLowerCase().includes("calculo") ||
    titulo.toLowerCase().includes("como funciona")
      ? ok('Tela de ajuda carregou: "' + titulo + '"')
      : fail("Titulo da ajuda inesperado: " + titulo);
  } catch (e) {
    fail("Ajuda: " + e.message);
  }
}

async function runOculosTests(externalDriver) {
  let criouAqui = false;
  if (externalDriver) {
    driver = externalDriver;
  } else {
    const opts = new chrome.Options();
    opts.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1280,800",
      "--disable-gpu",
    );
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(opts)
      .build();
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
    criouAqui = true;
  }

  try {
    await testeSplash();
    await testeLoginInvalido();
    await testeLoginValido();
    await testeCalculo();
    await testeModalInfo();
    await testeSobre();
    await testeAjuda();
  } finally {
    if (criouAqui && driver) await driver.quit();
  }

  if (erros.length > 0) {
    console.error(
      "\n[OCULOS] Testes finalizaram com " + erros.length + " erro(s)",
    );
    if (criouAqui) process.exit(1);
    throw new Error("Falhas nos testes Oculos (Time 5)");
  } else {
    console.log("\n[OCULOS] Todos os testes passaram!");
  }
}

if (require.main === module) {
  runOculosTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = runOculosTests;
