const { prisma } = require('../lib/prisma');

const CAMPOS = ['nome', 'codigo', 'descricao', 'responsavel', 'observacoes'];

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

const includeResponsavel = { responsavelPessoa: { select: { id: true, nome: true } } };

function mapArea(r) {
  const out = { ...defaults(), ...r };
  out.responsavelNome = r.responsavelPessoa ? r.responsavelPessoa.nome : null;
  if (out.responsavelPessoa) delete out.responsavelPessoa;
  return out;
}

async function listar() {
  try {
    const rows = await prisma.area.findMany({
      orderBy: { nome: 'asc' },
      include: includeResponsavel,
    });
    return rows.map(mapArea);
  } catch (_err) {
    const rows = await prisma.area.findMany({ orderBy: { nome: 'asc' } });
    return rows.map((r) => ({ ...defaults(), ...r, responsavelNome: null }));
  }
}

async function getById(id) {
  try {
    const r = await prisma.area.findUnique({ where: { id }, include: includeResponsavel });
    if (!r) return null;
    return mapArea(r);
  } catch (_err) {
    const r = await prisma.area.findUnique({ where: { id } });
    return r ? { ...defaults(), ...r, responsavelNome: null } : null;
  }
}

function toData(dados) {
  const data = normalizar(dados);
  const responsavelId = dados.responsavelId != null && String(dados.responsavelId).trim()
    ? String(dados.responsavelId).trim()
    : null;
  return { ...data, responsavelId };
}

async function criar(dados) {
  const data = toData(dados);
  const { responsavelId, ...rest } = data;
  try {
    const novo = await prisma.area.create({
      data: { ...rest, responsavelId: responsavelId || undefined },
    });
    return getById(novo.id);
  } catch (_err) {
    const novo = await prisma.area.create({ data: rest });
    return getById(novo.id);
  }
}

async function atualizar(id, dados) {
  const existente = await prisma.area.findUnique({ where: { id } });
  if (!existente) return null;
  const data = toData(dados);
  const { responsavelId, ...rest } = data;
  try {
    await prisma.area.update({
      where: { id },
      data: { ...rest, responsavelId: responsavelId || null },
    });
  } catch (_err) {
    await prisma.area.update({ where: { id }, data: rest });
  }
  return getById(id);
}

async function remover(id) {
  try {
    await prisma.area.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
