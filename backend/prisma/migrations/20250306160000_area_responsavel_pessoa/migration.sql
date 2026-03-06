-- AlterTable
ALTER TABLE "Area" ADD COLUMN "responsavelId" TEXT;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
