import { ReservationsService } from './reservations.service';
import { CancelReservationDto, CreateReservationDto, ExtendReservationDto, RecordReservationAttendanceDto, SearchReservationDto, TrackByMobileDto, UpdateReservationStatusDto, UpdateReservationTrackingCodeDto } from './dto/reservation.dto';
import { AttendanceRosterQueryDto } from './dto/attendance-roster.dto';
import { CreateReservationReviewDto, ReplyReservationReviewDto } from './dto/reservation-review.dto';
import { CreateReservationDeliveredItemDto, UpdateReservationDeliveredItemDto } from './dto/reservation-delivered-item.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    findAllAdmin(search: SearchReservationDto): Promise<({
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    })[] | import("./reservations.service").PaginatedReservationsResult<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>>;
    findMy(user: AuthUser, search: SearchReservationDto): Promise<({
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    })[] | import("./reservations.service").PaginatedReservationsResult<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>>;
    getPendingCounts(user: AuthUser): Promise<{
        total: number;
        byMawkib: {
            mawkibId: number;
            mawkibName: string;
            count: number;
        }[];
    }>;
    findLatestForPilgrimCard(pilgrimUserId: number, user: AuthUser, ownerScope?: string): Promise<({
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }) | null>;
    trackByMobile(query: TrackByMobileDto): Promise<({
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
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    })[]>;
    getAttendanceRoster(query: AttendanceRosterQueryDto, user: AuthUser): Promise<{
        kind: import("./dto/attendance-roster.dto").AttendanceRosterKind;
        generatedAt: string;
        mawkibId: number | null;
        rows: NonNullable<{
            reservationId: number;
            fullName: string;
            mobile: string;
            nationalId: string | null;
            durationMs: number;
            lastExitAt: string | null;
            absenceKind: "NOT_ARRIVED" | "TEMPORARILY_OUT";
            registerEventType: import("./attendance-roster.util").AbsentRegisterEventType;
        } | {
            reservationId: number;
            fullName: string;
            mobile: string;
            nationalId: string | null;
            durationMs: number;
            lastExitAt: null;
            absenceKind: null;
            registerEventType: null;
        } | null>[];
    }>;
    findOne(id: number, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    create(dto: CreateReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            createdAt: Date;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            description: string | null;
            facilities: string | null;
            services: string | null;
            serviceStartDate: Date | null;
            serviceEndDate: Date | null;
            maleCapacity: number;
            femaleCapacity: number;
            imageUrl: string | null;
            distanceToShrine: string | null;
            distanceToBusStation: string | null;
            distanceToMetro: string | null;
            lunchReception: boolean;
            breakfastReception: boolean;
            dinnerReception: boolean;
            bathroom: boolean;
            laundry: boolean;
            parking: boolean;
            internet: boolean;
            familyFriendly: boolean;
            elevator: boolean;
            stairs: boolean;
            maxReservationDays: number;
            defaultReservationDays: number;
            country: import("@prisma/client").$Enums.MawkibCountry;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            autoApprovePilgrimReservations: boolean;
            recordCheckInOnReservationConfirm: boolean;
            skipCapacityCheckEnabled: boolean;
            mealPlanManagementEnabled: boolean;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
        _count: {
            mawkib: number;
            pilgrim: number;
            reservedBy: number;
            lastStatusUpdatedBy: number;
            review: number;
            deliveredItems: number;
            events: number;
            mealPlans: number;
        };
        pilgrim: {
            id: number;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        reservedBy: {
            id: number;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        lastStatusUpdatedBy: {
            id: number;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        } | null;
        review: {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        } | null;
        deliveredItems: {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        }[];
        events: {
            id: number;
            reservationId: number;
            createdAt: Date;
            description: string | null;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        }[];
        mealPlans: {
            id: number;
            reservationId: number;
            date: Date;
            mealType: import("@prisma/client").$Enums.MealType;
            isRequired: boolean;
            isServed: boolean;
            servedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
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
    }>;
    updateStatus(id: number, dto: UpdateReservationStatusDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    cancel(id: number, dto: CancelReservationDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    updateTrackingCode(id: number, dto: UpdateReservationTrackingCodeDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    extend(id: number, dto: ExtendReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            createdAt: Date;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            description: string | null;
            facilities: string | null;
            services: string | null;
            serviceStartDate: Date | null;
            serviceEndDate: Date | null;
            maleCapacity: number;
            femaleCapacity: number;
            imageUrl: string | null;
            distanceToShrine: string | null;
            distanceToBusStation: string | null;
            distanceToMetro: string | null;
            lunchReception: boolean;
            breakfastReception: boolean;
            dinnerReception: boolean;
            bathroom: boolean;
            laundry: boolean;
            parking: boolean;
            internet: boolean;
            familyFriendly: boolean;
            elevator: boolean;
            stairs: boolean;
            maxReservationDays: number;
            defaultReservationDays: number;
            country: import("@prisma/client").$Enums.MawkibCountry;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            autoApprovePilgrimReservations: boolean;
            recordCheckInOnReservationConfirm: boolean;
            skipCapacityCheckEnabled: boolean;
            mealPlanManagementEnabled: boolean;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
        _count: {
            mawkib: number;
            pilgrim: number;
            reservedBy: number;
            lastStatusUpdatedBy: number;
            review: number;
            deliveredItems: number;
            events: number;
            mealPlans: number;
        };
        pilgrim: {
            id: number;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        reservedBy: {
            id: number;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        lastStatusUpdatedBy: {
            id: number;
            createdAt: Date;
            description: string | null;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        } | null;
        review: {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        } | null;
        deliveredItems: {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        }[];
        events: {
            id: number;
            reservationId: number;
            createdAt: Date;
            description: string | null;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        }[];
        mealPlans: {
            id: number;
            reservationId: number;
            date: Date;
            mealType: import("@prisma/client").$Enums.MealType;
            isRequired: boolean;
            isServed: boolean;
            servedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
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
    }>;
    checkIn(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    checkOut(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
    }>;
    updateCheckIn(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    updateCheckOut(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    createReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    updateReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    replyToReview(id: number, dto: ReplyReservationReviewDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    createDeliveredItem(id: number, dto: CreateReservationDeliveredItemDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    updateDeliveredItem(id: number, itemId: number, dto: UpdateReservationDeliveredItemDto, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    receiveDeliveredItem(id: number, itemId: number, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    removeDeliveredItem(id: number, itemId: number, user: AuthUser): Promise<{
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
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            reservationId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
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
    }>;
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
}
