-- DropIndex
DROP INDEX "Messages_embedding_idx";

-- DropIndex
DROP INDEX "Tickets_embedding_idx";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "country" TEXT;
