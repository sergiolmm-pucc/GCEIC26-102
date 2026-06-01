const {
  APP_URL,
  By,
  until,
  buildDriver,
  takeScreenshot,
  runDirectly
} = require("./helpers");

async function runFreteLoginTest() {
  let driver;

  try {
    driver = await buildDriver();

    await driver.get(`${APP_URL}/frete/login`);

    await driver.wait(
      until.elementLocated(By.id("username")),
      5000
    );

    await takeScreenshot(driver, "Time_14(Frete)_login_aberto");

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

    await takeScreenshot(driver, "Time_14(Frete)_login_invalido");

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

    await takeScreenshot(driver, "Time_14(Frete)_login_credenciais_validas");

    await driver.findElement(
      By.css('button[type="submit"]')
    ).click();

    await driver.wait(
      until.urlContains("/frete/splash"),
      5000
    );

    await takeScreenshot(driver, "Time_14(Frete)_login_sucesso_splash");

    await driver.wait(
      until.urlContains("/frete/home"),
      8000
    );

    await takeScreenshot(driver, "Time_14(Frete)_login_sucesso_home");

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

module.exports = runFreteLoginTest;

if (require.main === module) {
  runDirectly(runFreteLoginTest, "(Time_14) Teste de login concluído");
}