-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "reservationEndDate" DATE;

UPDATE "reservations" SET "reservationEndDate" = "reservationDate" WHERE "reservationEndDate" IS NULL;

ALTER TABLE "reservations" ALTER COLUMN "reservationEndDate" SET NOT NULL;
