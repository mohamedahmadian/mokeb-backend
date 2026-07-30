/*
  Warnings:

  - Made the column `maxReservationDays` on table `mawkibs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `defaultReservationDays` on table `mawkibs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_servantMawkibId_idx";

-- AlterTable
ALTER TABLE "mawkibs" ALTER COLUMN "maxReservationDays" SET NOT NULL,
ALTER COLUMN "defaultReservationDays" SET NOT NULL;
