const { By, until, Builder} = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function tiraFoto(driver, nome) {
    try {
        const img = await driver.takeScreenshot();

        fs.writeFileSync(
            path.join(SCREENSHOTS_DIR, `${nome}.png`),
            img,
            'base64'
        );

        console.log(`📸 Foto tirada: ${nome}.png`);
    } catch (e) {
        console.warn('Erro ao tirar foto:', e.message);
    }
}

async function buildDriver(driver) {
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new chrome.Options().addArguments('--headless=new')
        )
        .build();

    return driver;
}

async function loginETEC1(driver) {
    console.log('🔐 Iniciando fluxo de autenticação...');

    await driver.get(BASE_URL + '/ETEC1/login');

    const campoUsuario = await driver.findElement(By.name('usuario'));
    await campoUsuario.sendKeys('admin');
    await driver.findElement(By.name('senha')).sendKeys('1234');

    await driver.findElement(By.css('form button, form input[type="submit"]')).click();

    await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return !url.includes('/login');
    }, 5000, 'Erro: O login demorou muito ou falhou.');

    console.log('✅ Autenticado com sucesso.');
}

module.exports = { loginETEC1, tiraFoto, buildDriver, BASE_URL };