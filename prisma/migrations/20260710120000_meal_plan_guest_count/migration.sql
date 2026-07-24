-- AlterTable
ALTER TABLE "meal_plans" ADD COLUMN "guestCount" INTEGER NOT NULL DEFAULT 1;

-- Backfill from reservation guest counts
UPDATE "meal_plans" mp
SET "guestCount" = GREATEST(1, COALESCE(r."maleGuestCount", 0) + COALESCE(r."femaleGuestCount", 0))
FROM "reservations" r
WHERE r.id = mp."reservationId";
