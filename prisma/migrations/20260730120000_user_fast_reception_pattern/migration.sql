-- CreateTable
CREATE TABLE "user_fast_reception_patterns" (
    "userId" INTEGER NOT NULL,
    "acceptanceType" "MawkibAcceptanceType" NOT NULL DEFAULT 'Group',
    "stayDurationMode" "MawkibStayDurationMode" NOT NULL DEFAULT 'Free',
    "fixedStayDays" INTEGER,
    "reservationStartMode" "MawkibReservationStartMode" NOT NULL DEFAULT 'UserSelect',
    "formShowNationalId" BOOLEAN NOT NULL DEFAULT false,
    "formShowPassportNumber" BOOLEAN NOT NULL DEFAULT false,
    "formShowReservationCode" BOOLEAN NOT NULL DEFAULT false,
    "formShowCarPlate" BOOLEAN NOT NULL DEFAULT false,
    "formShowGender" BOOLEAN NOT NULL DEFAULT false,
    "formShowPassword" BOOLEAN NOT NULL DEFAULT false,
    "formShowLocation" BOOLEAN NOT NULL DEFAULT false,
    "formShowNationalIdCardImage" BOOLEAN NOT NULL DEFAULT false,
    "formShowBirthDate" BOOLEAN NOT NULL DEFAULT false,
    "formShowTravelOrigin" BOOLEAN NOT NULL DEFAULT false,
    "formShowDescription" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_fast_reception_patterns_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "user_fast_reception_patterns" ADD CONSTRAINT "user_fast_reception_patterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
