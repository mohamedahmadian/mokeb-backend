import { ReservationEventType } from '@prisma/client';
export declare class RecordReservationEventDto {
    eventType: ReservationEventType;
    recordedAt?: string;
    description?: string;
}
