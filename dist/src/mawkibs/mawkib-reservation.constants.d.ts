export declare const DEFAULT_MAWKIB_MAX_RESERVATION_DAYS = 7;
export declare const DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS = 1;
export declare function effectiveMaxReservationDays(value?: number | null): number;
export declare function effectiveDefaultReservationDays(value?: number | null): number;
export declare function normalizeMawkibReservationDayFields(input: {
    maxReservationDays?: number | null;
    defaultReservationDays?: number | null;
}): {
    maxReservationDays: number;
    defaultReservationDays: number;
};
