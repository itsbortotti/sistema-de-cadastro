const { prisma } = require('../lib/prisma');
const { LOGS_MAX_LIMIT, LOGS_DEFAULT_LIMIT } = require('../config/constants');

async function listar(opcoes = {}) {
  const { limite = LOGS_DEFAULT_LIMIT, offset = 0, tipo } = opcoes;
  const where = tipo ? { tipo } : {};
  const take = Math.min(Math.max(0, Number(limite) || LOGS_DEFAULT_LIMIT), LOGS_MAX_LIMIT);
  const skip = Math.max(0, Number(offset) || 0);
  const logs = await prisma.log.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    include: { usuario: { select: { id: true, nome: true, login: true } } },
  });
  return logs.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    descricao: l.descricao,
    createdAt: l.createdAt,
    usuarioId: l.usuarioId,
    usuarioNome: l.usuario?.nome || l.usuario?.login || '—',
  }));
}

async function criar(dados) {
  const { tipo, descricao, usuarioId } = dados;
  const log = await prisma.log.create({
    data: {
      tipo: tipo || 'edicao',
      descricao: String(descricao ?? ''),
      usuarioId: usuarioId || null,
    },
  });
  return log;
}

module.exports = { listar, criar };
