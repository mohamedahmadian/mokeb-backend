-- AlterTable
ALTER TABLE "reservation_delivered_items" ADD COLUMN "receivedAt" TIMESTAMP(3);

-- Backfill received date for items already marked as received
UPDATE "reservation_delivered_items"
SET "receivedAt" = "updatedAt"
WHERE "status" = 'ReceivedFromGuest' AND "receivedAt" IS NULL;
