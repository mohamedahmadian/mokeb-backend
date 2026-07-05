UPDATE "mawkibs"
SET "maxReservationDays" = 1
WHERE "maxReservationDays" IS NULL;

UPDATE "mawkibs"
SET "defaultReservationDays" = 1
WHERE "defaultReservationDays" IS NULL;

ALTER TABLE "mawkibs"
ALTER COLUMN "maxReservationDays" SET DEFAULT 1;

ALTER TABLE "mawkibs"
ALTER COLUMN "defaultReservationDays" SET DEFAULT 1;
