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
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    })[] | import("./reservations.service").PaginatedReservationsResult<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>>;
    findMy(user: AuthUser, search: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    })[] | import("./reservations.service").PaginatedReservationsResult<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }) | null>;
    trackByMobile(query: TrackByMobileDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            phoneNumber: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    create(dto: CreateReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            country: import("@prisma/client").$Enums.MawkibCountry;
            address: string;
            description: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.MawkibStatus;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            facilities: string | null;
            services: string | null;
            serviceStartDate: Date | null;
            serviceEndDate: Date | null;
            maleCapacity: number;
            femaleCapacity: number;
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
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            autoApprovePilgrimReservations: boolean;
            recordCheckInOnReservationConfirm: boolean;
            skipCapacityCheckEnabled: boolean;
            mealPlanManagementEnabled: boolean;
            acceptanceType: import("@prisma/client").$Enums.MawkibAcceptanceType;
            stayDurationMode: import("@prisma/client").$Enums.MawkibStayDurationMode;
            fixedStayDays: number | null;
            reservationStartMode: import("@prisma/client").$Enums.MawkibReservationStartMode;
            formShowNationalId: boolean;
            formShowPassportNumber: boolean;
            formShowReservationCode: boolean;
            formShowCarPlate: boolean;
            formShowGender: boolean;
            formShowPassword: boolean;
            formShowLocation: boolean;
            formShowNationalIdCardImage: boolean;
            ownerUserId: number;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        };
        lastStatusUpdatedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        } | null;
        review: {
            id: number;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        } | null;
        deliveredItems: {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        }[];
        events: {
            id: number;
            description: string | null;
            createdAt: Date;
            reservationId: number;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        }[];
        mealPlans: {
            id: number;
            createdAt: Date;
            reservationId: number;
            date: Date;
            updatedAt: Date;
            mealType: import("@prisma/client").$Enums.MealType;
            isRequired: boolean;
            guestCount: number;
            isServed: boolean;
            servedAt: Date | null;
        }[];
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
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    updateStatus(id: number, dto: UpdateReservationStatusDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    cancel(id: number, dto: CancelReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    updateTrackingCode(id: number, dto: UpdateReservationTrackingCodeDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    extend(id: number, dto: ExtendReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    checkIn(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    checkOut(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mealPlanNotice: string | undefined;
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    updateCheckIn(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    updateCheckOut(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    createReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    updateReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    replyToReview(id: number, dto: ReplyReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    createDeliveredItem(id: number, dto: CreateReservationDeliveredItemDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    updateDeliveredItem(id: number, itemId: number, dto: UpdateReservationDeliveredItemDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    receiveDeliveredItem(id: number, itemId: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    removeDeliveredItem(id: number, itemId: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        }) | null;
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
}
