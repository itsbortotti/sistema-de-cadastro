const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'capex.json');

const CLASSIFICACOES_VALIDAS = ['capex', 'opex'];

function read() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    fs.writeFileSync(FILE, '[]');
    return [];
  }
}

function normalizarItem(item) {
  const u = { ...item };
  if (!CLASSIFICACOES_VALIDAS.includes(u.classificacao)) u.classificacao = 'capex';
  if (!Array.isArray(u.entradas)) u.entradas = [];
  u.entradas = u.entradas.map((e) => ({
    id: e.id || String(Date.now()) + Math.random().toString(36).slice(2),
    valor: e.valor != null && e.valor !== '' ? Number(e.valor) : 0,
    periodo: e.periodo != null ? String(e.periodo).trim() : '',
  }));
  u.produtoSoftwareIds = normalizarIds(u.produtoSoftwareIds);
  u.projetoIds = normalizarIds(u.projetoIds);
  return u;
}

function somaEntradas(entradas) {
  if (!Array.isArray(entradas)) return 0;
  return entradas.reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function listar() {
  return read().map(normalizarItem);
}

function getById(id) {
  const item = read().find((x) => x.id === id) || null;
  return item ? normalizarItem({ ...item }) : null;
}

function normalizarIds(v) {
  if (Array.isArray(v)) return v.filter((id) => id != null && String(id).trim() !== '').map((id) => String(id).trim());
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? normalizarIds(parsed) : [];
    } catch {
      return v.trim() ? [v.trim()] : [];
    }
  }
  return [];
}

function criar(dados) {
  const lista = read();
  const id = String(Date.now());
  const areaId = dados.areaId && String(dados.areaId).trim() ? String(dados.areaId).trim() : null;
  const classificacao = CLASSIFICACOES_VALIDAS.includes(dados.classificacao) ? dados.classificacao : 'capex';
  const fornecedorId = dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null;
  const valor = dados.valor != null && dados.valor !== '' ? Number(dados.valor) : null;
  const dataInicio = dados.dataInicio && String(dados.dataInicio).trim() ? String(dados.dataInicio).trim() : null;
  const dataFim = dados.dataFim && String(dados.dataFim).trim() ? String(dados.dataFim).trim() : null;
  const produtoSoftwareIds = normalizarIds(dados.produtoSoftwareIds || []);
  const projetoIds = normalizarIds(dados.projetoIds || []);
  const observacoes = dados.observacoes != null ? String(dados.observacoes).trim() : '';

  const novo = {
    id,
    areaId,
    classificacao,
    fornecedorId,
    valor,
    dataInicio,
    dataFim,
    produtoSoftwareIds,
    projetoIds,
    observacoes,
    entradas: [],
  };
  lista.push(novo);
  write(lista);
  return normalizarItem(novo);
}

function atualizar(id, dados) {
  const lista = read();
  const idx = lista.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const atual = lista[idx];

  if (dados.areaId !== undefined) atual.areaId = dados.areaId && String(dados.areaId).trim() ? String(dados.areaId).trim() : null;
  if (dados.classificacao !== undefined && CLASSIFICACOES_VALIDAS.includes(dados.classificacao)) atual.classificacao = dados.classificacao;
  if (dados.fornecedorId !== undefined) atual.fornecedorId = dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null;
  if (dados.valor !== undefined) atual.valor = dados.valor !== '' && dados.valor != null ? Number(dados.valor) : null;
  if (dados.dataInicio !== undefined) atual.dataInicio = dados.dataInicio && String(dados.dataInicio).trim() ? String(dados.dataInicio).trim() : null;
  if (dados.dataFim !== undefined) atual.dataFim = dados.dataFim && String(dados.dataFim).trim() ? String(dados.dataFim).trim() : null;
  if (dados.produtoSoftwareIds !== undefined) atual.produtoSoftwareIds = normalizarIds(dados.produtoSoftwareIds);
  if (dados.projetoIds !== undefined) atual.projetoIds = normalizarIds(dados.projetoIds);
  if (dados.observacoes !== undefined) atual.observacoes = String(dados.observacoes).trim();
  if (Array.isArray(dados.entradas)) {
    atual.entradas = dados.entradas.map((e) => ({
      id: e.id || String(Date.now()) + Math.random().toString(36).slice(2),
      valor: e.valor != null && e.valor !== '' ? Number(e.valor) : 0,
      periodo: e.periodo != null ? String(e.periodo).trim() : '',
    }));
    const soma = somaEntradas(atual.entradas);
    const valorMax = Number(atual.valor) || 0;
    if (soma > valorMax) throw new Error(`A soma das entradas (${soma.toFixed(2)}) não pode superar o valor total do Capex/Opex (${valorMax.toFixed(2)}).`);
  }

  write(lista);
  return normalizarItem(atual);
}

function remover(id) {
  const lista = read().filter((x) => x.id !== id);
  if (lista.length === read().length) return false;
  write(lista);
  return true;
}

module.exports = { listar, getById, criar, atualizar, remover };
