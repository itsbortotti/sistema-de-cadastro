/**
 * Garante que o usuário admin existe com senha "admin" e perfil Administrador.
 * Uso: node scripts/reset-admin.js
 * Requer: .env com DATABASE_URL (rodar a partir da pasta backend)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const perfilAdmin = await prisma.perfil.upsert({
    where: { id: 'perfil-admin' },
    create: { id: 'perfil-admin', nome: 'Administrador' },
    update: { nome: 'Administrador' },
  });

  const senhaHash = bcrypt.hashSync('admin', 10);
  const admin = await prisma.usuario.upsert({
    where: { login: 'admin' },
    create: {
      nome: 'Administrador',
      login: 'admin',
      email: '',
      senhaHash,
      perfilId: perfilAdmin.id,
    },
    update: {
      senhaHash,
      perfilId: perfilAdmin.id,
    },
  });

  console.log('Usuário admin configurado: login=admin, senha=admin');
  console.log('ID:', admin.id, '| Perfil:', perfilAdmin.nome);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
