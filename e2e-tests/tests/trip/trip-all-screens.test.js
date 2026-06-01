const { By, until } = require("selenium-webdriver");

async function runTripTests(driver, tiraFoto) {
    console.log("Acessando a página do módulo Trip...");
    // Ajuste a rota de acordo com o link do seu menu ou botão do frontend
    await driver.get((process.env.APP_URL || "http://localhost:3000") + "/equipe-1"); 
    await driver.sleep(3000); // Aguarda splash + renderização do formulário de login
    tiraFoto("Trip_Inicio_Tela");

    // --- TESTANDO LOGIN E O FORMULÁRIO DE CUSTO DE COMBUSTÍVEL ---
    try {
        console.log("Realizando login no módulo Trip...");
        await driver.findElement(By.id("loginUsername")).sendKeys("admin");
        await driver.findElement(By.id("loginPassword")).sendKeys("1234");
        await driver.findElement(By.css("#loginForm button[type='submit']")).click();
        await driver.sleep(800);

        console.log("Preenchendo dados de custo de combustível...");
        await driver.findElement(By.id("km")).sendKeys("200");
        await driver.findElement(By.id("autonomy")).sendKeys("10");
        await driver.findElement(By.id("gasPrice")).sendKeys("5.50");
        await driver.findElement(By.id("alcPrice")).sendKeys("3.80");
        
        tiraFoto("Trip_Formulario_Preenchido");

        // Clica no botão de calcular custo
        await driver.findElement(By.css("#calcForm button[type='submit']")).click();
        await driver.sleep(800); // Aguarda o cálculo e resposta da API
        
        tiraFoto("Trip_Resultado_Calculo_Custo");
    } catch (err) {
        console.error("Erro nos testes visuais do Trip:", err.message);
        tiraFoto("Trip_Erro_Execucao");
        throw err;
    }
}

module.exports = runTripTests;