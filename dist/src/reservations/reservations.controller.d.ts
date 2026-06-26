import { ReservationsService } from './reservations.service';
import { CancelReservationDto, CreateReservationDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import { CreateReservationReviewDto, ReplyReservationReviewDto } from './dto/reservation-review.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    findAllAdmin(search: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    })[]>;
    findMy(user: AuthUser, search: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    })[]>;
    findOne(id: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    create(dto: CreateReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.MawkibStatus;
            createdAt: Date;
            name: string;
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
            imageUrl: string | null;
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
            ownerUserId: number;
        };
        pilgrim: {
            id: number;
            description: string | null;
            createdAt: Date;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        reservedBy: {
            id: number;
            description: string | null;
            createdAt: Date;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        review: {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        } | null;
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    updateStatus(id: number, dto: UpdateReservationStatusDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    cancel(id: number, dto: CancelReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    checkIn(id: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    checkOut(id: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    createReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    updateReview(id: number, dto: CreateReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    replyToReview(id: number, dto: ReplyReservationReviewDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
}
