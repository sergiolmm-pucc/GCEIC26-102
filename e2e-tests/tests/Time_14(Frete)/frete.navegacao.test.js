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

async function loginFrete() {
  await driver.wait(
    until.elementLocated(By.id("username")),
    5000
  );

  await driver.findElement(By.id("username")).sendKeys("admin");
  await driver.findElement(By.id("password")).sendKeys("1234");

  await driver.findElement(
    By.css('button[type="submit"]')
  ).click();

  await driver.wait(
    until.urlContains("/frete/home"),
    5000
  );
}

async function validarTextoNaPagina(textoEsperado, mensagemErro) {
  const textoPagina = await driver.findElement(By.css("body")).getText();

  if (!textoPagina.includes(textoEsperado)) {
    throw new Error(mensagemErro);
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

    // 1. Splash
    await driver.get(`${APP_URL}/frete`);
    await tiraFoto("Time_14(Frete)_splash");

    // 2. Redirecionamento para login
    await driver.wait(
      until.urlContains("/frete/login"),
      6000
    );

    await tiraFoto("Time_14(Frete)_login_pos_splash");

    // 3. Login
    await loginFrete();

    await tiraFoto("Time_14(Frete)_home");

    // 4. Valida Home
    await validarTextoNaPagina(
      "FastFrete",
      "Home não carregou o texto FastFrete"
    );

    await validarTextoNaPagina(
      "Calcular frete",
      "Home não carregou o botão ou texto de cálculo"
    );

    console.log("✅ Home validada");

    // 5. Help
    await driver.get(`${APP_URL}/frete/help`);

    await driver.wait(
      until.elementLocated(By.css("body")),
      5000
    );

    await tiraFoto("Time_14(Frete)_help");

    await validarTextoNaPagina(
      "Como o cálculo do frete funciona",
      "Tela Help não carregou corretamente"
    );

    console.log("✅ Help validado");

    // 6. Sobre
    await driver.get(`${APP_URL}/frete/about`);

    await driver.wait(
      until.elementLocated(By.css("body")),
      5000
    );

    await tiraFoto("Time_14(Frete)_about");

    await validarTextoNaPagina(
      "Gerência de Configuração",
      "Tela Sobre não carregou a disciplina"
    );

    await validarTextoNaPagina(
      "Raphael Fernandes de Sellos Moreira",
      "Tela Sobre não carregou os integrantes"
    );

    console.log("✅ Sobre validado");

    // 7. Calcular
    await driver.get(`${APP_URL}/frete/calcular`);

    await driver.wait(
      until.elementLocated(By.id("freteForm")),
      5000
    );

    await tiraFoto("Time_14(Frete)_calcular");

    console.log("✅ Tela de cálculo validada");

    console.log("✅ Navegação validada com sucesso");

  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

main()
  .then(() => console.log("(Time_14) Teste de navegação concluído"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });