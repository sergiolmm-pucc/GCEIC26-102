const { By, until } = require("selenium-webdriver");

async function runTripTests(driver, tiraFoto) {
    console.log("Acessando a página do módulo Trip...");
    const pageUrl = (process.env.APP_URL || "http://localhost:3000") + "/equipe-1";
    await driver.get(pageUrl);
    await driver.sleep(3000); // Aguarda splash + renderização do formulário de login
    tiraFoto("Trip_Inicio_Tela");

    try {
        console.log("Testando login inválido...");
        await driver.findElement(By.id("loginUsername")).sendKeys("user");
        await driver.findElement(By.id("loginPassword")).sendKeys("wrongpass");
        await driver.findElement(By.css("#loginForm button[type='submit']")).click();
        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        await alert.accept();
        console.log("Alerta exibido:", alertText);
        tiraFoto("Trip_Login_Invalido");

        await driver.wait(
            until.elementLocated(By.id("loginUsername")),
            10000
        );
        await driver.wait(
            until.elementIsVisible(driver.findElement(By.id("loginUsername"))),
            10000
        );

        console.log("Realizando login válido no módulo Trip...");
        const usernameField = await driver.wait(
            until.elementLocated(By.id("loginUsername")),
            10000
        );
        await driver.wait(until.elementIsVisible(usernameField), 10000);
        const passwordField = await driver.findElement(By.id("loginPassword"));
        await usernameField.clear();
        await passwordField.clear();
        await usernameField.sendKeys("admin");
        await passwordField.sendKeys("1234");
        await driver.findElement(By.css("#loginForm button[type='submit']")).click();
        await driver.sleep(1500);

        console.log("Acessando a tela Sobre a Equipe...");
        await driver.findElement(By.css("button[onclick=\"navigateTo('about')\"]")).click();
        await driver.sleep(800);
        tiraFoto("Trip_Sobre_A_Equipe");

        console.log("Acessando a tela de Ajuda...");
        await driver.findElement(By.css("button[onclick=\"navigateTo('help')\"]")).click();
        await driver.sleep(800);
        tiraFoto("Trip_Help");

        console.log("Retornando ao Dashboard...");
        await driver.findElement(By.css("button[onclick=\"navigateTo('dashboard')\"]")).click();
        await driver.sleep(800);
        tiraFoto("Trip_Dashboard");

        console.log("Testando formulário com distância zero...");
        await driver.findElement(By.id("km")).sendKeys("0");
        await driver.findElement(By.id("autonomy")).sendKeys("10");
        await driver.findElement(By.id("gasPrice")).sendKeys("5.50");
        await driver.findElement(By.id("alcPrice")).sendKeys("3.80");
        tiraFoto("Trip_DistanciaZero_Formulario");
        await driver.findElement(By.css("#calcForm button[type='submit']")).click();
        await driver.sleep(800);
        tiraFoto("Trip_Resultado_DistanciaZero");

        console.log("Preenchendo dados de custo de combustível válidos...");
        await driver.findElement(By.id("km")).clear();
        await driver.findElement(By.id("autonomy")).clear();
        await driver.findElement(By.id("gasPrice")).clear();
        await driver.findElement(By.id("alcPrice")).clear();
        await driver.findElement(By.id("km")).sendKeys("200");
        await driver.findElement(By.id("autonomy")).sendKeys("10");
        await driver.findElement(By.id("gasPrice")).sendKeys("5.50");
        await driver.findElement(By.id("alcPrice")).sendKeys("3.80");
        tiraFoto("Trip_Formulario_Preenchido");

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