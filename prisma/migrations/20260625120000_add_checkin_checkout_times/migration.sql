-- AlterTable
ALTER TABLE "mawkibs" ADD COLUMN "defaultCheckInTime" TEXT NOT NULL DEFAULT '14:00';
ALTER TABLE "mawkibs" ADD COLUMN "defaultCheckOutTime" TEXT NOT NULL DEFAULT '11:00';

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "plannedCheckInTime" TEXT;
ALTER TABLE "reservations" ADD COLUMN "plannedCheckOutTime" TEXT;
ALTER TABLE "reservations" ADD COLUMN "actualCheckInAt" TIMESTAMP(3);
ALTER TABLE "reservations" ADD COLUMN "actualCheckOutAt" TIMESTAMP(3);
