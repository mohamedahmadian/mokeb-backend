import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { CancelReservationDto, CreateReservationDto, CreateGuestReservationDto, RecordReservationAttendanceDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import { CreateReservationReviewDto, ReplyReservationReviewDto } from './dto/reservation-review.dto';
import { CreateReservationDeliveredItemDto, UpdateReservationDeliveredItemDto } from './dto/reservation-delivered-item.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
export interface PaginatedReservationsResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class ReservationsService {
    private prisma;
    private mawkibsService;
    private usersService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService, usersService: UsersService);
    private buildSearchWhere;
    private filterByGuestCountTotal;
    private applyListPagination;
    findAllAdmin(search?: SearchReservationDto): Promise<({
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
    })[] | PaginatedReservationsResult<{
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
    findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto): Promise<({
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
    })[] | PaginatedReservationsResult<{
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
    findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto): Promise<({
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
    })[] | PaginatedReservationsResult<{
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
    private filterReservationsByMobileSearch;
    findOne(id: number): Promise<{
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
    findByTrackingCode(trackingCode: string): Promise<{
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
    findRecentByMobileForGuest(mobileNumber: string): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
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
    })[]>;
    findOneForUser(id: number, currentUser: AuthUser): Promise<{
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
    private createWithTrackingCode;
    private assertNoConflictingReservation;
    create(dto: CreateReservationDto, currentUser: AuthUser): Promise<{
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
    updateStatus(id: number, dto: UpdateReservationStatusDto, currentUser: AuthUser): Promise<{
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
    cancel(id: number, dto: CancelReservationDto, currentUser: AuthUser): Promise<{
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
    private assertCanRecordAttendance;
    private resolveRecordedAt;
    checkIn(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
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
    checkOut(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
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
    private assertCanManageAttendance;
    updateCheckIn(id: number, currentUser: AuthUser, dto: RecordReservationAttendanceDto): Promise<{
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
    updateCheckOut(id: number, currentUser: AuthUser, dto: RecordReservationAttendanceDto): Promise<{
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
    checkInGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
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
    checkOutGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
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
    private assertCanReviewReservation;
    createReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
    updateReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
    replyToReview(reservationId: number, dto: ReplyReservationReviewDto, currentUser: AuthUser): Promise<{
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
    private assertReservationEligibleForDeliveredItems;
    private assertCanManageDeliveredItems;
    createDeliveredItem(reservationId: number, dto: CreateReservationDeliveredItemDto, currentUser: AuthUser): Promise<{
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
    updateDeliveredItem(reservationId: number, itemId: number, dto: UpdateReservationDeliveredItemDto, currentUser: AuthUser): Promise<{
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
    receiveDeliveredItem(reservationId: number, itemId: number, currentUser: AuthUser): Promise<{
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
    removeDeliveredItem(reservationId: number, itemId: number, currentUser: AuthUser): Promise<{
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
}
