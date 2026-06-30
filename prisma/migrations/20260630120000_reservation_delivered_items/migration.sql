-- CreateEnum
CREATE TYPE "ReservationDeliveredItemStatus" AS ENUM ('DeliveredToGuest', 'ReceivedFromGuest');

-- CreateTable
CREATE TABLE "reservation_delivered_items" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    "status" "ReservationDeliveredItemStatus" NOT NULL,
    "recordedByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_delivered_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservation_delivered_items_reservationId_idx" ON "reservation_delivered_items"("reservationId");

-- AddForeignKey
ALTER TABLE "reservation_delivered_items" ADD CONSTRAINT "reservation_delivered_items_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_delivered_items" ADD CONSTRAINT "reservation_delivered_items_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
