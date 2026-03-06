const { prisma } = require('../lib/prisma');

const CAMPOS = [
  'nome', 'razaoSocial', 'nomeFantasia', 'cnpj', 'cpf', 'email', 'telefone', 'celular',
  'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep', 'site', 'contato', 'observacoes',
];

function defaults() {
  return Object.fromEntries(CAMPOS.map((c) => [c, '']));
}

function normalizar(dados) {
  const d = defaults();
  if (!dados || typeof dados !== 'object') return d;
  CAMPOS.forEach((c) => {
    if (dados[c] !== undefined && dados[c] !== null) d[c] = String(dados[c]).trim();
  });
  return d;
}

async function listar() {
  const rows = await prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
  return rows.map((r) => ({ ...defaults(), ...r }));
}

async function getById(id) {
  const r = await prisma.fornecedor.findUnique({ where: { id } });
  return r ? { ...defaults(), ...r } : null;
}

async function criar(dados) {
  const data = normalizar(dados);
  const novo = await prisma.fornecedor.create({ data });
  return { ...defaults(), ...novo };
}

async function atualizar(id, dados) {
  const existente = await prisma.fornecedor.findUnique({ where: { id } });
  if (!existente) return null;
  const updateData = {};
  CAMPOS.forEach((c) => {
    if (dados[c] !== undefined) updateData[c] = String(dados[c]).trim();
  });
  const atualizado = await prisma.fornecedor.update({ where: { id }, data: updateData });
  return { ...defaults(), ...atualizado };
}

async function remover(id) {
  try {
    await prisma.fornecedor.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
