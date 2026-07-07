import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RecordReservationEventDto } from './dto/reservation-event.dto';
import { ReservationEventsService } from './reservation-events.service';
export declare class ReservationEventsController {
    private readonly eventsService;
    constructor(eventsService: ReservationEventsService);
    list(id: number, user: AuthUser): Promise<{
        events: ({
            createdBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            description: string | null;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        })[];
        sessions: import("./reservation-event.util").ReservationEventSessionRow[];
        presence: import("@prisma/client").$Enums.ReservationPresenceState;
    }>;
    record(id: number, dto: RecordReservationEventDto, user: AuthUser): Promise<{
        presence: import("@prisma/client").$Enums.ReservationPresenceState;
        events: ({
            createdBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            description: string | null;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        })[];
        sessions: import("./reservation-event.util").ReservationEventSessionRow[];
        event: {
            createdBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            description: string | null;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        };
        reservation: {
            id: number;
            createdAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationStatus;
            mawkibId: number;
            pilgrimUserId: number;
            reservedByUserId: number;
            reservationDate: Date;
            reservationEndDate: Date;
            plannedCheckInTime: string | null;
            plannedCheckOutTime: string | null;
            actualCheckInAt: Date | null;
            actualCheckOutAt: Date | null;
            maleGuestCount: number;
            femaleGuestCount: number;
            trackingCode: string;
            pilgrimMobile: string;
            companions: string | null;
            travelOrigin: string | null;
            cancellationNote: string | null;
            presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
            lastStatusUpdatedByUserId: number | null;
            lastStatusUpdatedAt: Date | null;
        };
    }>;
}
