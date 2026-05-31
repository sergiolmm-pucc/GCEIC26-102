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

    console.log(`Foto tirada: ${nome}.png`);
  } catch (e) {
    console.warn("Erro ao tirar foto:", e.message);
  }
};

async function loginFrete() {
  await driver.get(`${APP_URL}/frete/login`);

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

async function selecionarTipoFrete(valor) {
  await driver.executeScript(
    `
      const select = document.getElementById("tipoFrete");
      select.value = arguments[0];
      select.dispatchEvent(new Event("change", { bubbles: true }));
    `,
    valor
  );
}

async function main() {
  try {
    driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(
        new chrome.Options().addArguments("--headless=new"))
    .build();

    await loginFrete();

    await tiraFoto("Time_14(Frete)_calculo_login_realizado");

    await driver.get(`${APP_URL}/frete/calcular`);

    await driver.wait(
      until.elementLocated(By.id("freteForm")),
      5000
    );

    await tiraFoto("Time_14(Frete)_calculo_aberto");

    await driver.findElement(By.id("comprimento")).sendKeys("40");
    await driver.findElement(By.id("largura")).sendKeys("30");
    await driver.findElement(By.id("altura")).sendKeys("20");
    await driver.findElement(By.id("pesoReal")).sendKeys("8");
    await driver.findElement(By.id("distanciaKm")).sendKeys("250");
    await driver.findElement(By.id("valorDeclarado")).sendKeys("1000");

    await selecionarTipoFrete("normal");

    await tiraFoto("Time_14(Frete)_calculo_formulario_preenchido");

    await driver.findElement(By.id("importado")).click();
    await driver.findElement(By.id("segurado")).click();

    await tiraFoto("Time_14(Frete)_calculo_opcoes_marcadas");

    await driver.findElement(
      By.css("#freteForm button[type='submit']")
    ).click();

    await driver.wait(
      until.elementLocated(By.id("resultState")),
      5000
    );

    await driver.wait(async () => {
      const classes = await driver.findElement(By.id("resultState")).getAttribute("class");
      return !classes.includes("hidden");
    }, 5000);

    await tiraFoto("Time_14(Frete)_calculo_resultado_exibido");

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

main()
  .then(() => console.log("(Time_14) Teste de cálculo concluído"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });