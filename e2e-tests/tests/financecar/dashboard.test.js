const {
    BASE_URL,
    screenshot,
    autenticar,
    By,
    until
} = require('./helpers');

async function dashboardTest(driver) {

    await autenticar(driver);

    await driver.get(BASE_URL + '/financecar/home');

    await screenshot(driver, 'home-carregando');

    await driver.wait(
        until.elementLocated(By.css('.cards-funcionalidades')),
        10000
    );

    await screenshot(driver, 'home-carregado');

    // ======================================
    // CARDS
    // ======================================
    const cards = await driver.findElements(
        By.css('.card-funcao')
    );

    if (cards.length === 0) {
        throw new Error('Nenhum card-funcao encontrado');
    }

    console.log(`✓ Home: ${cards.length} cards carregados`);

    // ======================================
    // NAVEGAÇÃO
    // ======================================
    const links = await driver.findElements(
        By.css('nav a')
    );

    if (links.length === 0) {
        throw new Error('Links de navegação não encontrados');
    }

    console.log(`✓ Home: ${links.length} links encontrados`);

    // ======================================
    // TÍTULO
    // ======================================
    const titulo = await driver.findElement(
        By.css('.hero-texto h1')
    );

    const textoTitulo = await titulo.getText();

    if (!textoTitulo.includes('FinanceCar')) {
        throw new Error(`Título incorreto: ${textoTitulo}`);
    }

    console.log(`✓ Home: título "${textoTitulo}" encontrado`);

    // ======================================
    // LOGOUT
    // ======================================
    const logout = await driver.findElements(By.css('.logout'));

    if (logout.length === 0) {
        throw new Error('Botão logout não encontrado');
    }

    console.log('✓ Home: botão logout encontrado');
}

module.exports = { dashboardTest };