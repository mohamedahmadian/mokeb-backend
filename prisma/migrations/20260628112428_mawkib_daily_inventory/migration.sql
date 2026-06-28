-- CreateTable
CREATE TABLE "mawkib_daily_inventory" (
    "id" SERIAL NOT NULL,
    "mawkibId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "reservedMale" INTEGER NOT NULL DEFAULT 0,
    "reservedFemale" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mawkib_daily_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mawkib_daily_inventory_mawkibId_date_idx" ON "mawkib_daily_inventory"("mawkibId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "mawkib_daily_inventory_mawkibId_date_key" ON "mawkib_daily_inventory"("mawkibId", "date");

-- AddForeignKey
ALTER TABLE "mawkib_daily_inventory" ADD CONSTRAINT "mawkib_daily_inventory_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
