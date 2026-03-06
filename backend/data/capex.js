const { prisma } = require('../lib/prisma');

const CLASSIFICACOES_VALIDAS = ['capex', 'opex'];

function normalizarIds(v) {
  if (Array.isArray(v)) return v.filter((id) => id != null && String(id).trim() !== '').map((id) => String(id).trim());
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? normalizarIds(parsed) : [];
    } catch {
      return v.trim() ? [v.trim()] : [];
    }
  }
  return [];
}

function somaEntradas(entradas) {
  if (!Array.isArray(entradas)) return 0;
  return entradas.reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
}

function toResponse(c) {
  if (!c) return null;
  const entradas = (c.entradas || []).map((e) => ({
    id: e.id,
    valor: e.valor,
    periodo: e.periodo || '',
  }));
  const projetoIds = (c.projetos || []).map((p) => p.id);
  const produtoSoftwareIds = (c.produtosSoftware || []).map((p) => p.id);
  return {
    id: c.id,
    areaId: c.areaId,
    classificacao: c.classificacao,
    fornecedorId: c.fornecedorId,
    valor: c.valor,
    dataInicio: c.dataInicio,
    dataFim: c.dataFim,
    observacoes: c.observacoes || '',
    entradas,
    projetoIds,
    produtoSoftwareIds,
  };
}

async function listar() {
  const rows = await prisma.capex.findMany({
    include: {
      entradas: true,
      projetos: { select: { id: true } },
      produtosSoftware: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toResponse);
}

async function getById(id) {
  const r = await prisma.capex.findUnique({
    where: { id },
    include: {
      entradas: true,
      projetos: { select: { id: true } },
      produtosSoftware: { select: { id: true } },
    },
  });
  return toResponse(r);
}

async function criar(dados) {
  const areaId = dados.areaId && String(dados.areaId).trim() ? String(dados.areaId).trim() : null;
  const classificacao = CLASSIFICACOES_VALIDAS.includes(dados.classificacao) ? dados.classificacao : 'capex';
  const fornecedorId = dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null;
  const valor = dados.valor != null && dados.valor !== '' ? Number(dados.valor) : null;
  const dataInicio = dados.dataInicio && String(dados.dataInicio).trim() ? String(dados.dataInicio).trim() : null;
  const dataFim = dados.dataFim && String(dados.dataFim).trim() ? String(dados.dataFim).trim() : null;
  const produtoSoftwareIds = normalizarIds(dados.produtoSoftwareIds || []);
  const projetoIds = normalizarIds(dados.projetoIds || []);
  const observacoes = dados.observacoes != null ? String(dados.observacoes).trim() : '';

  const novo = await prisma.capex.create({
    data: {
      areaId,
      classificacao,
      fornecedorId,
      valor,
      dataInicio,
      dataFim,
      observacoes,
      projetos: projetoIds.length ? { connect: projetoIds.map((id) => ({ id })) } : undefined,
      produtosSoftware: produtoSoftwareIds.length ? { connect: produtoSoftwareIds.map((id) => ({ id })) } : undefined,
    },
    include: {
      entradas: true,
      projetos: { select: { id: true } },
      produtosSoftware: { select: { id: true } },
    },
  });
  return toResponse(novo);
}

async function atualizar(id, dados) {
  const existente = await prisma.capex.findUnique({
    where: { id },
    include: { entradas: true, projetos: true, produtosSoftware: true },
  });
  if (!existente) return null;

  const updateData = {};
  if (dados.areaId !== undefined) updateData.areaId = dados.areaId && String(dados.areaId).trim() ? String(dados.areaId).trim() : null;
  if (dados.classificacao !== undefined && CLASSIFICACOES_VALIDAS.includes(dados.classificacao)) updateData.classificacao = dados.classificacao;
  if (dados.fornecedorId !== undefined) updateData.fornecedorId = dados.fornecedorId && String(dados.fornecedorId).trim() ? String(dados.fornecedorId).trim() : null;
  if (dados.valor !== undefined) updateData.valor = dados.valor !== '' && dados.valor != null ? Number(dados.valor) : null;
  if (dados.dataInicio !== undefined) updateData.dataInicio = dados.dataInicio && String(dados.dataInicio).trim() ? String(dados.dataInicio).trim() : null;
  if (dados.dataFim !== undefined) updateData.dataFim = dados.dataFim && String(dados.dataFim).trim() ? String(dados.dataFim).trim() : null;
  if (dados.observacoes !== undefined) updateData.observacoes = String(dados.observacoes).trim();
  if (dados.produtoSoftwareIds !== undefined) {
    const ids = normalizarIds(dados.produtoSoftwareIds);
    updateData.produtosSoftware = { set: ids.map((id) => ({ id })) };
  }
  if (dados.projetoIds !== undefined) {
    const ids = normalizarIds(dados.projetoIds);
    updateData.projetos = { set: ids.map((id) => ({ id })) };
  }
  if (Array.isArray(dados.entradas)) {
    const valorMax = Number(updateData.valor ?? existente.valor) || 0;
    const soma = dados.entradas.reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
    if (soma > valorMax) {
      throw new Error(`A soma das entradas (${soma.toFixed(2)}) não pode superar o valor total do Capex/Opex (${valorMax.toFixed(2)}).`);
    }
    await prisma.capexEntrada.deleteMany({ where: { capexId: id } });
    if (dados.entradas.length > 0) {
      await prisma.capexEntrada.createMany({
        data: dados.entradas.map((e) => ({
          capexId: id,
          valor: e.valor != null && e.valor !== '' ? Number(e.valor) : 0,
          periodo: e.periodo != null ? String(e.periodo).trim() : '',
        })),
      });
    }
  }

  const atualizado = await prisma.capex.update({
    where: { id },
    data: updateData,
    include: {
      entradas: true,
      projetos: { select: { id: true } },
      produtosSoftware: { select: { id: true } },
    },
  });
  return toResponse(atualizado);
}

async function remover(id) {
  try {
    await prisma.capex.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listar, getById, criar, atualizar, remover };
