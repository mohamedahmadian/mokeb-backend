-- CreateEnum
CREATE TYPE "MawkibCountry" AS ENUM ('Iran', 'Iraq');
CREATE TYPE "MawkibCity" AS ENUM ('Mashhad', 'Qom', 'Najaf', 'Karbala');

-- Split mawkib capacity
ALTER TABLE "mawkibs" ADD COLUMN "maleCapacity" INTEGER;
ALTER TABLE "mawkibs" ADD COLUMN "femaleCapacity" INTEGER NOT NULL DEFAULT 0;
UPDATE "mawkibs" SET "maleCapacity" = "capacity";
ALTER TABLE "mawkibs" ALTER COLUMN "maleCapacity" SET NOT NULL;
ALTER TABLE "mawkibs" DROP COLUMN "capacity";

-- Country enum (was TEXT)
ALTER TABLE "mawkibs" ADD COLUMN "country_new" "MawkibCountry" NOT NULL DEFAULT 'Iran';
UPDATE "mawkibs" SET "country_new" = 'Iraq' WHERE "country" IN ('Iraq', 'عراق');
UPDATE "mawkibs" SET "country_new" = 'Iran' WHERE "country" IN ('Iran', 'ایران');
ALTER TABLE "mawkibs" DROP COLUMN IF EXISTS "country";
ALTER TABLE "mawkibs" RENAME COLUMN "country_new" TO "country";

-- Mawkib city
ALTER TABLE "mawkibs" ADD COLUMN "mawkibCity" "MawkibCity";

-- Split reservation guest counts
ALTER TABLE "reservations" ADD COLUMN "maleGuestCount" INTEGER;
ALTER TABLE "reservations" ADD COLUMN "femaleGuestCount" INTEGER NOT NULL DEFAULT 0;
UPDATE "reservations" SET "maleGuestCount" = "guestCount";
ALTER TABLE "reservations" ALTER COLUMN "maleGuestCount" SET NOT NULL;
ALTER TABLE "reservations" DROP COLUMN "guestCount";
