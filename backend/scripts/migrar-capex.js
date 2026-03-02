const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'capex.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const migrated = data.map((item) => {
  const ano = item.ano != null ? Number(item.ano) : new Date().getFullYear();
  const tipo = item.tipo === 'infraestrutura' ? 'infraestrutura' : 'sistema';
  return {
    id: item.id,
    areaId: item.areaId || null,
    classificacao: tipo === 'infraestrutura' ? 'opex' : 'capex',
    modelo: tipo,
    fornecedorId: item.fornecedorId || null,
    valor: item.valor != null ? item.valor : null,
    dataInicio: ano ? `${ano}-01-01` : null,
    dataFim: ano ? `${ano}-12-31` : null,
    produtoSoftwareIds: [],
    observacoes: '',
  };
});
fs.writeFileSync(FILE, JSON.stringify(migrated, null, 2));
console.log('Migrados', migrated.length, 'registros.');
