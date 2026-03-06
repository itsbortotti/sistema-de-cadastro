-- CreateTable
CREATE TABLE "MarcaAtendida" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarcaAtendida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MarcaAtendidaToProdutoSoftware" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- DropColumn
ALTER TABLE "ProdutoSoftware" DROP COLUMN IF EXISTS "marcasAtendidas";

-- CreateIndex
CREATE UNIQUE INDEX "_MarcaAtendidaToProdutoSoftware_AB_unique" ON "_MarcaAtendidaToProdutoSoftware"("A", "B");

-- CreateIndex
CREATE INDEX "_MarcaAtendidaToProdutoSoftware_B_index" ON "_MarcaAtendidaToProdutoSoftware"("B");

-- AddForeignKey
ALTER TABLE "_MarcaAtendidaToProdutoSoftware" ADD CONSTRAINT "_MarcaAtendidaToProdutoSoftware_A_fkey" FOREIGN KEY ("A") REFERENCES "MarcaAtendida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcaAtendidaToProdutoSoftware" ADD CONSTRAINT "_MarcaAtendidaToProdutoSoftware_B_fkey" FOREIGN KEY ("B") REFERENCES "ProdutoSoftware"("id") ON DELETE CASCADE ON UPDATE CASCADE;
