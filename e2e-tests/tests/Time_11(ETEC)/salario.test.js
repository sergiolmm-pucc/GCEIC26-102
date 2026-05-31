const { tiraFoto, fazerLogin, By, until } = require('./helpers');

async function setValor(driver, input, valor) {
    await driver.executeScript(
        'const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;' +
        'set.call(arguments[0], arguments[1]);' +
        'arguments[0].dispatchEvent(new Event("input", { bubbles: true }));',
        input, String(valor)
    );
}

module.exports = async function runSalarioTest(driver) {
    await fazerLogin(driver);

    await driver.findElement(By.css('[data-testid="nav-salario"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="salario-form"]')),
        5000
    );

    const input = await driver.findElement(By.css('[data-testid="salario-bruto"]'));
    const submit = await driver.findElement(By.css('[data-testid="salario-submit"]'));

    console.log('▶ Teste: Salário inválido');
    await setValor(driver, input, '');
    await submit.click();
    const erro = await driver.wait(
        until.elementLocated(By.css('[data-testid="salario-error"]')),
        5000
    );
    const texto = await erro.getText();
    if (!texto.includes('válido')) {
        throw new Error(`Mensagem inesperada: "${texto}"`);
    }
    await tiraFoto(driver, 'ETEC11-salario-erro');
    console.log('✓ Salário inválido OK');

    console.log('▶ Teste: Salário válido');
    await setValor(driver, input, '2000');
    await submit.click();
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="salario-error"]'));
        if (erros.length > 0) {
            const msg = await erros[0].getText();
            throw new Error(`API retornou erro: "${msg}"`);
        }
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-salario-sucesso');
    console.log('✓ Salário válido OK');
};
