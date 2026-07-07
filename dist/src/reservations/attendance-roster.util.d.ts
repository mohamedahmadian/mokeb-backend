import { ReservationEventType, ReservationPresenceState } from '@prisma/client';
export type AbsentRegisterEventType = 'CHECK_IN' | 'TEMP_IN';
export interface AbsentRosterContext {
    referenceAt: Date | null;
    lastExitAt: Date | null;
    registerEventType: AbsentRegisterEventType;
    absenceKind: 'NOT_ARRIVED' | 'TEMPORARILY_OUT';
}
export declare function resolveAbsentRosterContext(reservation: {
    reservationDate: Date;
    plannedCheckInTime: string | null;
    createdAt: Date;
    presenceState: ReservationPresenceState;
}, events: {
    eventType: ReservationEventType;
    createdAt: Date;
}[]): AbsentRosterContext | null;
