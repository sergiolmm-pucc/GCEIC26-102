const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function buildDriver() {
  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options().addArguments("--headless=new", "--window-size=800,640"))
    .build();
}

async function takeScreenshot(driver, name) {
  try {
    const image = await driver.takeScreenshot();

    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, `${name}.png`),
      image,
      "base64"
    );

    console.log(`Foto tirada: ${name}.png`);
  } catch (error) {
    console.warn("Erro ao tirar foto:", error.message);
  }
}

async function submitFreteLogin(driver) {
  await driver.get(`${APP_URL}/frete/login`);

  await driver.wait(until.elementLocated(By.id("username")), 5000);

  await driver.findElement(By.id("username")).sendKeys("admin");
  await driver.findElement(By.id("password")).sendKeys("1234");

  await clickFreteSubmit(driver);

  await driver.wait(until.urlContains("/frete/splash"), 5000);
}

async function clickFreteSubmit(driver) {
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));

  await clickFreteElement(driver, submitButton);
}

async function clickFreteElement(driver, element) {
  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center", inline: "nearest" });',
    element
  );

  await driver.executeScript("arguments[0].click();", element);
}

async function waitFreteSplashToHome(driver) {
  await driver.wait(until.urlContains("/frete/home"), 8000);
}

async function loginFrete(driver) {
  await submitFreteLogin(driver);
  await waitFreteSplashToHome(driver);
}

async function expectBodyText(driver, expectedText, errorMessage) {
  const bodyText = await driver.findElement(By.css("body")).getText();

  if (!bodyText.includes(expectedText)) {
    throw new Error(errorMessage);
  }
}

async function runDirectly(runTest, completionMessage) {
  try {
    await runTest();
    console.log(completionMessage);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = {
  APP_URL,
  By,
  until,
  buildDriver,
  takeScreenshot,
  clickFreteElement,
  clickFreteSubmit,
  submitFreteLogin,
  waitFreteSplashToHome,
  loginFrete,
  expectBodyText,
  runDirectly
};
