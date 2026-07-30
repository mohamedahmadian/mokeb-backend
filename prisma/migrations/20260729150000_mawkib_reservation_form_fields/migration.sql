-- AlterTable
ALTER TABLE "mawkibs" ADD COLUMN     "formShowNationalId" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowPassportNumber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowReservationCode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowCarPlate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowGender" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formShowNationalIdCardImage" BOOLEAN NOT NULL DEFAULT false;
