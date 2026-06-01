const { tiraFoto, By, until } = require('./helpers');

async function setValor(driver, input, valor) {
    await driver.executeScript(
        'const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;' +
        'nativeInputValueSetter.call(arguments[0], arguments[1]);' +
        'arguments[0].dispatchEvent(new Event("input", { bubbles: true }));' +
        'arguments[0].dispatchEvent(new Event("change", { bubbles: true }));',
        input, String(valor)
    );
}

async function definirData(driver, input, valor) {
    await driver.executeScript(
        'const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;' +
        'set.call(arguments[0], arguments[1]);' +
        'arguments[0].dispatchEvent(new Event("input", { bubbles: true }));' +
        'arguments[0].dispatchEvent(new Event("change", { bubbles: true }));',
        input, valor
    );
}

module.exports = async function runRescisaoTest(driver) {
    const { Select } = require('selenium-webdriver/lib/select');

    await driver.findElement(By.css('[data-testid="nav-rescisao"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="rescisao-form"]')),
        5000
    );

    const inputSalario      = await driver.findElement(By.css('[data-testid="salario-bruto"]'));
    const inputDias         = await driver.findElement(By.css('[data-testid="dias-trabalhados"]'));
    const inputDataAdmissao = await driver.findElement(By.css('[data-testid="data-admissao"]'));
    const inputDataRescisao = await driver.findElement(By.css('[data-testid="data-rescisao"]'));
    const inputTipo         = await driver.findElement(By.css('[data-testid="tipo-rescisao"]'));
    const submit            = await driver.findElement(By.css('[data-testid="rescisao-submit"]'));

    console.log('▶ Teste: Rescisão com salário inválido');
    await setValor(driver, inputSalario, '');
    await setValor(driver, inputDias, '30');
    await definirData(driver, inputDataAdmissao, '2022-01-10');
    await definirData(driver, inputDataRescisao, '2024-05-20');
    await new Select(inputTipo).selectByValue('semJustaCausa');
    await submit.click();
    const erroSal = await driver.wait(until.elementLocated(By.css('[data-testid="rescisao-error"]')), 5000);
    if (!(await erroSal.getText()).includes('salário bruto válido')) throw new Error(`Msg inesperada: "${await erroSal.getText()}"`);
    await tiraFoto(driver, 'ETEC11-rescisao-erro-salario');
    console.log('✓ Salário inválido OK');

    console.log('▶ Teste: Rescisão válida');
    await setValor(driver, inputSalario, '3000');
    await setValor(driver, inputDias, '30');
    await driver.sleep(300);
    await submit.click();
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="rescisao-error"]'));
        if (erros.length > 0) {
            const msg = await erros[0].getText();
            if (msg && msg.trim() !== '') throw new Error(`API retornou erro: "${msg}"`);
        }
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-rescisao-sucesso');
    console.log('✓ Rescisão válida OK');
};
