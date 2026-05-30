const { tiraFoto, limparCampo, fazerLogin, By, until, Key } = require('./helpers');

async function definirData(driver, input, valor) {
    await driver.executeScript(
        'const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;' +
        'set.call(arguments[0], arguments[1]);' +
        'arguments[0].dispatchEvent(new Event("input", { bubbles: true }));',
        input, valor
    );
}

module.exports = async function runRescisaoTest(driver) {
    const { Select } = require('selenium-webdriver/lib/select');

    await fazerLogin(driver);

    await driver.findElement(By.css('[data-testid="nav-rescisao"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="rescisao-form"]')),
        5000
    );

    async function preencher(salario, dias, admissao, rescisao, tipo) {
        const inputSalario      = await driver.findElement(By.css('[data-testid="salario-bruto"]'));
        const inputDias         = await driver.findElement(By.css('[data-testid="dias-trabalhados"]'));
        const inputDataAdmissao = await driver.findElement(By.css('[data-testid="data-admissao"]'));
        const inputDataRescisao = await driver.findElement(By.css('[data-testid="data-rescisao"]'));
        const inputTipo         = await driver.findElement(By.css('[data-testid="tipo-rescisao"]'));
        const submit            = await driver.findElement(By.css('[data-testid="rescisao-submit"]'));

        await limparCampo(inputSalario);
        if (salario !== '' && salario != null) await inputSalario.sendKeys(String(salario));
        await limparCampo(inputDias);
        if (dias !== '' && dias != null) await inputDias.sendKeys(String(dias));
        await definirData(driver, inputDataAdmissao, admissao || '');
        await definirData(driver, inputDataRescisao, rescisao || '');
        if (tipo !== '' && tipo != null) await new Select(inputTipo).selectByValue(tipo);
        await submit.click();
    }

    console.log('▶ Teste: Rescisão com salário vazio');
    await preencher('', 30, '2022-01-10', '2024-05-20', 'semJustaCausa');
    const erroSal = await driver.wait(until.elementLocated(By.css('[data-testid="rescisao-error"]')), 5000);
    if (!(await erroSal.getText()).includes('salário bruto válido')) throw new Error(`Msg inesperada: "${await erroSal.getText()}"`);
    await tiraFoto(driver, 'ETEC11-rescisao-erro-salario');
    console.log('✓ Salário inválido OK');

    console.log('▶ Teste: Rescisão com data admissão vazia');
    await preencher(2000, 30, '', '2024-05-20', 'semJustaCausa');
    const erroAdm = await driver.wait(until.elementLocated(By.css('[data-testid="rescisao-error"]')), 5000);
    if (!(await erroAdm.getText()).includes('data de admissão')) throw new Error(`Msg inesperada: "${await erroAdm.getText()}"`);
    await tiraFoto(driver, 'ETEC11-rescisao-erro-data-admissao');
    console.log('✓ Data admissão inválida OK');

    console.log('▶ Teste: Rescisão com data rescisão vazia');
    await preencher(2000, 30, '2022-01-10', '', 'semJustaCausa');
    const erroRes = await driver.wait(until.elementLocated(By.css('[data-testid="rescisao-error"]')), 5000);
    if (!(await erroRes.getText()).includes('data de rescisão')) throw new Error(`Msg inesperada: "${await erroRes.getText()}"`);
    await tiraFoto(driver, 'ETEC11-rescisao-erro-data-rescisao');
    console.log('✓ Data rescisão inválida OK');

    console.log('▶ Teste: Rescisão com dias vazio');
    await preencher(2000, '', '2022-01-10', '2024-05-20', 'semJustaCausa');
    const erroDias = await driver.wait(until.elementLocated(By.css('[data-testid="rescisao-error"]')), 5000);
    if (!(await erroDias.getText()).includes('Dias Trabalhados é obrigatório')) throw new Error(`Msg inesperada: "${await erroDias.getText()}"`);
    await tiraFoto(driver, 'ETEC11-rescisao-erro-dias');
    console.log('✓ Dias inválido OK');

    console.log('▶ Teste: Rescisão válida');
    await preencher(3000, 30, '2022-01-10', '2024-05-20', 'semJustaCausa');
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="rescisao-error"]'));
        if (erros.length > 0) throw new Error(`API retornou erro: "${await erros[0].getText()}"`);
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-rescisao-sucesso');
    console.log('✓ Rescisão válida OK');
};
