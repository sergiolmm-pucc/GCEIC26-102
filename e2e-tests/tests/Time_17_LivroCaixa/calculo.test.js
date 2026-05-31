const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function tiraFoto(driver, name) {
    try {
        const img = await driver.takeScreenshot();
        const filePath = path.join(SCREENSHOTS_DIR, `LivroCaixa-${name}.png`);
        fs.writeFileSync(filePath, img, 'base64');
        console.log(` Foto guardada: LivroCaixa-${name}.png`);
    } catch (e) {
        console.warn(` Erro ao tirar a foto ${name}:`, e);
    }
}

(async function testLivroCaixa() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('http://localhost:3000/livrocaixa/login');
        await tiraFoto(driver, '01-login-pagina');

        // Preenchimento do Login
        await driver.findElement(By.name('usuario')).sendKeys('admin');
        await driver.findElement(By.name('senha')).sendKeys('1234');
        await tiraFoto(driver, '02-login-preenchido');
        
        // Submissão do Login
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('/livrocaixa/calculo'), 5000);
        await tiraFoto(driver, '03-dashboard-calculo-carregado');

        // Bloco 1: Livro Caixa Rural
        await driver.findElement(By.id('lcReceita')).sendKeys('50000');
        await driver.findElement(By.id('lcDespesa')).sendKeys('20000');
        await driver.findElement(By.id('lcInvestimento')).sendKeys('5000');
        await driver.findElement(By.css('#livroForm button[type="submit"]')).click();
        
        let resultadoLivroCaixa = await driver.findElement(By.id('resultadoLivroCaixa'));
        await driver.wait(until.elementTextContains(resultadoLivroCaixa, '35000.00'), 5000);
        await tiraFoto(driver, '04-resultado-livro-caixa');

        // Bloco 2: Prejuízo Acumulado
        await driver.findElement(By.id('paResultadoAno')).sendKeys('40000');
        await driver.findElement(By.id('paPrejuizo')).sendKeys('15000');
        await driver.findElement(By.css('#prejuizoForm button[type="submit"]')).click();
        
        let resultadoCompensação = await driver.findElement(By.id('resultadoCompensação'));
        await driver.wait(until.elementTextContains(resultadoCompensação, '25000.00'), 5000);
        await tiraFoto(driver, '05-resultado-prejuizo-acumulado');

        // Bloco 3: Limite de Arbitramento
        await driver.findElement(By.id('laReceita')).sendKeys('100000');
        await driver.findElement(By.css('#limiteForm button[type="submit"]')).click();
        
        let resultadoLimite = await driver.findElement(By.id('resultadoLimite'));
        await driver.wait(until.elementTextContains(resultadoLimite, '20000.00'), 5000);
        await tiraFoto(driver, '06-resultado-limite-arbitramento');

        console.log(' Teste E2E Livro Caixa: PASSOU EM TODOS OS MÓDULOS');
        
    } catch (err) {
        // Tira uma foto de erro caso o teste falhe em alguma etapa
        await tiraFoto(driver, 'erro-falha-teste');
        console.error(' Erro no teste:', err);
    } finally {
        await driver.quit();
    }
})();