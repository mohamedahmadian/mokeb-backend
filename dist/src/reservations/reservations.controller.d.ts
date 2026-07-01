import { ReservationsService } from './reservations.service';
import { CancelReservationDto, CreateReservationDto, RecordReservationAttendanceDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
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
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[] | import("./reservations.service").PaginatedReservationsResult<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>>;
    findMy(user: AuthUser, search: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[] | import("./reservations.service").PaginatedReservationsResult<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>>;
    findOne(id: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    create(dto: CreateReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            description: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            createdAt: Date;
            address: string;
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
            lunchReception: boolean;
            breakfastReception: boolean;
            dinnerReception: boolean;
            bathroom: boolean;
            laundry: boolean;
            parking: boolean;
            internet: boolean;
            familyFriendly: boolean;
            maxReservationDays: number | null;
            defaultReservationDays: number | null;
            country: import("@prisma/client").$Enums.MawkibCountry;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
        _count: {
            mawkib: number;
            pilgrim: number;
            reservedBy: number;
            review: number;
            deliveredItems: number;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            createdAt: Date;
        };
        review: {
            id: number;
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
            repliedByUserId: number | null;
            authorUserId: number;
        } | null;
        deliveredItems: {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        }[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            createdAt: Date;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    updateStatus(id: number, dto: UpdateReservationStatusDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    cancel(id: number, dto: CancelReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    checkIn(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    checkOut(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    updateCheckIn(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    updateCheckOut(id: number, dto: RecordReservationAttendanceDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    createReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    updateReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    replyToReview(id: number, dto: ReplyReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    createDeliveredItem(id: number, dto: CreateReservationDeliveredItemDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    updateDeliveredItem(id: number, itemId: number, dto: UpdateReservationDeliveredItemDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    receiveDeliveredItem(id: number, itemId: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    removeDeliveredItem(id: number, itemId: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
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
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
}
