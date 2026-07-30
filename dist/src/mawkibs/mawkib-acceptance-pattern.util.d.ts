import { MawkibAcceptanceType, MawkibReservationStartMode, MawkibStayDurationMode } from '@prisma/client';
export type MawkibAcceptancePatternSource = {
    acceptanceType: MawkibAcceptanceType;
    stayDurationMode: MawkibStayDurationMode;
    fixedStayDays: number | null;
    reservationStartMode: MawkibReservationStartMode;
    maleCapacity: number;
    femaleCapacity: number;
    maxReservationDays?: number | null;
    formShowNationalId?: boolean;
    formShowPassportNumber?: boolean;
    formShowReservationCode?: boolean;
    formShowCarPlate?: boolean;
    formShowGender?: boolean;
    formShowPassword?: boolean;
    formShowLocation?: boolean;
    formShowNationalIdCardImage?: boolean;
};
export type MawkibReservationFormConfig = {
    acceptanceType: MawkibAcceptanceType;
    stayDurationMode: MawkibStayDurationMode;
    fixedStayDays: number | null;
    reservationStartMode: MawkibReservationStartMode;
    showMaleGuestCount: boolean;
    showFemaleGuestCount: boolean;
    showGuestCountFields: boolean;
    showCompanionsSection: boolean;
    showReservationStartDatePicker: boolean;
    showReservationEndDatePicker: boolean;
    defaultMaleGuestCount: number | null;
    defaultFemaleGuestCount: number | null;
    showNationalIdField: boolean;
    showPassportNumberField: boolean;
    showReservationCodeField: boolean;
    showCarPlateField: boolean;
    showGenderField: boolean;
    showPasswordField: boolean;
    showLocationFields: boolean;
    showNationalIdCardImageField: boolean;
};
export declare function buildMawkibReservationFormConfig(mawkib: MawkibAcceptancePatternSource): MawkibReservationFormConfig;
export declare function normalizeMawkibAcceptancePatternFields(input: {
    acceptanceType?: MawkibAcceptanceType;
    stayDurationMode?: MawkibStayDurationMode;
    fixedStayDays?: number | null;
    reservationStartMode?: MawkibReservationStartMode;
    maxReservationDays?: number | null;
    formShowNationalId?: boolean;
    formShowPassportNumber?: boolean;
    formShowReservationCode?: boolean;
    formShowCarPlate?: boolean;
    formShowGender?: boolean;
    formShowPassword?: boolean;
    formShowLocation?: boolean;
    formShowNationalIdCardImage?: boolean;
}): {
    acceptanceType: MawkibAcceptanceType;
    stayDurationMode: MawkibStayDurationMode;
    fixedStayDays: number | null;
    reservationStartMode: MawkibReservationStartMode;
    formShowNationalId: boolean;
    formShowPassportNumber: boolean;
    formShowReservationCode: boolean;
    formShowCarPlate: boolean;
    formShowGender: boolean;
    formShowPassword: boolean;
    formShowLocation: boolean;
    formShowNationalIdCardImage: boolean;
};
export declare function fixedStayEndDateString(startDate: string, fixedStayDays: number): string;
export declare function resolveReservationDatesForAcceptancePattern(mawkib: MawkibAcceptancePatternSource, input: {
    reservationDate: string;
    reservationEndDate?: string;
}): {
    reservationDate: string;
    reservationEndDate: string;
};
export declare function normalizeGuestCountsForAcceptancePattern(mawkib: MawkibAcceptancePatternSource, maleGuestCount: number, femaleGuestCount: number): {
    maleGuestCount: number;
    femaleGuestCount: number;
};
export declare function assertReservationMatchesAcceptancePattern(mawkib: MawkibAcceptancePatternSource, params: {
    maleGuestCount: number;
    femaleGuestCount: number;
    companions?: string | null;
    reservationDate: string;
    reservationEndDate: string;
}): void;
export declare function acceptancePatternErrorMessage(code: string): string;
