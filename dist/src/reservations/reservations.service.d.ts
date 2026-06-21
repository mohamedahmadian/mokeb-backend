import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { CreateReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
export declare class ReservationsService {
    private prisma;
    private mawkibsService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService);
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
    findByPilgrim(pilgrimUserId: number): Promise<({
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
    findByMawkibOwner(ownerUserId: number): Promise<({
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
    create(dto: CreateReservationDto, currentUser: AuthUser): Promise<{
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
    updateStatus(id: number, dto: UpdateReservationStatusDto, currentUser: AuthUser): Promise<{
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
