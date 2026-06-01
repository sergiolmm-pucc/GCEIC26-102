const {
  APP_URL,
  By,
  until,
  buildDriver,
  takeScreenshot,
  clickFreteElement,
  loginFrete,
  runDirectly
} = require("./helpers");

async function selecionarTipoFrete(driver, valor) {
  await driver.executeScript(
    [
      'const select = document.getElementById("tipoFrete");',
      'select.value = arguments[0];',
      'select.dispatchEvent(new Event("change", { bubbles: true }));'
    ].join("\n"),
    valor
  );
}

async function runFreteCalculationTest() {
  let driver;

  try {
    driver = await buildDriver();

    await loginFrete(driver);

    await takeScreenshot(driver, "Time_14(Frete)_calculo_login_realizado");

    await driver.get(`${APP_URL}/frete/calcular`);

    await driver.wait(
      until.elementLocated(By.id("freteForm")),
      5000
    );

    await takeScreenshot(driver, "Time_14(Frete)_calculo_aberto");

    await driver.findElement(By.id("comprimento")).sendKeys("40");
    await driver.findElement(By.id("largura")).sendKeys("30");
    await driver.findElement(By.id("altura")).sendKeys("20");
    await driver.findElement(By.id("pesoReal")).sendKeys("8");
    await driver.findElement(By.id("distanciaKm")).sendKeys("250");
    await driver.findElement(By.id("valorDeclarado")).sendKeys("1000");

    await selecionarTipoFrete(driver, "normal");

    await takeScreenshot(driver, "Time_14(Frete)_calculo_formulario_preenchido");

    await clickFreteElement(driver, await driver.findElement(By.id("importado")));
    await clickFreteElement(driver, await driver.findElement(By.id("segurado")));

    await takeScreenshot(driver, "Time_14(Frete)_calculo_opcoes_marcadas");

    await clickFreteElement(
      driver,
      await driver.findElement(By.css("#freteForm button[type='submit']"))
    );

    await driver.wait(
      until.elementLocated(By.id("resultState")),
      5000
    );

    await driver.wait(async () => {
      const classes = await driver.findElement(By.id("resultState")).getAttribute("class");
      return !classes.includes("hidden");
    }, 5000);

    await takeScreenshot(driver, "Time_14(Frete)_calculo_resultado_exibido");

    const pesoCubado = await driver.findElement(By.id("pesoCubado")).getText();
    const pesoFaturado = await driver.findElement(By.id("pesoFaturado")).getText();
    const valorBase = await driver.findElement(By.id("valorBase")).getText();
    const taxaImportacao = await driver.findElement(By.id("taxaImportacao")).getText();
    const taxaSeguro = await driver.findElement(By.id("taxaSeguro")).getText();
    const valorFinal = await driver.findElement(By.id("valorFinal")).getText();

    console.log("Resultado encontrado:");
    console.log("Peso cubado:", pesoCubado);
    console.log("Peso faturado:", pesoFaturado);
    console.log("Valor base:", valorBase);
    console.log("Taxa de importação:", taxaImportacao);
    console.log("Taxa de seguro:", taxaSeguro);
    console.log("Valor final:", valorFinal);

    if (!pesoCubado.includes("2")) {
      throw new Error("Peso cubado não foi exibido corretamente");
    }

    if (!pesoFaturado.includes("8")) {
      throw new Error("Peso faturado não foi exibido corretamente");
    }

    if (!valorBase.includes("50")) {
      throw new Error("Valor base não foi exibido corretamente");
    }

    if (!taxaImportacao.includes("150")) {
      throw new Error("Taxa de importação não foi exibida corretamente");
    }

    if (!taxaSeguro.includes("50")) {
      throw new Error("Taxa de seguro não foi exibida corretamente");
    }

    if (!valorFinal.includes("250")) {
      throw new Error("Valor final não foi exibido corretamente");
    }

    console.log("✅ Cálculo de frete validado com sucesso");

  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

module.exports = runFreteCalculationTest;

if (require.main === module) {
  runDirectly(runFreteCalculationTest, "(Time_14) Teste de cálculo concluído");
}
