-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "embedding" vector(384);

-- AlterTable
ALTER TABLE "Tickets" ADD COLUMN     "embedding" vector(384);

-- CreateIndex
CREATE INDEX "Tickets_id_idx" ON "Tickets"("id");
