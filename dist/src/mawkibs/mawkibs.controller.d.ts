import { MawkibStatus } from '@prisma/client';
import { MawkibsService } from './mawkibs.service';
import { CreateMawkibDto, SearchMawkibDto, UpdateMawkibDto } from './dto/mawkib.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class MawkibsController {
    private mawkibsService;
    constructor(mawkibsService: MawkibsService);
    findAll(search: SearchMawkibDto): Promise<({
        owner: {
            id: number;
            fullName: string;
            province: string | null;
            city: string | null;
        };
    } & {
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
    })[]>;
    findAllAdmin(): Promise<({
        _count: {
            reservations: number;
        };
        owner: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
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
    })[]>;
    findMy(user: AuthUser): Promise<{
        availableCapacity: number;
        _count: {
            reservations: number;
        };
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
    }[]>;
    findOne(id: number): Promise<{
        availableCapacity: number;
        owner: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
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
    }>;
    getCapacity(id: number, date?: string): Promise<number>;
    create(dto: CreateMawkibDto): import("@prisma/client").Prisma.Prisma__MawkibClient<{
        owner: {
            id: number;
            fullName: string;
        };
    } & {
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, dto: UpdateMawkibDto): Promise<{
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
    }>;
    updateStatus(id: number, status: MawkibStatus): Promise<{
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
    }>;
}
