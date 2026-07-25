-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "duplicateOfId" UUID;

-- CreateIndex
CREATE INDEX "Hackathon_duplicateOfId_idx" ON "Hackathon"("duplicateOfId");

-- AddForeignKey
ALTER TABLE "Hackathon" ADD CONSTRAINT "Hackathon_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "Hackathon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
