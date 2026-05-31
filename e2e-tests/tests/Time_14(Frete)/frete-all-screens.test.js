const { execSync } = require("child_process");

async function runFreteTests() {
  console.log("\n--- Iniciando testes do Time_14(Frete) - Login ---");
  execSync('node "tests/Time_14(Frete)/frete.login.test.js"', {
    stdio: "inherit",
  });

  console.log("\n--- Iniciando testes do Time_14(Frete) - Navegação ---");
  execSync('node "tests/Time_14(Frete)/frete.navegacao.test.js"', {
    stdio: "inherit",
  });

  console.log("\n--- Iniciando testes do Time_14(Frete) - Cálculo ---");
  execSync('node "tests/Time_14(Frete)/frete.calcular.test.js"', {
    stdio: "inherit",
  });

  console.log("\n--- Testes do Time_14(Frete) finalizados ---");
}

module.exports = runFreteTests;