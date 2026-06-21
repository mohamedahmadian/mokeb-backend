import { PrismaService } from '../prisma/prisma.service';
import { AssignRoleDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    private sanitize;
    findAll(): Promise<{
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
        softDeleted: boolean;
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    } | {
        id: number;
        message: string;
        softDeleted: boolean;
    }>;
    assignRole(id: number, dto: AssignRoleDto): Promise<{
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    removeRole(id: number, roleName: string): Promise<{
        roles: ({
            role: {
                id: number;
                name: import("@prisma/client").$Enums.RoleName;
            };
        } & {
            roleId: number;
            userId: number;
        })[];
        id: number;
        mobileNumber: string;
        fullName: string;
        province: string | null;
        city: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
}
