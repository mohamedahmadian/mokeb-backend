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
export declare function lastPlannedOccupiedDay(reservationDate: Date | string, reservationEndDate: Date | string): Date;
export declare function reservationOccupiesDay(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
}, day: Date | string): boolean;
export declare function reservationOccupiedDays(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
}): Date[];
export declare function occupancyDaysDeltaOnEndDateChange(reservationDate: Date | string, previousEndDate: Date | string, newEndDate: Date | string): {
    released: Date[];
    occupied: Date[];
};
export declare function reservationDaysReleasedOnCheckout(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
}): Date[];
export declare function reservationOverlapsDateRange(reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
}, startDate: Date | string, endDate: Date | string): boolean;
