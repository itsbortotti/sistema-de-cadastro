const { prisma } = require('../lib/prisma');

const CAMPOS = [
  'cnpj', 'razaoSocial', 'nomeFantasia', 'dataAbertura', 'naturezaJuridicaCodigo', 'naturezaJuridicaDescricao',
  'atividadePrincipalCodigo', 'atividadePrincipalDescricao', 'atividadesSecundarias', 'situacaoCadastral',
  'dataSituacaoCadastral', 'motivoSituacaoCadastral', 'logradouro', 'numero', 'complemento', 'bairro',
  'cidade', 'uf', 'cep', 'telefone', 'email', 'capitalSocial', 'porte', 'inscricaoEstadual', 'inscricaoMunicipal',
  'nomeResponsavel', 'observacoes',
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
  const rows = await prisma.empresa.findMany({ orderBy: { nomeFantasia: 'asc' } });
  return rows.map((r) => ({ ...defaults(), ...r }));
}

async function getById(id) {
  if (id == null || id === '') return null;
  const r = await prisma.empresa.findUnique({ where: { id: String(id).trim() } });
  return r ? { ...defaults(), ...r } : null;
}

async function criar(dados) {
  const data = normalizar(dados);
  const novo = await prisma.empresa.create({ data });
  return { ...defaults(), ...novo };
}

async function atualizar(id, dados) {
  const existente = await prisma.empresa.findUnique({ where: { id } });
  if (!existente) return null;
  const data = normalizar(dados);
  const atualizado = await prisma.empresa.update({ where: { id }, data });
  return { ...defaults(), ...atualizado };
}

async function remover(id) {
  try {
    await prisma.empresa.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
