-- Add tracking code to reservations
ALTER TABLE "reservations" ADD COLUMN "trackingCode" TEXT;

UPDATE "reservations"
SET "trackingCode" = 'MKB-LEGACY-' || LPAD(id::text, 6, '0') || '-' || UPPER(SUBSTRING(MD5(id::text || "createdAt"::text) FROM 1 FOR 6))
WHERE "trackingCode" IS NULL;

ALTER TABLE "reservations" ALTER COLUMN "trackingCode" SET NOT NULL;
CREATE UNIQUE INDEX "reservations_trackingCode_key" ON "reservations"("trackingCode");
