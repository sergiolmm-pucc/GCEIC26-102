const runFreteLoginTest = require("./frete.login.test.js");
const runFreteNavigationTest = require("./frete.navegacao.test.js");
const runFreteCalculationTest = require("./frete.calcular.test.js");

async function runFreteTests() {
  console.log("\n--- Iniciando testes do Time_14(Frete) - Login ---");
  await runFreteLoginTest();

  console.log("\n--- Iniciando testes do Time_14(Frete) - Navegação ---");
  await runFreteNavigationTest();

  console.log("\n--- Iniciando testes do Time_14(Frete) - Cálculo ---");
  await runFreteCalculationTest();

  console.log("\n--- Testes do Time_14(Frete) finalizados ---");
}

module.exports = runFreteTests;

if (require.main === module) {
  runFreteTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}