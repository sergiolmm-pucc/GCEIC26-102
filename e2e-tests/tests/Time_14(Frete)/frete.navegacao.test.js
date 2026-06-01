const {
  APP_URL,
  By,
  until,
  buildDriver,
  takeScreenshot,
  submitFreteLogin,
  waitFreteSplashToHome,
  expectBodyText,
  runDirectly
} = require("./helpers");

async function runFreteNavigationTest() {
  let driver;

  try {
    driver = await buildDriver();

    // 1. Entrada redireciona para login
    await driver.get(`${APP_URL}/frete`);

    await driver.wait(
      until.urlContains("/frete/login"),
      5000
    );

    await takeScreenshot(driver, "Time_14(Frete)_login_aberto");

    // 2. Login e splash pós-autenticação
    await submitFreteLogin(driver);
    await takeScreenshot(driver, "Time_14(Frete)_splash_pos_login");
    await waitFreteSplashToHome(driver);
    await takeScreenshot(driver, "Time_14(Frete)_home");

    // 4. Valida Home
    await expectBodyText(
      driver,
      "FastFrete",
      "Home não carregou o texto FastFrete"
    );

    await expectBodyText(
      driver,
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

    await takeScreenshot(driver, "Time_14(Frete)_help");

    await expectBodyText(
      driver,
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

    await takeScreenshot(driver, "Time_14(Frete)_about");

    await expectBodyText(
      driver,
      "Gerência de Configuração",
      "Tela Sobre não carregou a disciplina"
    );

    await expectBodyText(
      driver,
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

    await takeScreenshot(driver, "Time_14(Frete)_calcular");

    console.log("✅ Tela de cálculo validada");

    console.log("✅ Navegação validada com sucesso");

  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

module.exports = runFreteNavigationTest;

if (require.main === module) {
  runDirectly(runFreteNavigationTest, "(Time_14) Teste de navegação concluído");
}