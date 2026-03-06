require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ENTIDADES = ['dashboard', 'configuracoes', 'usuarios', 'fornecedores', 'areas', 'hospedagens', 'formas-acesso', 'times', 'marcas-atendidas', 'pessoas', 'produtos-software', 'projetos', 'capex', 'empresas', 'perfis', 'logs'];

const PERFIS_PADRAO = [
  { id: 'perfil-admin', nome: 'Administrador' },
  { id: 'perfil-membro', nome: 'Membro' },
  { id: 'perfil-visualizacao', nome: 'Apenas visualização' },
];

function regrasParaPerfil(perfilId) {
  const isAdmin = perfilId === 'perfil-admin';
  const isMembro = perfilId === 'perfil-membro';
  return ENTIDADES.map((entidade) => ({
    perfilId,
    entidade,
    visualizar: true,
    editar: isAdmin || isMembro,
    criar: isAdmin || isMembro,
    excluir: isAdmin,
  }));
}

async function main() {
  for (const p of PERFIS_PADRAO) {
    await prisma.perfil.upsert({
      where: { id: p.id },
      create: p,
      update: { nome: p.nome },
    });
  }
  console.log('Perfis padrão verificados');

  const existingAdmin = await prisma.usuario.findUnique({ where: { login: 'admin' } });
  if (!existingAdmin) {
    await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        login: 'admin',
        email: '',
        senhaHash: bcrypt.hashSync('admin', 10),
        perfilId: 'perfil-admin',
      },
    });
    console.log('Usuário admin criado (login: admin, senha: admin)');
  }

  for (const p of PERFIS_PADRAO) {
    for (const r of regrasParaPerfil(p.id)) {
      await prisma.permissao.upsert({
        where: { perfilId_entidade: { perfilId: r.perfilId, entidade: r.entidade } },
        create: r,
        update: { visualizar: r.visualizar, editar: r.editar, criar: r.criar, excluir: r.excluir },
      });
    }
  }
  console.log('Permissões padrão criadas/atualizadas');

  const hospedagensIniciais = [
    { nome: 'Cloud', tipo: '', provedor: '', descricao: '', observacoes: '' },
    { nome: 'On Premises', tipo: '', provedor: '', descricao: '', observacoes: '' },
    { nome: 'Híbrido', tipo: '', provedor: '', descricao: '', observacoes: '' },
  ];
  for (const h of hospedagensIniciais) {
    const existe = await prisma.hospedagem.findFirst({ where: { nome: h.nome } });
    if (!existe) {
      await prisma.hospedagem.create({ data: h });
    }
  }
  console.log('Hospedagens iniciais verificadas');

  const formasIniciais = [
    { nome: 'Web', descricao: '', tipo: '', observacoes: '' },
    { nome: 'Desktop', descricao: '', tipo: '', observacoes: '' },
    { nome: 'Mobile', descricao: '', tipo: '', observacoes: '' },
    { nome: 'API', descricao: '', tipo: '', observacoes: '' },
  ];
  for (const f of formasIniciais) {
    const existe = await prisma.formaAcesso.findFirst({ where: { nome: f.nome } });
    if (!existe) {
      await prisma.formaAcesso.create({ data: f });
    }
  }
  console.log('Formas de acesso iniciais verificadas');

  // --- Dados para apresentação do sistema (só popula se ainda não houver empresas) ---
  const totalEmpresas = await prisma.empresa.count();
  if (totalEmpresas > 0) {
    console.log('Já existem dados no banco; pulando dados de demonstração.');
    return;
  }

  const empresa1 = await prisma.empresa.create({
    data: {
      razaoSocial: 'Tecnosolve Tecnologia Ltda',
      nomeFantasia: 'Tecnosolve',
      cnpj: '12.345.678/0001-90',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310-100',
      email: 'contato@tecnosolve.com.br',
      porte: 'Média',
    },
  });
  const empresa2 = await prisma.empresa.create({
    data: {
      razaoSocial: 'Demo Indústria S.A.',
      nomeFantasia: 'Demo Indústria',
      cnpj: '98.765.432/0001-10',
      cidade: 'Curitiba',
      uf: 'PR',
      email: 'contato@demoindustria.com.br',
      porte: 'Grande',
    },
  });
  console.log('Empresas de demonstração criadas');

  const forn1 = await prisma.fornecedor.create({
    data: {
      nome: 'Microsoft Brasil',
      razaoSocial: 'Microsoft Informática Ltda',
      cnpj: '03.330.981/0001-03',
      email: 'vendas@microsoft.com',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  });
  const forn2 = await prisma.fornecedor.create({
    data: {
      nome: 'AWS Brasil',
      razaoSocial: 'Amazon Web Services do Brasil Ltda',
      email: 'contato@aws.amazon.com',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  });
  console.log('Fornecedores de demonstração criados');

  const area1 = await prisma.area.create({
    data: { nome: 'TI', codigo: 'TI', descricao: 'Tecnologia da Informação' },
  });
  const area2 = await prisma.area.create({
    data: { nome: 'Financeiro', codigo: 'FIN', descricao: 'Área financeira' },
  });
  const area3 = await prisma.area.create({
    data: { nome: 'Operações', codigo: 'OP', descricao: 'Operações e processos' },
  });
  console.log('Áreas de demonstração criadas');

  const pessoa1 = await prisma.pessoa.create({
    data: { nome: 'Carlos Silva', dataNascimento: '1985-03-15', areaId: area1.id },
  });
  const pessoa2 = await prisma.pessoa.create({
    data: { nome: 'Ana Santos', dataNascimento: '1990-07-22', areaId: area1.id },
  });
  const pessoa3 = await prisma.pessoa.create({
    data: { nome: 'Roberto Lima', dataNascimento: '1988-11-08', areaId: area2.id },
  });
  await prisma.area.update({
    where: { id: area1.id },
    data: { responsavelId: pessoa1.id },
  });
  console.log('Pessoas de demonstração criadas');

  const time1 = await prisma.time.create({
    data: { nome: 'Squad Produto', descricao: 'Time de produto e desenvolvimento', lider: 'Carlos Silva', email: 'squad@tecnosolve.com.br' },
  });
  const time2 = await prisma.time.create({
    data: { nome: 'Infraestrutura', descricao: 'Infra e cloud', lider: 'Ana Santos' },
  });
  console.log('Times de demonstração criados');

  const marca1 = await prisma.marcaAtendida.create({ data: { nome: 'Marca A' } });
  const marca2 = await prisma.marcaAtendida.create({ data: { nome: 'Marca B' } });
  console.log('Marcas atendidas criadas');

  const cloud = await prisma.hospedagem.findFirst({ where: { nome: 'Cloud' } });
  const web = await prisma.formaAcesso.findFirst({ where: { nome: 'Web' } });
  const api = await prisma.formaAcesso.findFirst({ where: { nome: 'API' } });

  const sistema1 = await prisma.produtoSoftware.create({
    data: {
      nomeSistema: 'ERP Corporativo',
      finalidadePrincipal: 'Gestão empresarial integrada',
      breveDescritivo: 'ERP para gestão de processos, financeiro e RH.',
      empresaId: empresa1.id,
      fornecedorId: forn1.id,
      areaId: area1.id,
      responsavelTiPessoaId: pessoa1.id,
      responsavelNegocioPessoaId: pessoa3.id,
      hospedagemId: cloud?.id,
      formaAcessoId: web?.id,
      integracoes: 'API de relatórios; exportação CSV',
      controleAcessoPorUsuario: true,
      autenticacaoAdSso: true,
      grauSatisfacao: 'Investir',
      custoMensalSistema: 5000,
      custoMensalInfraestrutura: 2000,
      timeId: time1.id,
      dataInicio: '2023-01-01',
      dataFim: '',
      marcasAtendidas: { connect: [{ id: marca1.id }, { id: marca2.id }] },
    },
  });
  const sistema2 = await prisma.produtoSoftware.create({
    data: {
      nomeSistema: 'Portal de Vendas',
      finalidadePrincipal: 'E-commerce e vendas online',
      breveDescritivo: 'Portal B2B e B2C com integração ao ERP.',
      empresaId: empresa1.id,
      fornecedorId: forn2.id,
      areaId: area1.id,
      responsavelTiPessoaId: pessoa2.id,
      responsavelNegocioPessoaId: pessoa3.id,
      hospedagemId: cloud?.id,
      formaAcessoId: web?.id,
      integracoes: 'ERP; gateway de pagamento',
      controleAcessoPorUsuario: true,
      autenticacaoAdSso: false,
      grauSatisfacao: 'Tolerar',
      custoMensalSistema: 3500,
      timeId: time1.id,
      dataInicio: '2022-06-01',
      marcasAtendidas: { connect: [{ id: marca1.id }] },
    },
  });
  const sistema3 = await prisma.produtoSoftware.create({
    data: {
      nomeSistema: 'API de Integrações',
      finalidadePrincipal: 'Integração entre sistemas',
      breveDescritivo: 'API central para troca de dados entre ERP, portal e parceiros.',
      empresaId: empresa2.id,
      fornecedorId: forn2.id,
      areaId: area1.id,
      responsavelTiPessoaId: pessoa1.id,
      hospedagemId: cloud?.id,
      formaAcessoId: api?.id,
      integracoes: 'ERP; Portal; parceiros',
      controleAcessoPorUsuario: true,
      autenticacaoAdSso: true,
      grauSatisfacao: 'Investir',
      custoMensalInfraestrutura: 1500,
      timeId: time2.id,
      dataInicio: '2024-01-01',
      marcasAtendidas: { connect: [{ id: marca2.id }] },
    },
  });
  console.log('Sistemas/Produtos de software criados');

  const projeto1 = await prisma.projeto.create({
    data: {
      nome: 'Modernização ERP',
      descricao: 'Atualização do ERP e integração com novos módulos.',
      empresaId: empresa1.id,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      status: 'Em andamento',
      observacoes: 'Projeto de governança de TI.',
      produtosSoftware: { connect: [{ id: sistema1.id }, { id: sistema2.id }] },
    },
  });
  const projeto2 = await prisma.projeto.create({
    data: {
      nome: 'Consolidação de APIs',
      descricao: 'Unificação das APIs em um único gateway.',
      empresaId: empresa2.id,
      dataInicio: '2024-06-01',
      dataFim: '2025-06-01',
      status: 'Planejado',
      produtosSoftware: { connect: [{ id: sistema3.id }] },
    },
  });
  console.log('Projetos de demonstração criados');

  const capex1 = await prisma.capex.create({
    data: {
      classificacao: 'capex',
      areaId: area1.id,
      fornecedorId: forn1.id,
      valor: 120000,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      observacoes: 'Licenciamento anual e implementação.',
      projetos: { connect: [{ id: projeto1.id }] },
      produtosSoftware: { connect: [{ id: sistema1.id }] },
    },
  });
  await prisma.capexEntrada.create({
    data: { capexId: capex1.id, valor: 40000, periodo: '2024-01' },
  });
  await prisma.capexEntrada.create({
    data: { capexId: capex1.id, valor: 40000, periodo: '2024-06' },
  });
  await prisma.capexEntrada.create({
    data: { capexId: capex1.id, valor: 40000, periodo: '2024-12' },
  });

  const capex2 = await prisma.capex.create({
    data: {
      classificacao: 'opex',
      areaId: area1.id,
      fornecedorId: forn2.id,
      valor: 36000,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      observacoes: 'Custos mensais de cloud (AWS).',
      produtosSoftware: { connect: [{ id: sistema2.id }, { id: sistema3.id }] },
    },
  });
  await prisma.capexEntrada.create({
    data: { capexId: capex2.id, valor: 3000, periodo: '2024-01' },
  });
  await prisma.capexEntrada.create({
    data: { capexId: capex2.id, valor: 3000, periodo: '2024-02' },
  });
  console.log('Capex/Opex de demonstração criados');

  // Usuário extra para demonstração (membro)
  const existingMembro = await prisma.usuario.findUnique({ where: { login: 'demo' } });
  if (!existingMembro) {
    await prisma.usuario.create({
      data: {
        nome: 'Usuário Demonstração',
        login: 'demo',
        email: 'demo@tecnosolve.com.br',
        senhaHash: bcrypt.hashSync('demo', 10),
        perfilId: 'perfil-membro',
      },
    });
    console.log('Usuário demo criado (login: demo, senha: demo)');
  }

  console.log('Dados de apresentação populados com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
