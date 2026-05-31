const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const {loginETEC1, tiraFoto, buildDriver, BASE_URL} = require("./helpers");

let driver;

async function main() {

    try {
        driver = await buildDriver(driver);

        await loginETEC1(driver);

        await driver.get(BASE_URL + '/ETEC1/help');

        await tiraFoto(driver, 'ETEC1_tela_ajuda_aberta');

        const titulo = await driver.findElement(
            By.tagName('h2')
        ).getText();

        await tiraFoto(driver, 'ETEC1_titulo_verificado');

        if (!titulo.includes('Como usar')) {
            throw new Error('Tela de ajuda incorreta');
        }
    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main()
    .then(() => console.log('✅ (Time_2) - Tela de Ajuda testada com sucesso!'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });