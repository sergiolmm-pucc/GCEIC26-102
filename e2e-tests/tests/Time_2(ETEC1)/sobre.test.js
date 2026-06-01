const { By } = require('selenium-webdriver');
const {loginETEC1, tiraFoto, buildDriver,BASE_URL} = require("./helpers");

let driver;

async function main() {

    try {
        driver = await buildDriver(driver);

        await loginETEC1(driver);

        await driver.get(BASE_URL + '/ETEC1/sobre');

        await tiraFoto(driver, 'ETEC1-sobre-01-tela');

        const titulo = await driver.findElement(
            By.tagName('h2')
        ).getText();

        await tiraFoto(driver, 'ETEC1-sobre-02-titulo');

        if (!titulo.includes('Nossa Equipe')) {
            throw new Error('Tela Sobre incorreta');
        }

        await tiraFoto(driver, 'ETEC1-sobre-03-validado');
    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main()
    .then(() => console.log('✅ (Time_2) - Tela Sobre testada com sucesso!'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });