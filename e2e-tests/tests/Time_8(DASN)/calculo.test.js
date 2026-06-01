const { Builder, By, until } = require('selenium-webdriver');

(async function testDASN() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('http://localhost:3000/DASN/login');

        // Login
        await driver.findElement(By.name('usuario')).sendKeys('admin');
        await driver.findElement(By.name('senha')).sendKeys('1234');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/DASN/calculo'), 5000);

        // Bloco 1: Validação de Limite Anual
        await driver.findElement(By.id('comercio')).sendKeys('40000');
        await driver.findElement(By.id('servicos')).sendKeys('20000');
        await driver.findElement(By.id('meses')).sendKeys('12');
        await driver.findElement(By.css('#limiteForm button[type="submit"]')).click();
        
        let resultadoLimite = await driver.findElement(By.id('resultadoLimite'));
        await driver.wait(until.elementTextContains(resultadoLimite, '60000.00'), 5000);

        // Bloco 2: Multa por Atraso
        await driver.findElement(By.id('mesesAtraso')).sendKeys('2');
        await driver.findElement(By.css('#multaForm button[type="submit"]')).click();
        
        let resultadoMulta = await driver.findElement(By.id('resultadoMulta'));
        await driver.wait(until.elementTextContains(resultadoMulta, '50.00'), 5000);

        // Bloco 3: Lucro Isento e Tributável
        await driver.findElement(By.id('lucroServicos')).sendKeys('10000');
        await driver.findElement(By.id('despesas')).sendKeys('2000');
        await driver.findElement(By.css('#lucroForm button[type="submit"]')).click();
        
        let resultadoLucro = await driver.findElement(By.id('resultadoLucro'));
        await driver.wait(until.elementTextContains(resultadoLucro, '4800.00'), 5000);

        console.log(' Teste E2E DASN-SIMEI: PASSOU EM TODOS OS MÓDULOS');
        
    } catch (err) {
        console.error(' Erro no teste:', err);
    } finally {
        await driver.quit();
    }
})();