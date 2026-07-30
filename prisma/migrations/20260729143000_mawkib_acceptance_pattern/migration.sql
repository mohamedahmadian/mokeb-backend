-- CreateEnum
CREATE TYPE "MawkibAcceptanceType" AS ENUM ('Individual', 'Group');

-- CreateEnum
CREATE TYPE "MawkibStayDurationMode" AS ENUM ('Fixed', 'Free');

-- CreateEnum
CREATE TYPE "MawkibReservationStartMode" AS ENUM ('CurrentDay', 'UserSelect');

-- AlterTable
ALTER TABLE "mawkibs" ADD COLUMN     "acceptanceType" "MawkibAcceptanceType" NOT NULL DEFAULT 'Group',
ADD COLUMN     "stayDurationMode" "MawkibStayDurationMode" NOT NULL DEFAULT 'Free',
ADD COLUMN     "fixedStayDays" INTEGER,
ADD COLUMN     "reservationStartMode" "MawkibReservationStartMode" NOT NULL DEFAULT 'UserSelect';
