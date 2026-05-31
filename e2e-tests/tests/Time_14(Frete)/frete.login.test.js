const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

const SCREENSHOTS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "screenshots"
);

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let driver;

async function tiraFoto(nome) {
  try {
    const imagem = await driver.takeScreenshot();

    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, `${nome}.png`),
      imagem,
      "base64"
    );

    console.log(`📸 Foto tirada: ${nome}.png`);
  } catch (e) {
    console.warn("Erro ao tirar foto:", e.message);
  }
}

async function main() {
  try {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(
        new chrome.Options().addArguments("--headless=new")
      )
      .build();

    await driver.get(`${APP_URL}/frete/login`);

    await driver.wait(
      until.elementLocated(By.id("username")),
      5000
    );

    await tiraFoto("Time_14(Frete)_login_aberto");

    // Teste 1: login inválido
    await driver.findElement(By.id("username")).sendKeys("usuario_errado");
    await driver.findElement(By.id("password")).sendKeys("senha_errada");

    await driver.findElement(
      By.css('button[type="submit"]')
    ).click();

    await driver.wait(
      until.elementLocated(By.css(".alert-error")),
      5000
    );

    const mensagemErro = await driver.findElement(
      By.css(".alert-error")
    ).getText();

    await tiraFoto("Time_14(Frete)_login_invalido");

    if (!mensagemErro.includes("Usuário") && !mensagemErro.includes("senha")) {
      throw new Error("Mensagem de erro de login inválido não apareceu");
    }

    console.log("✅ Login inválido validado");

    // Limpa campos para testar login válido
    await driver.findElement(By.id("username")).clear();
    await driver.findElement(By.id("password")).clear();

    // Teste 2: login válido
    await driver.findElement(By.id("username")).sendKeys("admin");
    await driver.findElement(By.id("password")).sendKeys("1234");

    await tiraFoto("Time_14(Frete)_login_credenciais_validas");

    await driver.findElement(
      By.css('button[type="submit"]')
    ).click();

    await driver.wait(
      until.urlContains("/frete/home"),
      5000
    );

    await tiraFoto("Time_14(Frete)_login_sucesso_home");

    const textoPagina = await driver.findElement(By.css("body")).getText();

    if (!textoPagina.includes("FastFrete")) {
      throw new Error("Home não carregou após login válido");
    }

    console.log("✅ Login válido validado com sucesso");

  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

main()
  .then(() => console.log("(Time_14) Teste de login concluído"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });