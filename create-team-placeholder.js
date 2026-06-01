const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'app/public/ocl/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Created assets directory');
}

// Create a simple SVG placeholder that looks professional
const svgPlaceholder = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="480" fill="url(#grad1)"/>

  <!-- Group photo circle background -->
  <circle cx="300" cy="240" r="140" fill="rgba(255,255,255,0.15)"/>

  <!-- Team text overlay -->
  <text x="300" y="200" font-family="Inter, sans-serif" font-size="48" font-weight="800" fill="white" text-anchor="middle">TIME 5</text>
  <text x="300" y="260" font-family="Inter, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.9">Calculadora de Óculos</text>
  <text x="300" y="310" font-family="Inter, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.8">Vitor Hugo • Guilherme • Henrique</text>

  <!-- Footer info -->
  <text x="300" y="450" font-family="'JetBrains Mono', monospace" font-size="14" fill="white" text-anchor="middle" opacity="0.7">GCEIC 102 • 2026</text>
</svg>`;

const svgPath = path.join(assetsDir, 'time5-grupo.svg');
fs.writeFileSync(svgPath, svgPlaceholder, 'utf8');
console.log('✅ Created SVG placeholder at: app/public/ocl/assets/time5-grupo.svg');

// Also create a note file
const noteContent = `# Foto do Time 5

Substitua este arquivo SVG pela foto real do time.

Para adicionar a foto real:
1. Salve a foto em: app/public/ocl/assets/time5-grupo.jpg (ou .png)
2. A página carregará automaticamente

Ou mantenha o SVG se preferir o design minimalista.

---

A página sobre.ejs está configurada para carregar:
- app/public/ocl/assets/time5-grupo.jpg (prioritário)
- app/public/ocl/assets/time5-grupo.svg (fallback)
`;

const notePath = path.join(assetsDir, 'README.md');
fs.writeFileSync(notePath, noteContent, 'utf8');
console.log('✅ Created README at: app/public/ocl/assets/README.md');

console.log('\n✨ Setup concluído!');
console.log('A página sobre.ejs agora tem placeholder visual pronto.');
console.log('Substitua a imagem SVG pela foto real quando tiver.');
