import { UsersService } from './users.service';
import { AssignRoleDto, CreateQuickPilgrimDto, CreateUserDto, ListPilgrimsDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';
import { CreateServantDto, ListServantsDto, UpdateServantDto, UpdateServantMawkibAccessDto } from './dto/servant.dto';
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    }>;
    findServants(query: ListServantsDto, user: AuthUser): Promise<{
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    }[]>;
    getServantMawkibAccess(id: number, user: AuthUser): Promise<{
        allMawkibs: boolean;
        mawkibs: {
            id: number;
            name: string;
            status: string;
        }[];
    }>;
    updateServantMawkibAccess(id: number, dto: UpdateServantMawkibAccessDto, user: AuthUser): Promise<{
        allMawkibs: boolean;
        mawkibs: {
            id: number;
            name: string;
            status: string;
        }[];
    }>;
    findServant(id: number, user: AuthUser): Promise<{
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    }>;
    createServant(dto: CreateServantDto, user: AuthUser): Promise<{
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    }>;
    updateServant(id: number, dto: UpdateServantDto, user: AuthUser): Promise<{
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    }>;
    removeServant(id: number, user: AuthUser): Promise<{
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    } | {
        id: number;
        message: string;
        softDeleted: boolean;
    }>;
    findPilgrims(query: ListPilgrimsDto, user: AuthUser): Promise<{
        id: number;
        mobileNumber: string;
        fullName: string;
        city: string | null;
    }[] | {
        items: {
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
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
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
        nationalId: string | null;
        nationalIdCardImageUrl: string | null;
        imageUrl: string | null;
        gender: import("@prisma/client").$Enums.UserGender | null;
        birthDate: Date | null;
        country: string | null;
        passportNumber: string | null;
        province: string | null;
        city: string | null;
        address: string | null;
        carPlate: string | null;
        description: string | null;
        whatsapp: string | null;
        telegram: string | null;
        bale: string | null;
        eitaa: string | null;
        email: string | null;
        isActive: boolean;
        servantMawkibId: number | null;
        servantOwnerUserId: number | null;
        servantAllMawkibsAccess: boolean;
        createdAt: Date;
    }>;
}
