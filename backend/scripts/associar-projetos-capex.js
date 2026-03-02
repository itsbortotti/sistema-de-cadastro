const fs = require('fs');
const path = require('path');
const capexPath = path.join(__dirname, '..', 'data', 'capex.json');
const produtosPath = path.join(__dirname, '..', 'data', 'produtosSoftware.json');

const capex = JSON.parse(fs.readFileSync(capexPath, 'utf8'));
const produtos = JSON.parse(fs.readFileSync(produtosPath, 'utf8'));
const produtoIds = produtos.map((p) => String(p.id)).filter(Boolean);

if (produtoIds.length === 0) {
  console.log('Nenhum projeto em produtosSoftware.json');
  process.exit(1);
}

const updated = capex.map((item, i) => ({
  ...item,
  produtoSoftwareIds: item.produtoSoftwareIds && item.produtoSoftwareIds.length > 0
    ? item.produtoSoftwareIds
    : [produtoIds[i % produtoIds.length]],
}));

fs.writeFileSync(capexPath, JSON.stringify(updated, null, 2));
console.log('Atualizados', updated.length, 'registros de Capex/Opex com pelo menos um projeto associado.');
