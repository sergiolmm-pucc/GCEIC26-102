const { tiraFoto, limparCampo, fazerLogin, By, until } = require('./helpers');

module.exports = async function runFeriasTest(driver) {

    await driver.findElement(By.css('[data-testid="nav-ferias"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="ferias-form"]')),
        5000
    );

    console.log('▶ Teste: Férias com salário inválido');
    const inputSalario = await driver.findElement(By.css('[data-testid="salario-bruto"]'));
    const inputDias    = await driver.findElement(By.css('[data-testid="dias-de-ferias"]'));
    const submit       = await driver.findElement(By.css('[data-testid="ferias-submit"]'));

    await limparCampo(inputSalario);
    await inputSalario.sendKeys('-1');
    await limparCampo(inputDias);
    await inputDias.sendKeys('10');
    await submit.click();
    const erroSalario = await driver.wait(
        until.elementLocated(By.css('[data-testid="ferias-error"]')), 5000
    );
    const textoSalario = await erroSalario.getText();
    if (!textoSalario.includes('salário bruto válido')) {
        throw new Error(`Mensagem inesperada: "${textoSalario}"`);
    }
    await tiraFoto(driver, 'ETEC11-ferias-erro-salario');
    console.log('✓ Salário inválido OK');

    console.log('▶ Teste: Férias com dias vazio');
    await limparCampo(inputSalario);
    await inputSalario.sendKeys('2000');
    await limparCampo(inputDias);
    await submit.click();
    const erroDias = await driver.wait(
        until.elementLocated(By.css('[data-testid="ferias-error"]')), 5000
    );
    const textoDias = await erroDias.getText();
    if (!textoDias.includes('Dias Concedidos deve ser um número entre 10 e 30')) {
        throw new Error(`Mensagem inesperada: "${textoDias}"`);
    }
    await tiraFoto(driver, 'ETEC11-ferias-erro-dias');
    console.log('✓ Dias inválido OK');

    console.log('▶ Teste: Férias válidas');
    await limparCampo(inputSalario);
    await inputSalario.sendKeys('2000');
    await limparCampo(inputDias);
    await inputDias.sendKeys('20');
    await submit.click();
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="ferias-error"]'));
        if (erros.length > 0) {
            const msg = await erros[0].getText();
            throw new Error(`API retornou erro: "${msg}"`);
        }
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-ferias-sucesso');
    console.log('✓ Férias válidas OK');
};
