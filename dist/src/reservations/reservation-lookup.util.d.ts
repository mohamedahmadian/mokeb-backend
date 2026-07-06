export declare function trackingCodeSequence(trackingCode: string): string | null;
export declare function scoreReservationLookupMatch(reservation: {
    id: number;
    trackingCode: string;
    pilgrimMobile: string;
    pilgrim: {
        mobileNumber: string;
        nationalId?: string | null;
    };
}, query: string): number;
export declare function rankReservationsByLookupQuery<T extends {
    id: number;
    trackingCode: string;
    pilgrimMobile: string;
    pilgrim: {
        mobileNumber: string;
        nationalId?: string | null;
    };
}>(reservations: T[], query: string): T[];
