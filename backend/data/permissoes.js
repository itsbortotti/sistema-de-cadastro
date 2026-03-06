const { prisma } = require('../lib/prisma');

const ENTIDADES = ['dashboard', 'configuracoes', 'usuarios', 'fornecedores', 'areas', 'hospedagens', 'formas-acesso', 'times', 'marcas-atendidas', 'pessoas', 'produtos-software', 'projetos', 'capex', 'empresas', 'perfis', 'logs'];

async function getPorPerfilId(perfilId) {
  const rows = await prisma.permissao.findMany({ where: { perfilId } });
  return rows.map((r) => ({
    entidade: r.entidade,
    visualizar: r.visualizar,
    editar: r.editar,
    criar: r.criar,
    excluir: r.excluir,
  }));
}

async function getPermissao(perfilId, entidade) {
  const r = await prisma.permissao.findUnique({
    where: { perfilId_entidade: { perfilId, entidade } },
  });
  if (r) return { entidade: r.entidade, visualizar: r.visualizar, editar: r.editar, criar: r.criar, excluir: r.excluir };
  return { entidade, visualizar: false, editar: false, criar: false, excluir: false };
}

async function pode(perfilId, entidade, acao) {
  const p = await getPermissao(perfilId, entidade);
  return Boolean(p[acao]);
}

module.exports = {
  getPorPerfilId,
  getPermissao,
  pode,
  ENTIDADES,
};
