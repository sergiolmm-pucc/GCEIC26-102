const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function buildDriver() {
    const opts = new chrome.Options();
    opts.addArguments(
        '--headless=new',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1280,900',
        '--disable-gpu',
    );
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    await driver.manage().window().setRect({ width: 1280, height: 900 });
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
    return driver;
}

async function tiraFoto(driver, name) {
    try {
        const img = await driver.takeScreenshot();
        const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
        fs.writeFileSync(filePath, img, 'base64');
        console.log(`Foto tirada ${name}.png`);
    } catch (e) {
        console.warn('Erro ao tirar foto:', e.message);
    }
}

async function limparCampo(input) {
    await input.sendKeys(Key.END, Key.chord(Key.SHIFT, Key.HOME), Key.BACK_SPACE);
}

async function fazerLogin(driver) {
    await driver.get(`${BASE_URL}/ETEC11`);
    await driver.wait(
        until.elementLocated(By.css('[data-testid="login-form"]')),
        10000
    );
    await driver.findElement(By.css('[data-testid="login-user"]')).sendKeys('admin');
    await driver.findElement(By.css('[data-testid="login-pass"]')).sendKeys('1234');
    await driver.findElement(By.css('[data-testid="login-submit"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="main-app"]')),
        5000
    );
}

module.exports = { BASE_URL, buildDriver, tiraFoto, limparCampo, fazerLogin, By, until, Key };
