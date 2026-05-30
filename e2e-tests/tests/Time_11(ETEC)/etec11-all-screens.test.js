const { buildDriver } = require('./helpers');
const runLoginTest    = require('./login.test.js');
const runSalarioTest  = require('./salario.test.js');
const runFeriasTest   = require('./ferias.test.js');
const runDecimoTest   = require('./decimo.test.js');
const runRescisaoTest = require('./rescisao.test.js');

module.exports = async function runEtec11Tests() {
    console.log('Iniciando os testes funcionais E2E do ETEC11 (Selenium)...');
    const driver = await buildDriver();
    try {
        console.log('\n1. Testando Login...');
        await runLoginTest(driver);

        console.log('\n2. Testando Cálculo de Salário...');
        await runSalarioTest(driver);

        console.log('\n3. Testando Cálculo de Férias...');
        await runFeriasTest(driver);

        console.log('\n4. Testando Cálculo do 13° Salário...');
        await runDecimoTest(driver);

        console.log('\n5. Testando Cálculo de Rescisão...');
        await runRescisaoTest(driver);

        console.log('\nTodos os testes funcionais do ETEC11 passaram com sucesso!');
    } finally {
        console.log('Encerrando driver do Selenium...');
        await driver.quit();
    }
};
