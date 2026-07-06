-- CreateEnum (idempotent: enum may exist from prior db push)
DO $$ BEGIN
    CREATE TYPE "ReservationEventType" AS ENUM ('CHECK_IN', 'TEMP_OUT', 'TEMP_IN', 'EARLY_CHECKOUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (idempotent: table may exist from prior db push)
CREATE TABLE IF NOT EXISTS "reservation_events" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "eventType" "ReservationEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "reservation_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reservation_events_reservationId_createdAt_idx" ON "reservation_events"("reservationId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "reservation_events" ADD CONSTRAINT "reservation_events_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "reservation_events" ADD CONSTRAINT "reservation_events_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
