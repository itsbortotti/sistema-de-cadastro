const { prisma } = require('../lib/prisma');

async function listar() {
  return prisma.produtoSoftware.findMany({
    orderBy: { nomeSistema: 'asc' },
    include: { marcasAtendidas: { select: { id: true, nome: true } } },
  });
}

async function getById(id) {
  return prisma.produtoSoftware.findUnique({
    where: { id },
    include: { marcasAtendidas: { select: { id: true, nome: true } } },
  });
}

function toData(dados) {
  return {
    nomeSistema: dados.nomeSistema || '',
    empresaId: dados.empresaId && String(dados.empresaId).trim() ? String(dados.empresaId).trim() : null,
    fornecedorId: dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null,
    finalidadePrincipal: dados.finalidadePrincipal || '',
    breveDescritivo: dados.breveDescritivo || '',
    usuariosQtdAproximada: dados.usuariosQtdAproximada != null ? Number(dados.usuariosQtdAproximada) : null,
    areaId: dados.areaId && String(dados.areaId).trim() ? dados.areaId : null,
    responsavelTiId: dados.responsavelTiId && String(dados.responsavelTiId).trim() ? dados.responsavelTiId : null,
    usuarioNegocioId: dados.usuarioNegocioId && String(dados.usuarioNegocioId).trim() ? dados.usuarioNegocioId : null,
    responsavelTiPessoaId: dados.responsavelTiPessoaId && String(dados.responsavelTiPessoaId).trim() ? dados.responsavelTiPessoaId : null,
    responsavelNegocioPessoaId: dados.responsavelNegocioPessoaId && String(dados.responsavelNegocioPessoaId).trim() ? dados.responsavelNegocioPessoaId : null,
    hospedagemId: dados.hospedagemId && String(dados.hospedagemId).trim() ? dados.hospedagemId : null,
    onPremisesSites: dados.onPremisesSites || '',
    formaAcessoId: dados.formaAcessoId && String(dados.formaAcessoId).trim() ? dados.formaAcessoId : null,
    integracoes: dados.integracoes || '',
    controleAcessoPorUsuario: Boolean(dados.controleAcessoPorUsuario),
    autenticacaoAdSso: Boolean(dados.autenticacaoAdSso),
    grauSatisfacao: dados.grauSatisfacao != null ? String(dados.grauSatisfacao) : null,
    tiMe: dados.tiMe && ['tolerar', 'investir', 'migrar', 'eliminar'].includes(String(dados.tiMe).toLowerCase()) ? String(dados.tiMe).toLowerCase() : null,
    problemasEnfrentados: dados.problemasEnfrentados || '',
    custoMensalSistema: dados.custoMensalSistema != null && dados.custoMensalSistema !== '' ? Number(dados.custoMensalSistema) : null,
    custoMensalInfraestrutura: dados.custoMensalInfraestrutura != null && dados.custoMensalInfraestrutura !== '' ? Number(dados.custoMensalInfraestrutura) : null,
    timeId: dados.timeId && String(dados.timeId).trim() ? dados.timeId : null,
    dataInicio: dados.dataInicio && String(dados.dataInicio).trim() ? String(dados.dataInicio).trim() : null,
    dataFim: dados.dataFim && String(dados.dataFim).trim() ? String(dados.dataFim).trim() : null,
  };
}

function getMarcasAtendidasConnect(dados) {
  const ids = Array.isArray(dados.marcasAtendidasIds) ? dados.marcasAtendidasIds : [];
  const validIds = ids.filter((id) => id && String(id).trim()).map((id) => ({ id: String(id).trim() }));
  return validIds.length ? { set: validIds } : { set: [] };
}

async function criar(dados) {
  const data = { ...toData(dados), marcasAtendidas: getMarcasAtendidasConnect(dados) };
  return prisma.produtoSoftware.create({
    data,
  });
}

async function atualizar(id, dados) {
  const existente = await prisma.produtoSoftware.findUnique({ where: { id } });
  if (!existente) return null;
  const data = { ...toData({ ...existente, ...dados }), marcasAtendidas: getMarcasAtendidasConnect({ ...existente, ...dados }) };
  return prisma.produtoSoftware.update({
    where: { id },
    data,
  });
}

async function remover(id) {
  try {
    await prisma.produtoSoftware.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
