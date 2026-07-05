-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "travelOrigin" TEXT;
ALTER TABLE "reservations" ADD COLUMN "lastStatusUpdatedByUserId" INTEGER;
ALTER TABLE "reservations" ADD COLUMN "lastStatusUpdatedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_lastStatusUpdatedByUserId_fkey" FOREIGN KEY ("lastStatusUpdatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
