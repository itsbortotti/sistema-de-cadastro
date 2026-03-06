const { prisma } = require('../lib/prisma');

async function listar() {
  return prisma.marcaAtendida.findMany({
    orderBy: { nome: 'asc' },
  });
}

async function getById(id) {
  return prisma.marcaAtendida.findUnique({ where: { id } });
}

async function criar(dados) {
  const nome = (dados.nome || '').trim();
  if (!nome) return null;
  return prisma.marcaAtendida.create({
    data: { nome },
  });
}

async function atualizar(id, dados) {
  const existente = await prisma.marcaAtendida.findUnique({ where: { id } });
  if (!existente) return null;
  const nome = (dados.nome || '').trim();
  if (!nome) return existente;
  return prisma.marcaAtendida.update({
    where: { id },
    data: { nome },
  });
}

async function remover(id) {
  try {
    await prisma.marcaAtendida.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
