-- AlterEnum
ALTER TYPE "RoleName" ADD VALUE 'MawkibServant';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "servantMawkibId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_servantMawkibId_fkey" FOREIGN KEY ("servantMawkibId") REFERENCES "mawkibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "users_servantMawkibId_idx" ON "users"("servantMawkibId");
