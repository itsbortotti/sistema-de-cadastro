const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');

function toUsuario(u) {
  if (!u) return null;
  const { senhaHash, ...rest } = u;
  const tipo = u.perfil?.nome ? (u.perfil.nome === 'Administrador' ? 'admin' : u.perfil.nome === 'Apenas visualização' ? 'visualizacao' : 'membro') : 'membro';
  return { ...rest, tipo, perfilId: u.perfilId, perfilNome: u.perfil?.nome, email: rest.email || '' };
}

async function getUsuarios() {
  const list = await prisma.usuario.findMany({
    orderBy: { nome: 'asc' },
    include: { perfil: true },
  });
  return list.map(toUsuario);
}

async function getById(id) {
  const u = await prisma.usuario.findUnique({
    where: { id },
    include: { perfil: true },
  });
  return u ? toUsuario(u) : null;
}

async function getByLogin(login, excludeId = null) {
  const u = await prisma.usuario.findFirst({
    where: { login, ...(excludeId ? { id: { not: excludeId } } : {}) },
    include: { perfil: true },
  });
  return u;
}

async function criar(dados) {
  const perfilId = dados.perfilId || (await prisma.perfil.findFirst({ where: { nome: 'Membro' } }))?.id;
  if (!perfilId) throw new Error('Perfil inválido');
  const senhaHash = bcrypt.hashSync(dados.senha || '123456', 10);
  const novo = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      login: dados.login,
      email: dados.email != null ? String(dados.email).trim() : '',
      senhaHash,
      perfilId,
    },
    include: { perfil: true },
  });
  return toUsuario(novo);
}

async function atualizar(id, dados) {
  const existente = await prisma.usuario.findUnique({ where: { id } });
  if (!existente) return null;
  const updateData = {};
  if (dados.nome !== undefined) updateData.nome = dados.nome;
  if (dados.login !== undefined) updateData.login = dados.login;
  if (dados.email !== undefined) updateData.email = String(dados.email).trim();
  if (dados.perfilId !== undefined) updateData.perfilId = dados.perfilId;
  if (dados.senha) updateData.senhaHash = bcrypt.hashSync(dados.senha, 10);
  const u = await prisma.usuario.update({
    where: { id },
    data: updateData,
    include: { perfil: true },
  });
  return toUsuario(u);
}

async function remover(id) {
  try {
    await prisma.usuario.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getUsuarios,
  getById,
  getByLogin,
  criar,
  atualizar,
  remover,
};
