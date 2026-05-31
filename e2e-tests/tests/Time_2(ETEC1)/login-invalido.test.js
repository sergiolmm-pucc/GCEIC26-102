const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const {tiraFoto, buildDriver,BASE_URL} = require("./helpers");

let driver;

async function main() {

    try {
        driver = await buildDriver(driver);

        await driver.get(BASE_URL + '/ETEC1/login');

        await tiraFoto(driver, 'ETEC1-login-invalido-01-tela');

        await driver.findElement(By.name('usuario')).sendKeys('usuarioInvalido');

        await driver.findElement(By.name('senha')).sendKeys('senhaErrada');

        await tiraFoto(driver, 'ETEC1-login-invalido-02-preenchido');

        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.sleep(1000);

        await tiraFoto(driver, 'ETEC1-login-invalido-03-submit');

        const erro = await driver.findElement(By.className('error')).getText();

        await tiraFoto(driver, 'ETEC1-login-invalido-04-erro');

        if (!erro || erro.trim().length === 0) {
            throw new Error('Mensagem de erro não encontrada');
        }
    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main()
    .then(() =>  console.log('✅ (Time_2) - Tela de Login inválido testada com sucesso!'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });