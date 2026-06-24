-- AlterEnum
ALTER TYPE "HonoraryVolunteerApplicationStatus" ADD VALUE 'Cancelled';

-- CreateEnum
CREATE TYPE "HonoraryVolunteerApplicantType" AS ENUM ('Volunteer', 'MawkibOwner');

-- AlterTable
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "applicantType" "HonoraryVolunteerApplicantType" NOT NULL DEFAULT 'Volunteer';
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "province" TEXT;
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "city" TEXT;
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "mawkibId" INTEGER;
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "submittedByUserId" INTEGER;

UPDATE "honorary_volunteer_applications"
SET "trackingCode" = 'KHD-LEGACY-' || LPAD(id::text, 6, '0') || '-' || UPPER(SUBSTRING(MD5(id::text || "createdAt"::text) FROM 1 FOR 6))
WHERE "trackingCode" IS NULL;

ALTER TABLE "honorary_volunteer_applications" ALTER COLUMN "trackingCode" SET NOT NULL;
CREATE UNIQUE INDEX "honorary_volunteer_applications_trackingCode_key" ON "honorary_volunteer_applications"("trackingCode");

ALTER TABLE "honorary_volunteer_applications" ADD CONSTRAINT "honorary_volunteer_applications_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "honorary_volunteer_applications" ADD CONSTRAINT "honorary_volunteer_applications_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
