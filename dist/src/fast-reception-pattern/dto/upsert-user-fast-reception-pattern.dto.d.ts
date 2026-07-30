import { MawkibAcceptanceType, MawkibReservationStartMode, MawkibStayDurationMode, UserGender } from '@prisma/client';
export declare class UpsertUserFastReceptionPatternDto {
    acceptanceType: MawkibAcceptanceType;
    individualGuestGender?: UserGender | null;
    defaultMawkibId?: number | null;
    stayDurationMode: MawkibStayDurationMode;
    fixedStayDays?: number | null;
    reservationStartMode: MawkibReservationStartMode;
    formShowNationalId: boolean;
    formShowPassportNumber: boolean;
    formShowReservationCode: boolean;
    formShowCarPlate: boolean;
    formShowGender: boolean;
    formShowPassword: boolean;
    formShowLocation: boolean;
    formShowNationalIdCardImage: boolean;
    formShowBirthDate: boolean;
    formShowTravelOrigin: boolean;
    formShowDescription: boolean;
}
