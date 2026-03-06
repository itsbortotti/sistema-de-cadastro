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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
