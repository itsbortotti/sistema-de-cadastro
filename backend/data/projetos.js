const { prisma } = require('../lib/prisma');

function defaults() {
  return {
    nome: '',
    descricao: '',
    empresaId: null,
    dataInicio: null,
    dataFim: null,
    status: '',
    observacoes: '',
    produtoSoftwareIds: [],
  };
}

function normalizar(dados) {
  const d = defaults();
  if (!dados || typeof dados !== 'object') return d;
  if (dados.nome !== undefined && dados.nome !== null) d.nome = String(dados.nome).trim();
  if (dados.descricao !== undefined && dados.descricao !== null) d.descricao = String(dados.descricao).trim();
  if (dados.empresaId !== undefined && dados.empresaId !== null && String(dados.empresaId).trim()) d.empresaId = String(dados.empresaId).trim();
  else d.empresaId = null;
  if (dados.dataInicio !== undefined && dados.dataInicio !== null && String(dados.dataInicio).trim()) d.dataInicio = String(dados.dataInicio).trim();
  else d.dataInicio = null;
  if (dados.dataFim !== undefined && dados.dataFim !== null && String(dados.dataFim).trim()) d.dataFim = String(dados.dataFim).trim();
  else d.dataFim = null;
  if (dados.status !== undefined && dados.status !== null) d.status = String(dados.status).trim();
  if (dados.observacoes !== undefined && dados.observacoes !== null) d.observacoes = String(dados.observacoes).trim();
  if (Array.isArray(dados.produtoSoftwareIds)) {
    d.produtoSoftwareIds = dados.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean);
  } else {
    d.produtoSoftwareIds = [];
  }
  return d;
}

function toResponse(projeto) {
  if (!projeto) return null;
  const psIds = projeto.produtosSoftware ? projeto.produtosSoftware.map((p) => p.id) : [];
  return {
    id: projeto.id,
    nome: projeto.nome,
    descricao: projeto.descricao,
    empresaId: projeto.empresaId,
    dataInicio: projeto.dataInicio,
    dataFim: projeto.dataFim,
    status: projeto.status,
    observacoes: projeto.observacoes,
    produtoSoftwareIds: psIds,
  };
}

async function listar() {
  const rows = await prisma.projeto.findMany({
    include: { produtosSoftware: { select: { id: true } } },
    orderBy: { nome: 'asc' },
  });
  return rows.map(toResponse);
}

async function getById(id) {
  const r = await prisma.projeto.findUnique({
    where: { id },
    include: { produtosSoftware: { select: { id: true } } },
  });
  return toResponse(r);
}

async function criar(dados) {
  const d = normalizar(dados);
  const novo = await prisma.projeto.create({
    data: {
      nome: d.nome,
      descricao: d.descricao,
      empresaId: d.empresaId,
      dataInicio: d.dataInicio,
      dataFim: d.dataFim,
      status: d.status,
      observacoes: d.observacoes,
      produtosSoftware: d.produtoSoftwareIds.length
        ? { connect: d.produtoSoftwareIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { produtosSoftware: { select: { id: true } } },
  });
  return toResponse(novo);
}

async function atualizar(id, dados) {
  const existente = await prisma.projeto.findUnique({ where: { id }, include: { produtosSoftware: true } });
  if (!existente) return null;
  const d = normalizar({ ...existente, produtoSoftwareIds: existente.produtosSoftware?.map((p) => p.id) || [], ...dados });
  const atualizado = await prisma.projeto.update({
    where: { id },
    data: {
      nome: d.nome,
      descricao: d.descricao,
      empresaId: d.empresaId,
      dataInicio: d.dataInicio,
      dataFim: d.dataFim,
      status: d.status,
      observacoes: d.observacoes,
      produtosSoftware: { set: d.produtoSoftwareIds.map((id) => ({ id })) },
    },
    include: { produtosSoftware: { select: { id: true } } },
  });
  return toResponse(atualizado);
}

async function remover(id) {
  try {
    await prisma.projeto.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
