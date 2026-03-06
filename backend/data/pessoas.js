const { prisma } = require('../lib/prisma');

async function listar() {
  return prisma.pessoa.findMany({
    orderBy: { nome: 'asc' },
    include: { area: { select: { id: true, nome: true } } },
  });
}

async function getById(id) {
  return prisma.pessoa.findUnique({
    where: { id },
    include: { area: { select: { id: true, nome: true } } },
  });
}

function toData(dados) {
  const dataNascimento = dados.dataNascimento != null ? String(dados.dataNascimento).trim() : '';
  return {
    nome: (dados.nome || '').trim() || '',
    dataNascimento: dataNascimento || '',
    areaId: dados.areaId && String(dados.areaId).trim() ? dados.areaId.trim() : null,
  };
}

async function criar(dados) {
  return prisma.pessoa.create({
    data: toData(dados),
  });
}

async function atualizar(id, dados) {
  const existente = await prisma.pessoa.findUnique({ where: { id } });
  if (!existente) return null;
  return prisma.pessoa.update({
    where: { id },
    data: toData(dados),
  });
}

async function remover(id) {
  try {
    await prisma.pessoa.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
