const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'app/views/Time_17_LivroCaixa/dist');
const destDir = path.join(__dirname, 'app/views/Time_17_LivroCaixa');

function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    copyDirSync(srcDir, destDir);
    // Remove a pasta dist depois de copiar
    fs.rmSync(srcDir, { recursive: true, force: true });
    console.log("Arquivos movidos com sucesso!");
} catch (e) {
    console.error("Erro ao mover:", e);
}