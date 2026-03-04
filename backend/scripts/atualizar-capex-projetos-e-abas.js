/**
 * Script: associa Capex a projetos e distribui entradas; distribui entradas no Opex também.
 * Assim Capex e Opex aparecem nas três abas: sem valores / com saldo / saldo usado.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'capex.json');
const PROJETO_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const capexOnly = data.filter((x) => (x.classificacao || 'capex') === 'capex');
const opexItems = data.filter((x) => (x.classificacao || '') === 'opex');

let projetoIndex = 0;
const out = [];

// Processar Opex: datas + distribuir entradas nas três abas (sem / com saldo / saldo usado)
const tercosOpex = Math.max(1, Math.floor(opexItems.length / 3));
for (let i = 0; i < opexItems.length; i++) {
  const item = { ...opexItems[i] };
  const valor = Number(item.valor) || 0;
  const ano = item.dataInicio ? item.dataInicio.substring(0, 4) : '2025';

  item.dataInicio = item.dataInicio && /^\d{4}-\d{2}-\d{2}$/.test(item.dataInicio) ? item.dataInicio : `${ano}-01-01`;
  item.dataFim = item.dataFim && /^\d{4}-\d{2}-\d{2}$/.test(item.dataFim) ? item.dataFim : `${ano}-12-31`;

  if (i < tercosOpex) {
    item.entradas = [];
  } else if (i < tercosOpex * 2) {
    const parcial = valor > 0 ? Math.floor(valor * 0.4) : 10000;
    item.entradas = [
      { id: `e-${item.id}-1`, valor: parcial, periodo: '01/' + ano.substring(2) },
    ];
  } else {
    const total = valor > 0 ? valor : 10000;
    item.entradas = [
      { id: `e-${item.id}-1`, valor: Math.floor(total * 0.6), periodo: '01/' + ano.substring(2) },
      { id: `e-${item.id}-2`, valor: total - Math.floor(total * 0.6), periodo: '02/' + ano.substring(2) },
    ];
  }

  out.push(item);
}

// Processar Capex: projetoIds, datas e entradas distribuídas
const tercos = Math.max(1, Math.floor(capexOnly.length / 3));
for (let i = 0; i < capexOnly.length; i++) {
  const item = { ...capexOnly[i] };
  const valor = Number(item.valor) || 0;
  const ano = item.dataInicio ? String(item.dataInicio).substring(0, 4) : '2025';

  item.projetoIds = [PROJETO_IDS[projetoIndex % PROJETO_IDS.length]];
  projetoIndex++;

  item.dataInicio = item.dataInicio && /^\d{4}-\d{2}-\d{2}$/.test(item.dataInicio) ? item.dataInicio : `${ano}-01-01`;
  item.dataFim = item.dataFim && /^\d{4}-\d{2}-\d{2}$/.test(item.dataFim) ? item.dataFim : `${ano}-12-31`;

  if (i < tercos) {
    item.entradas = [];
  } else if (i < tercos * 2) {
    const parcial = valor > 0 ? Math.floor(valor * 0.4) : 10000;
    item.entradas = [
      { id: `e-${item.id}-1`, valor: parcial, periodo: '01/' + ano.substring(2) },
    ];
  } else {
    const total = valor > 0 ? valor : 10000;
    item.entradas = [
      { id: `e-${item.id}-1`, valor: Math.floor(total * 0.6), periodo: '01/' + ano.substring(2) },
      { id: `e-${item.id}-2`, valor: total - Math.floor(total * 0.6), periodo: '02/' + ano.substring(2) },
    ];
  }

  out.push(item);
}

// Manter ordem original: primeiro capex na ordem do arquivo, depois opex
const ordemOriginal = data.map((x) => x.id);
const byId = {};
out.forEach((x) => { byId[x.id] = x; });
const result = ordemOriginal.map((id) => byId[id]).filter(Boolean);

fs.writeFileSync(FILE, JSON.stringify(result, null, 2));
const nCapex = result.filter((x) => x.classificacao === 'capex').length;
const nOpex = result.filter((x) => x.classificacao === 'opex').length;
console.log('Atualizado:', nCapex, 'Capex (projetos + entradas em 3 abas);', nOpex, 'Opex (entradas em 3 abas).');
