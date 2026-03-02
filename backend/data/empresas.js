const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'empresas.json');

const CAMPOS = [
  'cnpj',
  'razaoSocial',
  'nomeFantasia',
  'dataAbertura',
  'naturezaJuridicaCodigo',
  'naturezaJuridicaDescricao',
  'atividadePrincipalCodigo',
  'atividadePrincipalDescricao',
  'atividadesSecundarias',
  'situacaoCadastral',
  'dataSituacaoCadastral',
  'motivoSituacaoCadastral',
  'logradouro',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'uf',
  'cep',
  'telefone',
  'email',
  'capitalSocial',
  'porte',
  'inscricaoEstadual',
  'inscricaoMunicipal',
  'nomeResponsavel',
  'observacoes',
];

function defaults() {
  return {
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    dataAbertura: '',
    naturezaJuridicaCodigo: '',
    naturezaJuridicaDescricao: '',
    atividadePrincipalCodigo: '',
    atividadePrincipalDescricao: '',
    atividadesSecundarias: '',
    situacaoCadastral: '',
    dataSituacaoCadastral: '',
    motivoSituacaoCadastral: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
    capitalSocial: '',
    porte: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    nomeResponsavel: '',
    observacoes: '',
  };
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
  if (id == null || id === '') return null;
  const idStr = String(id).trim();
  const item = read().find((x) => String(x.id) === idStr);
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
