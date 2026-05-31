const { Builder, By } = require('selenium-webdriver');
const {loginETEC1, tiraFoto, buildDriver, BASE_URL} = require("./helpers");

let driver;

async function main() {

    try {
        driver = await buildDriver(driver);

        await loginETEC1(driver);

        await driver.get(BASE_URL + '/ETEC1/calculo');

        await tiraFoto(driver, 'ETEC1_calculo_aberto');

        await driver.findElement(
            By.id('sal-salario')
        ).sendKeys('2000');

        await tiraFoto(driver, 'ETEC1_salario_preenchido');

        await driver.findElement(
            By.css('#panel-salario button.calc')
        ).click();

        await tiraFoto(driver, 'ETEC1_botao_calcular_clicado');

        await driver.sleep(2000);

        const resultado = await driver.executeScript(
            "const el = document.getElementById('res-salario'); return el ? el.innerText : '';"
        );

        await tiraFoto(driver, 'ETEC1_resultado_exibido');

        if (!resultado.includes('Salário Bruto')) {
            throw new Error('Resultado não exibido. Recebido: "' + resultado.substring(0, 150) + '"');
        }
    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main()
    .then(() => console.log('✅ (Time_2) - Tela de Calculo testada com sucesso!'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });