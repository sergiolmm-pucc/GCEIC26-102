const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function ensureDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ lancamentos: [], categorias: [] }, null, 2));
  }
}

function load() {
  ensureDB();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Reset usado em testes
function reset() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ lancamentos: [], categorias: [] }, null, 2));
}

module.exports = { load, save, reset, DB_FILE };
