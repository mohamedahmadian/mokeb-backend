export declare const DEFAULT_CHECK_IN_TIME = "14:00";
export declare const DEFAULT_CHECK_OUT_TIME = "11:00";
export declare function isValidTimeString(value: string): boolean;
export declare function normalizeTimeString(value?: string | null): string | undefined;
export declare function resolvePlannedTimes(input: {
    plannedCheckInTime?: string;
    plannedCheckOutTime?: string;
}, mawkib: {
    defaultCheckInTime: string;
    defaultCheckOutTime: string;
}): {
    plannedCheckInTime: string;
    plannedCheckOutTime: string;
};
export declare function reservationOccupiesDay(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
}, day: Date | string): boolean;
export declare function reservationOccupiedDays(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
}): Date[];
export declare function reservationDaysReleasedOnCheckout(reservation: {
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
}): Date[];
export declare function reservationOverlapsDateRange(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
}, startDate: Date | string, endDate: Date | string): boolean;
