import { Prisma, ReservationEventType, ReservationPresenceState } from '@prisma/client';
export declare function assertUniqueAttendanceSecond(recordedAt: Date, reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt?: Date | null;
}, existingEvents: {
    createdAt: Date;
}[]): void;
export type { ReservationPresenceState };
export interface ReservationEventLike {
    eventType: ReservationEventType;
    createdAt: Date | string;
}
export declare function compareMovementEvents(a: ReservationEventLike, b: ReservationEventLike): number;
export declare function buildEffectiveAttendanceEvents(events: ReservationEventLike[], actualCheckInAt: Date | null): ReservationEventLike[];
export declare function resolvePresenceState(events: ReservationEventLike[], reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
    status: string;
}): ReservationPresenceState;
export declare function syncReservationPresenceState(client: Prisma.TransactionClient | PrismaServiceLike, reservationId: number): Promise<ReservationPresenceState>;
type PrismaServiceLike = {
    reservation: Prisma.TransactionClient['reservation'];
    reservationEvent: Prisma.TransactionClient['reservationEvent'];
};
export declare function resolvePresenceStateAsOf(events: ReservationEventLike[], reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
}, reportDate: Date | string): ReservationPresenceState;
export declare function assertEventAllowed(eventType: ReservationEventType, presence: ReservationPresenceState, reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
    status: string;
}): void;
export interface ReservationEventSessionRow {
    id: string;
    inEvent?: ReservationEventLike & {
        id: number;
    };
    outEvent?: ReservationEventLike & {
        id: number;
    };
    open: boolean;
}
export declare function pairReservationEvents<T extends ReservationEventLike & {
    id: number;
}>(events: T[]): ReservationEventSessionRow[];
