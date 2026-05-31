const { execSync } = require('child_process');
const path = require('path');

async function runEtec1Tests() {
    const arquivosDeTeste = [
        'splash.test.js',
        'login-invalido.test.js',
        'login-valido.test.js',
        'calculo.test.js',
        'sobre.test.js',
        'ajuda.test.js'
    ];

    arquivosDeTeste.forEach((arquivo, index) => {
        const caminhoArquivo = path.join(__dirname, arquivo);

        console.log(`\nExecutando TESTE (${index + 1}/${arquivosDeTeste.length}): ${arquivo}...`);

        try {
            execSync(`node "${caminhoArquivo}"`, { stdio: 'inherit' });
        } catch (error) {
            console.error(`❌ Falha detectada no subteste: ${arquivo}`);
            throw new Error(`A suite do ETEC1 falhou no arquivo: ${arquivo} (${index + 1}/${arquivosDeTeste.length})`);
        }
    });

    console.log('\n✅ Todos os testes do Time_2(ETEC1) concluídos!');
}

module.exports = runEtec1Tests;