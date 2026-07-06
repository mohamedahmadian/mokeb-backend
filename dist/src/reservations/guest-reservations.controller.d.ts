import { ReservationsService } from './reservations.service';
import { CreateGuestReservationDto, GuestRecordAttendanceDto, TrackByExactMobileDto, TrackReservationDto } from './dto/reservation.dto';
export declare class GuestReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    createGuest(dto: CreateGuestReservationDto): Promise<{
        message: string;
        reservationId: number;
        trackingCode: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        mawkibName: string;
        reservationDate: string;
        reservationEndDate: string;
        maleGuestCount: number;
        femaleGuestCount: number;
    }>;
    checkInGuest(body: GuestRecordAttendanceDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        lastStatusUpdatedBy: {
            id: number;
            fullName: string;
        } | null;
        review: ({
            author: {
                id: number;
                fullName: string;
            };
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
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
        description: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    checkOutGuest(body: GuestRecordAttendanceDto): Promise<{
        mealPlanNotice: string | undefined;
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        lastStatusUpdatedBy: {
            id: number;
            fullName: string;
        } | null;
        review: ({
            author: {
                id: number;
                fullName: string;
            };
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
        id: number;
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
        description: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    track(query: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        lastStatusUpdatedBy: {
            id: number;
            fullName: string;
        } | null;
        review: ({
            author: {
                id: number;
                fullName: string;
            };
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
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
        description: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    trackByExactMobile(query: TrackByExactMobileDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            imageUrl: string | null;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
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
        description: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    })[]>;
}
