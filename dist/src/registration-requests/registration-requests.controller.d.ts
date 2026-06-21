import { RegistrationRequestsService } from './registration-requests.service';
import { CreateRegistrationRequestDto, ReviewRegistrationRequestDto } from './dto/registration-request.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class RegistrationRequestsController {
    private service;
    constructor(service: RegistrationRequestsService);
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
    findMy(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(dto: CreateRegistrationRequestDto, user: AuthUser): Promise<{
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
    review(id: number, dto: ReviewRegistrationRequestDto): Promise<{
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
