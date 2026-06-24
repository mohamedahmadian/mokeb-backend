-- CreateEnum
CREATE TYPE "HonoraryVolunteerServiceType" AS ENUM ('Transportation', 'Cleaning', 'Cooking', 'Servantship', 'FoodSupply', 'Other');

-- CreateEnum
CREATE TYPE "HonoraryVolunteerApplicationStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "honorary_volunteer_applications" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "description" TEXT,
    "serviceTypes" "HonoraryVolunteerServiceType"[],
    "serviceDescription" TEXT,
    "availabilityStartDate" DATE NOT NULL,
    "availabilityEndDate" DATE NOT NULL,
    "availabilityDescription" TEXT,
    "status" "HonoraryVolunteerApplicationStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honorary_volunteer_applications_pkey" PRIMARY KEY ("id")
);
