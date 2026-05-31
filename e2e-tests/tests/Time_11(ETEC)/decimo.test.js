const { tiraFoto, limparCampo, By, until } = require('./helpers');
 
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
    await limparCampo(inputSalario);
    await inputSalario.sendKeys('-1');
    await limparCampo(inputMeses);
    await inputMeses.sendKeys('4');
    await submit.click();
    const erroSalario = await driver.wait(
        until.elementLocated(By.css('[data-testid="decimo-terceiro-error"]')), 5000
    );
    if (!(await erroSalario.getText()).includes('válido')) {
        throw new Error(`Mensagem inesperada: "${await erroSalario.getText()}"`);
    }
    await tiraFoto(driver, 'ETEC11-decimo-salario-erro');
    console.log('✓ Salário inválido OK');
 
    console.log('▶ Teste: 13° com meses inválido');
    await limparCampo(inputSalario);
    await inputSalario.sendKeys('2000');
    await limparCampo(inputMeses);
    await inputMeses.sendKeys('0');
    await submit.click();
    const erroMeses = await driver.wait(
        until.elementLocated(By.css('[data-testid="decimo-terceiro-error"]')), 5000
    );
    if (!(await erroMeses.getText()).includes('entre 1 e 12')) {
        throw new Error(`Mensagem inesperada: "${await erroMeses.getText()}"`);
    }
    await tiraFoto(driver, 'ETEC11-decimo-erro-meses');
    console.log('✓ Meses inválido OK');
 
    console.log('▶ Teste: 13° com mês 13');
    await limparCampo(inputMeses);
    await inputMeses.sendKeys('13');
    await submit.click();
    const erroMes13 = await driver.wait(
        until.elementLocated(By.css('[data-testid="decimo-terceiro-error"]')), 5000
    );
    if (!(await erroMes13.getText()).includes('entre 1 e 12')) {
        throw new Error(`Mensagem inesperada: "${await erroMes13.getText()}"`);
    }
    await tiraFoto(driver, 'ETEC11-decimo-erro-mes-13');
    console.log('✓ Mês 13 inválido OK');
 
    console.log('▶ Teste: 13° válido');
    await limparCampo(inputMeses);
    await inputMeses.sendKeys('12');
    await submit.click();
    await driver.wait(async () => {
        const erros = await driver.findElements(By.css('[data-testid="decimo-terceiro-error"]'));
        if (erros.length > 0) throw new Error(`API retornou erro: "${await erros[0].getText()}"`);
        const els = await driver.findElements(By.xpath("//*[contains(text(), 'Resultado')]"));
        return els.length > 0;
    }, 8000);
    await tiraFoto(driver, 'ETEC11-decimo-sucesso');
    console.log('✓ 13° válido OK');
};