-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('Male', 'Female');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "gender" "UserGender";
