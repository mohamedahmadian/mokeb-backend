import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    findAllAdmin(): Promise<({
        mawkib: {
            id: number;
            name: string;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        guestCount: number;
        pilgrimMobile: string;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[]>;
    findMy(user: AuthUser): Promise<({
        mawkib: {
            id: number;
            name: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        guestCount: number;
        pilgrimMobile: string;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[]> | Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        guestCount: number;
        pilgrimMobile: string;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[]>;
    findOne(id: number): Promise<{
        mawkib: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            capacity: number;
            imageUrl: string | null;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        guestCount: number;
        pilgrimMobile: string;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    create(dto: CreateReservationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        guestCount: number;
        pilgrimMobile: string;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    updateStatus(id: number, dto: UpdateReservationStatusDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        guestCount: number;
        pilgrimMobile: string;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
}
