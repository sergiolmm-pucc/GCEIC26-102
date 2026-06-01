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

module.exports = async function runDecimoTest(driver) {

    await driver.findElement(By.css('[data-testid="nav-decimo"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="decimo-terceiro-form"]')),
        5000
    );

    const inputSalario = await driver.findElement(By.css('[data-testid="salario-bruto"]'));
    const inputMeses   = await driver.findElement(By.css('[data-testid="meses-trabalhados"]'));
    const submit       = await driver.findElement(By.css('[data-testid="decimo-terceiro-submit"]'));

    console.log('▶ Teste: Salário inválido');
    await setValor(driver, inputSalario, '');
    await setValor(driver, inputMeses, '4');
    await submit.click();
    const erroSalario = await driver.wait(
        until.elementLocated(By.css('[data-testid="decimo-terceiro-error"]')), 5000
    );
    if (!(await erroSalario.getText()).includes('válido')) {
        throw new Error(`Mensagem inesperada: "${await erroSalario.getText()}"`);
    }
    await tiraFoto(driver, 'ETEC11-decimo-salario-erro');
    console.log('✓ Salário inválido OK');

    console.log('▶ Teste: 13° válido');
    await setValor(driver, inputSalario, '2000');
    await setValor(driver, inputMeses, '12');
    await driver.sleep(300);
    await submit.click();
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="decimo-terceiro-error"]'));
        if (erros.length > 0) {
            const msg = await erros[0].getText();
            if (msg && msg.trim() !== '') throw new Error(`API retornou erro: "${msg}"`);
        }
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-decimo-sucesso');
    console.log('✓ 13° válido OK');
};
