-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('Admin', 'Pilgrim', 'MawkibOwner', 'HonoraryServant');

-- CreateEnum
CREATE TYPE "MawkibStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Pending', 'Confirmed', 'Cancelled', 'Completed');

-- CreateEnum
CREATE TYPE "RegistrationRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "HonoraryVolunteerServiceType" AS ENUM ('Transportation', 'Cleaning', 'Cooking', 'Servantship', 'FoodSupply', 'Other');

-- CreateEnum
CREATE TYPE "HonoraryVolunteerApplicationStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');

-- CreateEnum
CREATE TYPE "HonoraryVolunteerApplicantType" AS ENUM ('Volunteer', 'MawkibOwner');

-- CreateEnum
CREATE TYPE "MawkibCountry" AS ENUM ('Iran', 'Iraq');

-- CreateEnum
CREATE TYPE "MawkibCity" AS ENUM ('Mashhad', 'Qom', 'Najaf', 'Karbala');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "province" TEXT,
    "city" TEXT,
    "description" TEXT,
    "whatsapp" TEXT,
    "telegram" TEXT,
    "bale" TEXT,
    "eitaa" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "mawkibs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phoneNumber" TEXT NOT NULL,
    "description" TEXT,
    "facilities" TEXT,
    "services" TEXT,
    "serviceStartDate" DATE,
    "serviceEndDate" DATE,
    "maleCapacity" INTEGER NOT NULL,
    "femaleCapacity" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "distanceToShrine" TEXT,
    "lunchReception" BOOLEAN NOT NULL DEFAULT false,
    "breakfastReception" BOOLEAN NOT NULL DEFAULT false,
    "dinnerReception" BOOLEAN NOT NULL DEFAULT false,
    "bathroom" BOOLEAN NOT NULL DEFAULT false,
    "laundry" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "internet" BOOLEAN NOT NULL DEFAULT false,
    "familyFriendly" BOOLEAN NOT NULL DEFAULT false,
    "maxReservationDays" INTEGER,
    "country" "MawkibCountry" NOT NULL DEFAULT 'Iran',
    "mawkibCity" "MawkibCity",
    "rules" TEXT,
    "telegramChannel" TEXT,
    "whatsapp" TEXT,
    "bale" TEXT,
    "eitaa" TEXT,
    "websiteUrl" TEXT,
    "defaultCheckInTime" TEXT NOT NULL DEFAULT '14:00',
    "defaultCheckOutTime" TEXT NOT NULL DEFAULT '11:00',
    "ownerUserId" INTEGER NOT NULL,
    "status" "MawkibStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mawkibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "mawkibId" INTEGER NOT NULL,
    "pilgrimUserId" INTEGER NOT NULL,
    "reservedByUserId" INTEGER NOT NULL,
    "reservationDate" DATE NOT NULL,
    "reservationEndDate" DATE NOT NULL,
    "plannedCheckInTime" TEXT,
    "plannedCheckOutTime" TEXT,
    "actualCheckInAt" TIMESTAMP(3),
    "actualCheckOutAt" TIMESTAMP(3),
    "maleGuestCount" INTEGER NOT NULL,
    "femaleGuestCount" INTEGER NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "pilgrimMobile" TEXT NOT NULL,
    "companions" TEXT,
    "description" TEXT,
    "cancellationNote" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "mawkib_registration_requests" (
    "id" SERIAL NOT NULL,
    "ownerUserId" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "mawkibName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "status" "RegistrationRequestStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mawkib_registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honorary_volunteer_applications" (
    "id" SERIAL NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "applicantType" "HonoraryVolunteerApplicantType" NOT NULL DEFAULT 'Volunteer',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "province" TEXT,
    "city" TEXT,
    "mawkibId" INTEGER,
    "submittedByUserId" INTEGER,
    "description" TEXT,
    "serviceTypes" "HonoraryVolunteerServiceType"[],
    "serviceDescription" TEXT,
    "availabilityStartDate" DATE NOT NULL,
    "availabilityEndDate" DATE NOT NULL,
    "availabilityDescription" TEXT,
    "status" "HonoraryVolunteerApplicationStatus" NOT NULL DEFAULT 'Pending',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honorary_volunteer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mawkib_feedbacks" (
    "id" SERIAL NOT NULL,
    "mawkibId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "ownerReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mawkib_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_mobileNumber_key" ON "users"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_trackingCode_key" ON "reservations"("trackingCode");

-- CreateIndex
CREATE INDEX "reservations_mawkibId_reservationDate_idx" ON "reservations"("mawkibId", "reservationDate");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_reviews_reservationId_key" ON "reservation_reviews"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "honorary_volunteer_applications_trackingCode_key" ON "honorary_volunteer_applications"("trackingCode");

-- CreateIndex
CREATE INDEX "mawkib_feedbacks_mawkibId_createdAt_idx" ON "mawkib_feedbacks"("mawkibId", "createdAt");

-- CreateIndex
CREATE INDEX "mawkib_feedbacks_authorUserId_createdAt_idx" ON "mawkib_feedbacks"("authorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkibs" ADD CONSTRAINT "mawkibs_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_pilgrimUserId_fkey" FOREIGN KEY ("pilgrimUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_reservedByUserId_fkey" FOREIGN KEY ("reservedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_reviews" ADD CONSTRAINT "reservation_reviews_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_reviews" ADD CONSTRAINT "reservation_reviews_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_reviews" ADD CONSTRAINT "reservation_reviews_repliedByUserId_fkey" FOREIGN KEY ("repliedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkib_registration_requests" ADD CONSTRAINT "mawkib_registration_requests_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honorary_volunteer_applications" ADD CONSTRAINT "honorary_volunteer_applications_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honorary_volunteer_applications" ADD CONSTRAINT "honorary_volunteer_applications_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honorary_volunteer_applications" ADD CONSTRAINT "honorary_volunteer_applications_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkib_feedbacks" ADD CONSTRAINT "mawkib_feedbacks_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkib_feedbacks" ADD CONSTRAINT "mawkib_feedbacks_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkib_feedbacks" ADD CONSTRAINT "mawkib_feedbacks_repliedByUserId_fkey" FOREIGN KEY ("repliedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
