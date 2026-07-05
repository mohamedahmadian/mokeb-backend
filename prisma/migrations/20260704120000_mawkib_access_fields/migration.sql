-- AlterTable
ALTER TABLE "mawkibs" ADD COLUMN "distanceToBusStation" TEXT;
ALTER TABLE "mawkibs" ADD COLUMN "distanceToMetro" TEXT;
ALTER TABLE "mawkibs" ADD COLUMN "elevator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "mawkibs" ADD COLUMN "stairs" BOOLEAN NOT NULL DEFAULT false;
