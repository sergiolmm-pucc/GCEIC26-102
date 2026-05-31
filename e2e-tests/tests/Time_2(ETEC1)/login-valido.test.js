const { By, until } = require('selenium-webdriver');
const {tiraFoto, buildDriver,BASE_URL} = require("./helpers");

let driver;

async function main() {

    try {
        driver = await buildDriver(driver);

        await driver.get(BASE_URL + '/ETEC1/login');

        await tiraFoto(driver, 'ETEC1-login-valido-01-tela');

        await driver.findElement(By.name('usuario')).sendKeys('admin');

        await driver.findElement(By.name('senha')).sendKeys('1234');

        await tiraFoto(driver, 'ETEC1-login-valido-02-preenchido');

        await driver.findElement(By.css('button[type="submit"]')).click();

        await tiraFoto(driver, 'ETEC1-login-valido-03-submit');

        await driver.wait(
            until.urlContains('/calculo'),
            5000
        );

        await tiraFoto(driver, 'ETEC1-login-valido-04-logado');
    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main()
    .then(() => console.log('✅ (Time_2) - Tela de Login válido testada com sucesso!'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });