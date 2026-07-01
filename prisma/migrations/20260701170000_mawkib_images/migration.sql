-- CreateTable
CREATE TABLE "mawkib_images" (
    "id" SERIAL NOT NULL,
    "mawkibId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mawkib_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mawkib_images_mawkibId_sortOrder_idx" ON "mawkib_images"("mawkibId", "sortOrder");

-- AddForeignKey
ALTER TABLE "mawkib_images" ADD CONSTRAINT "mawkib_images_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
