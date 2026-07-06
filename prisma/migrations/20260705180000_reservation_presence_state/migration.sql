-- CreateEnum
CREATE TYPE "ReservationPresenceState" AS ENUM ('NOT_ARRIVED', 'PRESENT', 'TEMPORARILY_OUT', 'LEFT');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "presenceState" "ReservationPresenceState" NOT NULL DEFAULT 'NOT_ARRIVED';

-- CreateIndex
CREATE INDEX "reservations_mawkibId_presenceState_idx" ON "reservations"("mawkibId", "presenceState");
