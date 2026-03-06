-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "senhaHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'membro',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "visualizar" BOOLEAN NOT NULL DEFAULT true,
    "editar" BOOLEAN NOT NULL DEFAULT false,
    "criar" BOOLEAN NOT NULL DEFAULT false,
    "excluir" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL DEFAULT '',
    "razaoSocial" TEXT NOT NULL DEFAULT '',
    "nomeFantasia" TEXT NOT NULL DEFAULT '',
    "dataAbertura" TEXT NOT NULL DEFAULT '',
    "naturezaJuridicaCodigo" TEXT NOT NULL DEFAULT '',
    "naturezaJuridicaDescricao" TEXT NOT NULL DEFAULT '',
    "atividadePrincipalCodigo" TEXT NOT NULL DEFAULT '',
    "atividadePrincipalDescricao" TEXT NOT NULL DEFAULT '',
    "atividadesSecundarias" TEXT NOT NULL DEFAULT '',
    "situacaoCadastral" TEXT NOT NULL DEFAULT '',
    "dataSituacaoCadastral" TEXT NOT NULL DEFAULT '',
    "motivoSituacaoCadastral" TEXT NOT NULL DEFAULT '',
    "logradouro" TEXT NOT NULL DEFAULT '',
    "numero" TEXT NOT NULL DEFAULT '',
    "complemento" TEXT NOT NULL DEFAULT '',
    "bairro" TEXT NOT NULL DEFAULT '',
    "cidade" TEXT NOT NULL DEFAULT '',
    "uf" TEXT NOT NULL DEFAULT '',
    "cep" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "capitalSocial" TEXT NOT NULL DEFAULT '',
    "porte" TEXT NOT NULL DEFAULT '',
    "inscricaoEstadual" TEXT NOT NULL DEFAULT '',
    "inscricaoMunicipal" TEXT NOT NULL DEFAULT '',
    "nomeResponsavel" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "razaoSocial" TEXT NOT NULL DEFAULT '',
    "nomeFantasia" TEXT NOT NULL DEFAULT '',
    "cnpj" TEXT NOT NULL DEFAULT '',
    "cpf" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT NOT NULL DEFAULT '',
    "celular" TEXT NOT NULL DEFAULT '',
    "endereco" TEXT NOT NULL DEFAULT '',
    "numero" TEXT NOT NULL DEFAULT '',
    "complemento" TEXT NOT NULL DEFAULT '',
    "bairro" TEXT NOT NULL DEFAULT '',
    "cidade" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT '',
    "cep" TEXT NOT NULL DEFAULT '',
    "site" TEXT NOT NULL DEFAULT '',
    "contato" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "codigo" TEXT NOT NULL DEFAULT '',
    "descricao" TEXT NOT NULL DEFAULT '',
    "responsavel" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospedagem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL DEFAULT '',
    "provedor" TEXT NOT NULL DEFAULT '',
    "descricao" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospedagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormaAcesso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "descricao" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormaAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Time" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "descricao" TEXT NOT NULL DEFAULT '',
    "lider" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoSoftware" (
    "id" TEXT NOT NULL,
    "nomeSistema" TEXT NOT NULL DEFAULT '',
    "empresaId" TEXT,
    "fornecedorId" TEXT,
    "finalidadePrincipal" TEXT NOT NULL DEFAULT '',
    "breveDescritivo" TEXT NOT NULL DEFAULT '',
    "marcasAtendidas" TEXT NOT NULL DEFAULT '',
    "usuariosQtdAproximada" INTEGER,
    "areaId" TEXT,
    "responsavelTiId" TEXT,
    "usuarioNegocioId" TEXT,
    "hospedagemId" TEXT,
    "onPremisesSites" TEXT NOT NULL DEFAULT '',
    "formaAcessoId" TEXT,
    "integracoes" TEXT NOT NULL DEFAULT '',
    "controleAcessoPorUsuario" BOOLEAN NOT NULL DEFAULT false,
    "autenticacaoAdSso" BOOLEAN NOT NULL DEFAULT false,
    "grauSatisfacao" TEXT,
    "problemasEnfrentados" TEXT NOT NULL DEFAULT '',
    "custoMensalSistema" DOUBLE PRECISION,
    "custoMensalInfraestrutura" DOUBLE PRECISION,
    "timeId" TEXT,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoSoftware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "descricao" TEXT NOT NULL DEFAULT '',
    "empresaId" TEXT,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "status" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapexEntrada" (
    "id" TEXT NOT NULL,
    "capexId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "periodo" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CapexEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capex" (
    "id" TEXT NOT NULL,
    "areaId" TEXT,
    "classificacao" TEXT NOT NULL DEFAULT 'capex',
    "fornecedorId" TEXT,
    "valor" DOUBLE PRECISION,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProdutoSoftwareToProjeto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProdutoSoftwareToProjeto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CapexToProjeto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CapexToProjeto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CapexToProdutoSoftware" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CapexToProdutoSoftware_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Permissao_tipo_entidade_key" ON "Permissao"("tipo", "entidade");

-- CreateIndex
CREATE INDEX "_ProdutoSoftwareToProjeto_B_index" ON "_ProdutoSoftwareToProjeto"("B");

-- CreateIndex
CREATE INDEX "_CapexToProjeto_B_index" ON "_CapexToProjeto"("B");

-- CreateIndex
CREATE INDEX "_CapexToProdutoSoftware_B_index" ON "_CapexToProdutoSoftware"("B");

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_responsavelTiId_fkey" FOREIGN KEY ("responsavelTiId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_usuarioNegocioId_fkey" FOREIGN KEY ("usuarioNegocioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_hospedagemId_fkey" FOREIGN KEY ("hospedagemId") REFERENCES "Hospedagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_formaAcessoId_fkey" FOREIGN KEY ("formaAcessoId") REFERENCES "FormaAcesso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapexEntrada" ADD CONSTRAINT "CapexEntrada_capexId_fkey" FOREIGN KEY ("capexId") REFERENCES "Capex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capex" ADD CONSTRAINT "Capex_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capex" ADD CONSTRAINT "Capex_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProdutoSoftwareToProjeto" ADD CONSTRAINT "_ProdutoSoftwareToProjeto_A_fkey" FOREIGN KEY ("A") REFERENCES "ProdutoSoftware"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProdutoSoftwareToProjeto" ADD CONSTRAINT "_ProdutoSoftwareToProjeto_B_fkey" FOREIGN KEY ("B") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapexToProjeto" ADD CONSTRAINT "_CapexToProjeto_A_fkey" FOREIGN KEY ("A") REFERENCES "Capex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapexToProjeto" ADD CONSTRAINT "_CapexToProjeto_B_fkey" FOREIGN KEY ("B") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapexToProdutoSoftware" ADD CONSTRAINT "_CapexToProdutoSoftware_A_fkey" FOREIGN KEY ("A") REFERENCES "Capex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapexToProdutoSoftware" ADD CONSTRAINT "_CapexToProdutoSoftware_B_fkey" FOREIGN KEY ("B") REFERENCES "ProdutoSoftware"("id") ON DELETE CASCADE ON UPDATE CASCADE;
