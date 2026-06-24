ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "reviewNote" TEXT;
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "honorary_volunteer_applications" ADD COLUMN "reviewedByUserId" INTEGER;

ALTER TABLE "honorary_volunteer_applications" ADD CONSTRAINT "honorary_volunteer_applications_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
