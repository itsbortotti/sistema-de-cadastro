-- AlterTable
ALTER TABLE "ProdutoSoftware" ADD COLUMN "responsavelTiPessoaId" TEXT;
ALTER TABLE "ProdutoSoftware" ADD COLUMN "responsavelNegocioPessoaId" TEXT;

-- AddForeignKey
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_responsavelTiPessoaId_fkey" FOREIGN KEY ("responsavelTiPessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProdutoSoftware" ADD CONSTRAINT "ProdutoSoftware_responsavelNegocioPessoaId_fkey" FOREIGN KEY ("responsavelNegocioPessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
