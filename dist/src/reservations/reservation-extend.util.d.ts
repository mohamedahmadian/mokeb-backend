export declare function currentReservationEndDate(sourceEndDate: Date | string | null | undefined, sourceStartDate: Date | string): string;
export declare function computeExtendedEndDate(currentEndDate: Date | string, extraDays: number): string;
export declare function defaultExtensionStayDays(defaultReservationDays?: number | null): number;
export declare function defaultExtendedEndDate(currentEndDate: Date | string, defaultReservationDays?: number | null): string;
export declare function computeExtensionStartDate(sourceEndDate: Date | string): string;
export declare function computeExtensionEndDate(currentEndDate: string, extraDays: number): string;
export declare function defaultExtensionEndDate(sourceEndDate: Date | string, defaultReservationDays?: number | null): string;
