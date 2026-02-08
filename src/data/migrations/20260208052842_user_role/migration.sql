-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "SenderType" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "RefreshTokens_userId_idx" ON "RefreshTokens"("userId");

-- CreateIndex
CREATE INDEX "Tickets_status_idx" ON "Tickets"("status");

-- CreateIndex
CREATE INDEX "Tickets_status_deletedAt_idx" ON "Tickets"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Users_id_idx" ON "Users"("id");
