const { BASE_URL, tiraFoto, By, until } = require('./helpers');

module.exports = async function runLoginTest(driver) {
    console.log('▶ Teste: login inválido');
    await driver.get(`${BASE_URL}/ETEC11`);
    await driver.wait(
        until.elementLocated(By.css('[data-testid="login-form"]')),
        10000
    );
    await driver.findElement(By.css('[data-testid="login-user"]')).sendKeys('errado');
    await driver.findElement(By.css('[data-testid="login-pass"]')).sendKeys('errado');
    await driver.findElement(By.css('[data-testid="login-submit"]')).click();
    const erro = await driver.wait(
        until.elementLocated(By.css('[data-testid="login-error"]')),
        5000
    );
    const texto = await erro.getText();
    if (!texto.includes('incorretos')) {
        throw new Error(`Mensagem inesperada: "${texto}"`);
    }
    await tiraFoto(driver, 'ETEC11-login-invalido');
    console.log('✓ Login inválido OK');

    console.log('▶ Teste: login válido');
    const userInput = await driver.findElement(By.css('[data-testid="login-user"]'));
    const passInput = await driver.findElement(By.css('[data-testid="login-pass"]'));
    await userInput.clear();
    await userInput.sendKeys('admin');
    await passInput.clear();
    await passInput.sendKeys('1234');
    await driver.findElement(By.css('[data-testid="login-submit"]')).click();
    await driver.wait(
        until.elementLocated(By.css('[data-testid="main-app"]')),
        5000
    );
    await tiraFoto(driver, 'ETEC11-login-sucesso');
    console.log('✓ Login válido OK');
};
