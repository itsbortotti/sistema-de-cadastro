const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'projetos.json');
const CAMPOS = ['nome', 'descricao', 'empresaId', 'dataInicio', 'dataFim', 'status', 'observacoes', 'produtoSoftwareIds'];

function defaults() {
  return {
    nome: '',
    descricao: '',
    empresaId: null,
    dataInicio: null,
    dataFim: null,
    status: '',
    observacoes: '',
    produtoSoftwareIds: [],
  };
}

function normalizar(item) {
  const d = defaults();
  if (!item || typeof item !== 'object') return d;
  if (item.nome !== undefined && item.nome !== null) d.nome = String(item.nome).trim();
  if (item.descricao !== undefined && item.descricao !== null) d.descricao = String(item.descricao).trim();
  if (item.empresaId !== undefined && item.empresaId !== null && String(item.empresaId).trim()) d.empresaId = String(item.empresaId).trim();
  else d.empresaId = null;
  if (item.dataInicio !== undefined && item.dataInicio !== null && String(item.dataInicio).trim()) d.dataInicio = String(item.dataInicio).trim();
  else d.dataInicio = null;
  if (item.dataFim !== undefined && item.dataFim !== null && String(item.dataFim).trim()) d.dataFim = String(item.dataFim).trim();
  else d.dataFim = null;
  if (item.status !== undefined && item.status !== null) d.status = String(item.status).trim();
  if (item.observacoes !== undefined && item.observacoes !== null) d.observacoes = String(item.observacoes).trim();
  if (Array.isArray(item.produtoSoftwareIds)) {
    d.produtoSoftwareIds = item.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean);
  } else {
    d.produtoSoftwareIds = [];
  }
  return d;
}

function read() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(data) ? data.map((x) => ({ ...defaults(), ...x, ...normalizar(x) })) : [];
  } catch {
    fs.writeFileSync(FILE, '[]');
    return [];
  }
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function listar() {
  return read();
}

function getById(id) {
  const item = read().find((x) => x.id === id);
  return item ? { ...defaults(), ...item, ...normalizar(item) } : null;
}

function criar(dados) {
  const lista = read();
  const id = String(Date.now());
  const novo = { id, ...defaults(), ...normalizar(dados) };
  lista.push(novo);
  write(lista);
  return novo;
}

function atualizar(id, dados) {
  const lista = read();
  const idx = lista.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const atual = lista[idx];
  const atualizado = { ...atual, ...normalizar(dados) };
  lista[idx] = atualizado;
  write(lista);
  return { ...defaults(), ...atualizado };
}

function remover(id) {
  const lista = read().filter((x) => x.id !== id);
  if (lista.length === read().length) return false;
  write(lista);
  return true;
}

module.exports = { listar, getById, criar, atualizar, remover };
