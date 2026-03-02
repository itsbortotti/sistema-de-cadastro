const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'capex.json');

const PERIODOS_VALIDOS = ['anual', 'semestral', 'mensal'];
const TIPOS_VALIDOS = ['infraestrutura', 'sistema'];

function read() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
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
  return read().find((x) => x.id === id) || null;
}

function criar(dados) {
  const lista = read();
  const id = String(Date.now());
  const areaId = dados.areaId && String(dados.areaId).trim() ? String(dados.areaId).trim() : null;
  const periodo = PERIODOS_VALIDOS.includes(dados.periodo) ? dados.periodo : 'mensal';
  const tipo = TIPOS_VALIDOS.includes(dados.tipo) ? dados.tipo : 'sistema';
  const fornecedorId = dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null;
  const valor = dados.valor != null && dados.valor !== '' ? Number(dados.valor) : null;
  const ano = dados.ano != null && dados.ano !== '' ? Number(dados.ano) : null;

  const novo = {
    id,
    areaId,
    periodo,
    tipo,
    fornecedorId,
    valor,
    ano,
  };
  lista.push(novo);
  write(lista);
  return novo;
}

function atualizar(id, dados) {
  const lista = read();
  const idx = lista.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const atual = lista[idx];

  if (dados.areaId !== undefined) atual.areaId = dados.areaId && String(dados.areaId).trim() ? String(dados.areaId).trim() : null;
  if (dados.periodo !== undefined && PERIODOS_VALIDOS.includes(dados.periodo)) atual.periodo = dados.periodo;
  if (dados.tipo !== undefined && TIPOS_VALIDOS.includes(dados.tipo)) atual.tipo = dados.tipo;
  if (dados.fornecedorId !== undefined) atual.fornecedorId = dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null;
  if (dados.valor !== undefined) atual.valor = dados.valor !== '' && dados.valor != null ? Number(dados.valor) : null;
  if (dados.ano !== undefined) atual.ano = dados.ano !== '' && dados.ano != null ? Number(dados.ano) : null;

  write(lista);
  return atual;
}

function remover(id) {
  const lista = read().filter((x) => x.id !== id);
  if (lista.length === read().length) return false;
  write(lista);
  return true;
}

module.exports = { listar, getById, criar, atualizar, remover };
