const { prisma } = require('../lib/prisma');

async function listar() {
  const perfis = await prisma.perfil.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { usuarios: true } } },
  });
  return perfis.map((p) => ({
    id: p.id,
    nome: p.nome,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    usuariosCount: p._count.usuarios,
  }));
}

async function getById(id) {
  const perfil = await prisma.perfil.findUnique({
    where: { id },
    include: { permissoes: true },
  });
  if (!perfil) return null;
  return {
    id: perfil.id,
    nome: perfil.nome,
    createdAt: perfil.createdAt,
    updatedAt: perfil.updatedAt,
    permissoes: perfil.permissoes.map((r) => ({
      entidade: r.entidade,
      visualizar: r.visualizar,
      editar: r.editar,
      criar: r.criar,
      excluir: r.excluir,
    })),
  };
}

async function getByNome(nome, excludeId = null) {
  const perfil = await prisma.perfil.findFirst({
    where: { nome: nome.trim(), ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  return perfil;
}

async function criar(dados) {
  const nome = (dados.nome || '').trim();
  if (!nome) return null;
  const existente = await getByNome(nome);
  if (existente) return null;
  const { ENTIDADES } = require('./permissoes');
  const perfil = await prisma.perfil.create({
    data: { nome },
  });
  for (const entidade of ENTIDADES) {
    await prisma.permissao.create({
      data: {
        perfilId: perfil.id,
        entidade,
        visualizar: true,
        editar: false,
        criar: false,
        excluir: false,
      },
    });
  }
  return getById(perfil.id);
}

async function atualizar(id, dados) {
  const existente = await prisma.perfil.findUnique({ where: { id } });
  if (!existente) return null;
  const updateData = {};
  if (dados.nome !== undefined) {
    const nome = String(dados.nome).trim();
    if (nome) {
      const outro = await getByNome(nome, id);
      if (outro) return null;
      updateData.nome = nome;
    }
  }
  if (Object.keys(updateData).length > 0) {
    await prisma.perfil.update({ where: { id }, data: updateData });
  }
  if (Array.isArray(dados.permissoes)) {
    const { ENTIDADES } = require('./permissoes');
    const validas = dados.permissoes.filter((r) => ENTIDADES.includes(r.entidade));
    for (const r of validas) {
      await prisma.permissao.upsert({
        where: {
          perfilId_entidade: { perfilId: id, entidade: r.entidade },
        },
        create: {
          perfilId: id,
          entidade: r.entidade,
          visualizar: Boolean(r.visualizar),
          editar: Boolean(r.editar),
          criar: Boolean(r.criar),
          excluir: Boolean(r.excluir),
        },
        update: {
          visualizar: Boolean(r.visualizar),
          editar: Boolean(r.editar),
          criar: Boolean(r.criar),
          excluir: Boolean(r.excluir),
        },
      });
    }
  }
  return getById(id);
}

async function remover(id) {
  const existente = await prisma.perfil.findUnique({
    where: { id },
    include: { _count: { select: { usuarios: true } } },
  });
  if (!existente) return false;
  if (existente._count.usuarios > 0) return false;
  await prisma.perfil.delete({ where: { id } });
  return true;
}

module.exports = {
  listar,
  getById,
  getByNome,
  criar,
  atualizar,
  remover,
};
