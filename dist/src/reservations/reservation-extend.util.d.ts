export declare function computeExtensionStartDate(sourceEndDate: Date | string): string;
export declare function computeExtensionEndDate(extensionStart: string, stayDays: number): string;
export declare function defaultExtensionStayDays(defaultReservationDays?: number | null): number;
export declare function defaultExtensionEndDate(sourceEndDate: Date | string, defaultReservationDays?: number | null): string;
