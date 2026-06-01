const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const http = require("http");
const path = require("path");
const runTripTests = require("./trip-all-screens.test.js");

const BASE_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function tiraFoto(name, driver) {
  try {
    const img = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    fs.writeFileSync(filePath, img, "base64");
    console.log(`Foto tirada: ${filePath}`);
  } catch (err) {
    console.warn("Falha ao tirar screenshot:", err.message);
  }
}

function checkServerAlive(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve();
    });

    req.on("error", reject);
    req.setTimeout(timeout, () => {
      req.destroy(new Error("timeout"));
    });
  });
}

async function main() {
  const pageUrl = `${BASE_URL}/equipe-1`;
  console.log(`Verificando servidor em ${BASE_URL}...`);
  await checkServerAlive(BASE_URL).catch((err) => {
    throw new Error(
      `Servidor não acessível em ${BASE_URL}: ${err.message}. Inicie o frontend antes de rodar npm run trip:e2e.`
    );
  });

  const options = new chrome.Options();
  options.addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-software-rasterizer",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-hang-monitor",
    "--disable-infobars",
    "--disable-notifications",
    "--disable-renderer-backgrounding",
    "--remote-allow-origins=*",
    "--window-size=1280,960"
  );

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    process.env.APP_URL = BASE_URL;
    console.log(`Acessando ${pageUrl}`);
    await runTripTests(driver, (name) => tiraFoto(name, driver));
    console.log("Teste E2E TRIP finalizado com sucesso.");
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error("Erro no teste E2E TRIP:", err);
  process.exit(1);
});
