import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RecordReservationEventDto } from './dto/reservation-event.dto';
export declare class ReservationEventsService {
    private prisma;
    private mawkibsService;
    private mealPlansService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService, mealPlansService: MealPlansService);
    private resolveRecordedAt;
    private extractAppTimeString;
    private resolveCheckoutEndDate;
    private eventErrorMessage;
    private reservationPresenceSelect;
    refreshPresenceState(reservationId: number): Promise<import("@prisma/client").$Enums.ReservationPresenceState>;
    private ensureCheckInEventSynced;
    private loadEventsResponse;
    private assertRecordedAtNotBeforeCheckIn;
    private assertStaffAccess;
    listForReservation(reservationId: number, currentUser: AuthUser): Promise<{
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
    recordEvent(reservationId: number, dto: RecordReservationEventDto, currentUser: AuthUser): Promise<{
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
    private applyCheckIn;
    private applyEarlyCheckout;
    syncEventFromLegacyAttendance(reservationId: number, eventType: 'CHECK_IN' | 'EARLY_CHECKOUT', recordedAt: Date, userId: number): Promise<{
        id: number;
        reservationId: number;
        createdAt: Date;
        description: string | null;
        eventType: import("@prisma/client").$Enums.ReservationEventType;
        createdByUserId: number;
    }>;
}
