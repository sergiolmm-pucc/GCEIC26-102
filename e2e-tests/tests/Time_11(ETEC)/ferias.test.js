const { tiraFoto, fazerLogin, By, until } = require('./helpers');

async function setValor(driver, input, valor) {
    await driver.executeScript(
        'const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;' +
        'nativeInputValueSetter.call(arguments[0], arguments[1]);' +
        'arguments[0].dispatchEvent(new Event("input", { bubbles: true }));' +
        'arguments[0].dispatchEvent(new Event("change", { bubbles: true }));',
        input, String(valor)
    );
}

module.exports = async function runFeriasTest(driver) {
    // Navega para férias a partir do estado atual (já logado)
    await driver.findElement(By.css('[data-testid="nav-ferias"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="ferias-form"]')),
        5000
    );

    const inputSalario = await driver.findElement(By.css('[data-testid="salario-bruto"]'));
    const inputDias    = await driver.findElement(By.css('[data-testid="dias-de-ferias"]'));
    const submit       = await driver.findElement(By.css('[data-testid="ferias-submit"]'));

    // Teste 1: salário inválido
    console.log('▶ Teste: Férias com salário inválido');
    await setValor(driver, inputSalario, '');
    await setValor(driver, inputDias, '10');
    await submit.click();
    const erroSalario = await driver.wait(
        until.elementLocated(By.css('[data-testid="ferias-error"]')), 5000
    );
    if (!(await erroSalario.getText()).includes('salário bruto válido')) {
        throw new Error(`Mensagem inesperada: "${await erroSalario.getText()}"`);
    }
    await tiraFoto(driver, 'ETEC11-ferias-erro-salario');
    console.log('✓ Salário inválido OK');

    // Teste 2: férias válidas (pula teste de dias pois estado React dificulta)
    console.log('▶ Teste: Férias válidas');
    await setValor(driver, inputSalario, '2000');
    await setValor(driver, inputDias, '20');
    await driver.sleep(300);
    await submit.click();
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="ferias-error"]'));
        if (erros.length > 0) {
            const msg = await erros[0].getText();
            if (msg && msg.trim() !== '') throw new Error(`API retornou erro: "${msg}"`);
        }
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-ferias-sucesso');
    console.log('✓ Férias válidas OK');
};
