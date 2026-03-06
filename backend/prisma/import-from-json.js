/**
 * Script one-time: lê os JSON em data/ e importa para o PostgreSQL via Prisma.
 * Rode após: npx prisma migrate deploy
 * Uso: node prisma/import-from-json.js
 * Requer: .env com DATABASE_URL
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, '..', 'data');

function readJson(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function str(v) {
  return v != null && v !== '' ? String(v).trim() : '';
}
function num(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

async function main() {
  console.log('Lendo arquivos JSON...');
  const usuarios = readJson('usuarios');
  const permissoes = readJson('permissoes');
  const empresas = readJson('empresas');
  const fornecedores = readJson('fornecedores');
  const areas = readJson('areas');
  const hospedagens = readJson('hospedagens');
  const formasAcesso = readJson('formasAcesso');
  const times = readJson('times');
  const produtosSoftware = readJson('produtosSoftware');
  const projetos = readJson('projetos');
  const capex = readJson('capex');

  const PERFIL_IDS = { admin: 'perfil-admin', membro: 'perfil-membro', visualizacao: 'perfil-visualizacao' };
  const perfisPadrao = [
    { id: 'perfil-admin', nome: 'Administrador' },
    { id: 'perfil-membro', nome: 'Membro' },
    { id: 'perfil-visualizacao', nome: 'Apenas visualização' },
  ];
  for (const p of perfisPadrao) {
    await prisma.perfil.upsert({ where: { id: p.id }, create: p, update: { nome: p.nome } });
  }

  console.log('Importando Usuarios...');
  for (const u of usuarios) {
    if (!u.id || !u.login) continue;
    const tipo = ['admin', 'membro', 'visualizacao'].includes(u.tipo) ? u.tipo : 'membro';
    const perfilId = PERFIL_IDS[tipo];
    await prisma.usuario.upsert({
      where: { id: String(u.id) },
      create: {
        id: String(u.id),
        nome: str(u.nome) || 'Nome',
        login: str(u.login),
        email: str(u.email),
        senhaHash: str(u.senhaHash) || '$2a$10$dummy',
        perfilId,
      },
      update: {
        nome: str(u.nome) || 'Nome',
        email: str(u.email),
        perfilId,
      },
    });
  }

  console.log('Importando Permissoes...');
  for (const p of permissoes) {
    if (!p.tipo || !p.entidade) continue;
    const perfilId = PERFIL_IDS[p.tipo] || 'perfil-membro';
    await prisma.permissao.upsert({
      where: { perfilId_entidade: { perfilId, entidade: p.entidade } },
      create: {
        perfilId,
        entidade: p.entidade,
        visualizar: Boolean(p.visualizar),
        editar: Boolean(p.editar),
        criar: Boolean(p.criar),
        excluir: Boolean(p.excluir),
      },
      update: {
        visualizar: Boolean(p.visualizar),
        editar: Boolean(p.editar),
        criar: Boolean(p.criar),
        excluir: Boolean(p.excluir),
      },
    });
  }

  console.log('Importando Empresas...');
  for (const e of empresas) {
    if (!e.id) continue;
    const data = {
      cnpj: str(e.cnpj),
      razaoSocial: str(e.razaoSocial),
      nomeFantasia: str(e.nomeFantasia),
      dataAbertura: str(e.dataAbertura),
      naturezaJuridicaCodigo: str(e.naturezaJuridicaCodigo),
      naturezaJuridicaDescricao: str(e.naturezaJuridicaDescricao),
      atividadePrincipalCodigo: str(e.atividadePrincipalCodigo),
      atividadePrincipalDescricao: str(e.atividadePrincipalDescricao),
      atividadesSecundarias: str(e.atividadesSecundarias),
      situacaoCadastral: str(e.situacaoCadastral),
      dataSituacaoCadastral: str(e.dataSituacaoCadastral),
      motivoSituacaoCadastral: str(e.motivoSituacaoCadastral),
      logradouro: str(e.logradouro),
      numero: str(e.numero),
      complemento: str(e.complemento),
      bairro: str(e.bairro),
      cidade: str(e.cidade),
      uf: str(e.uf),
      cep: str(e.cep),
      telefone: str(e.telefone),
      email: str(e.email),
      capitalSocial: str(e.capitalSocial),
      porte: str(e.porte),
      inscricaoEstadual: str(e.inscricaoEstadual),
      inscricaoMunicipal: str(e.inscricaoMunicipal),
      nomeResponsavel: str(e.nomeResponsavel),
      observacoes: str(e.observacoes),
    };
    await prisma.empresa.upsert({
      where: { id: String(e.id) },
      create: { id: String(e.id), ...data },
      update: data,
    });
  }

  console.log('Importando Fornecedores...');
  for (const f of fornecedores) {
    if (!f.id) continue;
    const data = {
      nome: str(f.nome),
      razaoSocial: str(f.razaoSocial),
      nomeFantasia: str(f.nomeFantasia),
      cnpj: str(f.cnpj),
      cpf: str(f.cpf),
      email: str(f.email),
      telefone: str(f.telefone),
      celular: str(f.celular),
      endereco: str(f.endereco),
      numero: str(f.numero),
      complemento: str(f.complemento),
      bairro: str(f.bairro),
      cidade: str(f.cidade),
      estado: str(f.estado),
      cep: str(f.cep),
      site: str(f.site),
      contato: str(f.contato),
      observacoes: str(f.observacoes),
    };
    await prisma.fornecedor.upsert({
      where: { id: String(f.id) },
      create: { id: String(f.id), ...data },
      update: data,
    });
  }

  console.log('Importando Areas...');
  for (const a of areas) {
    if (!a.id) continue;
    await prisma.area.upsert({
      where: { id: String(a.id) },
      create: {
        id: String(a.id),
        nome: str(a.nome),
        codigo: str(a.codigo),
        descricao: str(a.descricao),
        responsavel: str(a.responsavel),
        observacoes: str(a.observacoes),
      },
      update: {
        nome: str(a.nome),
        codigo: str(a.codigo),
        descricao: str(a.descricao),
        responsavel: str(a.responsavel),
        observacoes: str(a.observacoes),
      },
    });
  }

  console.log('Importando Hospedagens...');
  for (const h of hospedagens) {
    if (!h.id) continue;
    await prisma.hospedagem.upsert({
      where: { id: String(h.id) },
      create: {
        id: String(h.id),
        nome: str(h.nome),
        tipo: str(h.tipo),
        provedor: str(h.provedor),
        descricao: str(h.descricao),
        observacoes: str(h.observacoes),
      },
      update: {
        nome: str(h.nome),
        tipo: str(h.tipo),
        provedor: str(h.provedor),
        descricao: str(h.descricao),
        observacoes: str(h.observacoes),
      },
    });
  }

  console.log('Importando FormasAcesso...');
  for (const fa of formasAcesso) {
    if (!fa.id) continue;
    await prisma.formaAcesso.upsert({
      where: { id: String(fa.id) },
      create: {
        id: String(fa.id),
        nome: str(fa.nome),
        descricao: str(fa.descricao),
        tipo: str(fa.tipo),
        observacoes: str(fa.observacoes),
      },
      update: {
        nome: str(fa.nome),
        descricao: str(fa.descricao),
        tipo: str(fa.tipo),
        observacoes: str(fa.observacoes),
      },
    });
  }

  console.log('Importando Times...');
  for (const t of times) {
    if (!t.id) continue;
    await prisma.time.upsert({
      where: { id: String(t.id) },
      create: {
        id: String(t.id),
        nome: str(t.nome),
        descricao: str(t.descricao),
        lider: str(t.lider),
        email: str(t.email),
        observacoes: str(t.observacoes),
      },
      update: {
        nome: str(t.nome),
        descricao: str(t.descricao),
        lider: str(t.lider),
        email: str(t.email),
        observacoes: str(t.observacoes),
      },
    });
  }

  console.log('Importando ProdutosSoftware...');
  for (const p of produtosSoftware) {
    if (!p.id) continue;
    const ano = num(p.ano);
    const dataInicio = str(p.dataInicio) || (ano ? `${ano}-01-01` : null);
    const dataFim = str(p.dataFim) || (ano ? `${ano}-12-31` : null);
    const data = {
      nomeSistema: str(p.nomeSistema),
      empresaId: str(p.empresaId) || null,
      fornecedorId: str(p.fornecedorId) || null,
      finalidadePrincipal: str(p.finalidadePrincipal),
      breveDescritivo: str(p.breveDescritivo),
      marcasAtendidas: str(p.marcasAtendidas),
      usuariosQtdAproximada: num(p.usuariosQtdAproximada),
      areaId: str(p.areaId) || null,
      responsavelTiId: str(p.responsavelTiId) || null,
      usuarioNegocioId: str(p.usuarioNegocioId) || null,
      hospedagemId: str(p.hospedagemId) || null,
      onPremisesSites: str(p.onPremisesSites),
      formaAcessoId: str(p.formaAcessoId) || null,
      integracoes: str(p.integracoes),
      controleAcessoPorUsuario: Boolean(p.controleAcessoPorUsuario),
      autenticacaoAdSso: Boolean(p.autenticacaoAdSso),
      grauSatisfacao: str(p.grauSatisfacao) || null,
      problemasEnfrentados: str(p.problemasEnfrentados),
      custoMensalSistema: num(p.custoMensalSistema),
      custoMensalInfraestrutura: num(p.custoMensalInfraestrutura),
      timeId: str(p.timeId) || null,
      dataInicio,
      dataFim,
    };
    await prisma.produtoSoftware.upsert({
      where: { id: String(p.id) },
      create: { id: String(p.id), ...data },
      update: data,
    });
  }

  console.log('Importando Projetos...');
  for (const p of projetos) {
    if (!p.id) continue;
    const produtoIds = Array.isArray(p.produtoSoftwareIds)
      ? p.produtoSoftwareIds.map((id) => String(id).trim()).filter(Boolean)
      : [];
    const data = {
      nome: str(p.nome),
      descricao: str(p.descricao),
      empresaId: str(p.empresaId) || null,
      dataInicio: str(p.dataInicio) || null,
      dataFim: str(p.dataFim) || null,
      status: str(p.status),
      observacoes: str(p.observacoes),
      produtosSoftware: produtoIds.length ? { connect: produtoIds.map((id) => ({ id })) } : undefined,
    };
    await prisma.projeto.upsert({
      where: { id: String(p.id) },
      create: { id: String(p.id), ...data },
      update: {
        nome: data.nome,
        descricao: data.descricao,
        empresaId: data.empresaId,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        status: data.status,
        observacoes: data.observacoes,
        produtosSoftware: produtoIds.length ? { set: produtoIds.map((id) => ({ id })) } : undefined,
      },
    });
  }

  console.log('Importando Capex e entradas...');
  for (const c of capex) {
    if (!c.id) continue;
    const classificacao = c.classificacao === 'opex' ? 'opex' : 'capex';
    const projetoIds = Array.isArray(c.projetoIds) ? c.projetoIds.map((id) => String(id).trim()).filter(Boolean) : [];
    const produtoIds = Array.isArray(c.produtoSoftwareIds) ? c.produtoSoftwareIds.map((id) => String(id).trim()).filter(Boolean) : [];
    const entradas = Array.isArray(c.entradas) ? c.entradas : [];

    await prisma.capex.upsert({
      where: { id: String(c.id) },
      create: {
        id: String(c.id),
        areaId: str(c.areaId) || null,
        classificacao,
        fornecedorId: str(c.fornecedorId) || null,
        valor: num(c.valor),
        dataInicio: str(c.dataInicio) || null,
        dataFim: str(c.dataFim) || null,
        observacoes: str(c.observacoes),
        projetos: projetoIds.length ? { connect: projetoIds.map((id) => ({ id })) } : undefined,
        produtosSoftware: produtoIds.length ? { connect: produtoIds.map((id) => ({ id })) } : undefined,
      },
      update: {
        areaId: str(c.areaId) || null,
        classificacao,
        fornecedorId: str(c.fornecedorId) || null,
        valor: num(c.valor),
        dataInicio: str(c.dataInicio) || null,
        dataFim: str(c.dataFim) || null,
        observacoes: str(c.observacoes),
        projetos: projetoIds.length ? { set: projetoIds.map((id) => ({ id })) } : undefined,
        produtosSoftware: produtoIds.length ? { set: produtoIds.map((id) => ({ id })) } : undefined,
      },
    });

    await prisma.capexEntrada.deleteMany({ where: { capexId: String(c.id) } });
    for (const e of entradas) {
      await prisma.capexEntrada.create({
        data: {
          capexId: String(c.id),
          valor: num(e.valor) ?? 0,
          periodo: str(e.periodo),
        },
      });
    }
  }

  console.log('Importação concluída.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
