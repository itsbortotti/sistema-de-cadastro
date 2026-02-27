const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'hospedagens.json');
const CAMPOS = ['nome', 'tipo', 'provedor', 'descricao', 'observacoes'];

const INICIAIS = [
  { id: '1', nome: 'Cloud', tipo: '', provedor: '', descricao: '', observacoes: '' },
  { id: '2', nome: 'On Premises', tipo: '', provedor: '', descricao: '', observacoes: '' },
  { id: '3', nome: 'Híbrido', tipo: '', provedor: '', descricao: '', observacoes: '' },
];

function defaults() {
  return { nome: '', tipo: '', provedor: '', descricao: '', observacoes: '' };
}

function normalizar(item) {
  const d = defaults();
  if (!item || typeof item !== 'object') return d;
  CAMPOS.forEach((c) => {
    if (item[c] !== undefined && item[c] !== null) d[c] = String(item[c]).trim();
  });
  return d;
}

function read() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const arr = Array.isArray(data) ? data : INICIAIS;
    return arr.map((x) => ({ ...defaults(), ...x, ...normalizar(x) }));
  } catch {
    fs.writeFileSync(FILE, JSON.stringify(INICIAIS, null, 2));
    return INICIAIS.map((x) => ({ ...defaults(), ...x }));
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
  return item ? { ...defaults(), ...item } : null;
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
  CAMPOS.forEach((c) => {
    if (dados[c] !== undefined) atual[c] = String(dados[c]).trim();
  });
  if (dados.nome !== undefined) atual.nome = String(dados.nome).trim();
  write(lista);
  return { ...defaults(), ...atual };
}

function remover(id) {
  const lista = read().filter((x) => x.id !== id);
  if (lista.length === read().length) return false;
  write(lista);
  return true;
}

module.exports = { listar, getById, criar, atualizar, remover };
