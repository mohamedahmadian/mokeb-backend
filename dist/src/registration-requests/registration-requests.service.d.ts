import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationRequestDto } from './dto/registration-request.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
export declare class RegistrationRequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        owner: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        capacity: number;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
    })[]>;
    findByOwner(ownerUserId: number): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        capacity: number;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
    }[]>;
    findOne(id: number): Promise<{
        owner: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        capacity: number;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
    }>;
    create(dto: CreateRegistrationRequestDto, currentUser: AuthUser): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        capacity: number;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
    }>;
    review(id: number, status: 'Approved' | 'Rejected'): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        capacity: number;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
    } | {
        request: {
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            capacity: number;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.RegistrationRequestStatus;
            ownerName: string;
            mawkibName: string;
        };
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
    }>;
}
