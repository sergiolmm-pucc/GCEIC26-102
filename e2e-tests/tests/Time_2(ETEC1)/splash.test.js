const {tiraFoto, buildDriver,BASE_URL} = require("./helpers");

let driver;

async function main() {

    try {
        driver = await buildDriver(driver);

        await driver.manage().setTimeouts({
            implicit: 5000,
            pageLoad: 15000
        });

        const url = `${BASE_URL}/ETEC1/splash`;

        await driver.get(url);

        await tiraFoto(driver, 'ETEC1-splash-01-aberta');

        await driver.sleep(4000);

        await tiraFoto(driver, 'ETEC1-splash-02-apos-espera');

        const current2 = await driver.getCurrentUrl();

        if (!current2.includes('/login')) {
            throw new Error(
                `Esperava redirecionamento para /login, mas foi para ${current2}`
            );
        }

        await tiraFoto(driver, 'ETEC1-splash-03-redirecionada');
    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main()
    .then(() => console.log('✅ (Time_2) - Tela Splash testada com sucesso!'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });