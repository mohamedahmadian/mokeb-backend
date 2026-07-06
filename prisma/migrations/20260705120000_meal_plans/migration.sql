-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('Breakfast', 'Lunch', 'Dinner');

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isServed" BOOLEAN NOT NULL DEFAULT false,
    "servedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_plans_reservationId_date_idx" ON "meal_plans"("reservationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plans_reservationId_date_mealType_key" ON "meal_plans"("reservationId", "date", "mealType");

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
