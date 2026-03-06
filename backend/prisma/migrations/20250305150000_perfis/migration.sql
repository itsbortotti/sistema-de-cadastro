-- CreateTable Perfil
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Perfil_nome_key" ON "Perfil"("nome");

-- Insert default perfis (fixed ids for migration)
INSERT INTO "Perfil" ("id", "nome", "createdAt", "updatedAt") VALUES
  ('perfil-admin', 'Administrador', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perfil-membro', 'Membro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perfil-visualizacao', 'Apenas visualização', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Usuario: add perfilId, migrate from tipo, drop tipo
ALTER TABLE "Usuario" ADD COLUMN "perfilId" TEXT;

UPDATE "Usuario" SET "perfilId" = 'perfil-admin' WHERE "tipo" = 'admin';
UPDATE "Usuario" SET "perfilId" = 'perfil-membro' WHERE "tipo" = 'membro';
UPDATE "Usuario" SET "perfilId" = 'perfil-visualizacao' WHERE "tipo" = 'visualizacao';
UPDATE "Usuario" SET "perfilId" = 'perfil-membro' WHERE "perfilId" IS NULL;

ALTER TABLE "Usuario" ALTER COLUMN "perfilId" SET NOT NULL;
ALTER TABLE "Usuario" DROP COLUMN "tipo";

ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Permissao: drop old unique, add perfilId, migrate, drop tipo, add new unique and FK
DROP INDEX IF EXISTS "Permissao_tipo_entidade_key";

ALTER TABLE "Permissao" ADD COLUMN "perfilId" TEXT;

UPDATE "Permissao" SET "perfilId" = 'perfil-admin' WHERE "tipo" = 'admin';
UPDATE "Permissao" SET "perfilId" = 'perfil-membro' WHERE "tipo" = 'membro';
UPDATE "Permissao" SET "perfilId" = 'perfil-visualizacao' WHERE "tipo" = 'visualizacao';
UPDATE "Permissao" SET "perfilId" = 'perfil-membro' WHERE "perfilId" IS NULL;

ALTER TABLE "Permissao" ALTER COLUMN "perfilId" SET NOT NULL;
ALTER TABLE "Permissao" DROP COLUMN "tipo";

CREATE UNIQUE INDEX "Permissao_perfilId_entidade_key" ON "Permissao"("perfilId", "entidade");

ALTER TABLE "Permissao" ADD CONSTRAINT "Permissao_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Permissão para gerenciar perfis (apenas perfil Administrador)
INSERT INTO "Permissao" ("id", "perfilId", "entidade", "visualizar", "editar", "criar", "excluir") VALUES
('perm-perfis-admin', 'perfil-admin', 'perfis', true, true, true, true);
