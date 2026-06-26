-- CreateTable
CREATE TABLE "reservation_reviews" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservation_reviews_reservationId_key" ON "reservation_reviews"("reservationId");

-- AddForeignKey
ALTER TABLE "reservation_reviews" ADD CONSTRAINT "reservation_reviews_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_reviews" ADD CONSTRAINT "reservation_reviews_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_reviews" ADD CONSTRAINT "reservation_reviews_repliedByUserId_fkey" FOREIGN KEY ("repliedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
