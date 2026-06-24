import { UsersService } from './users.service';
import { AssignRoleDto, CreateQuickPilgrimDto, CreateUserDto, ListPilgrimsDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findMe(user: AuthUser): Promise<{
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    findPilgrims(query: ListPilgrimsDto, user: AuthUser): Promise<{
        id: number;
        mobileNumber: string;
        fullName: string;
        city: string | null;
    }[]>;
    findAll(query: ListUsersDto): Promise<{
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: number, user: AuthUser): Promise<{
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    createQuickPilgrim(dto: CreateQuickPilgrimDto): Promise<{
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto, user: AuthUser): Promise<{
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
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
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
}
