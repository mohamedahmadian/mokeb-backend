import { RoleName } from '@prisma/client';
export declare class CreateUserDto {
    fullName: string;
    mobileNumber: string;
    password: string;
    province?: string;
    city?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
    roles: RoleName[];
}
export declare class UpdateUserDto {
    fullName?: string;
    province?: string;
    city?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
    isActive?: boolean;
    password?: string;
    roles?: RoleName[];
}
export declare class AssignRoleDto {
    role: RoleName;
}
export declare class CreateQuickPilgrimDto {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    province?: string;
    city?: string;
    password?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
}
export declare class ListUsersDto {
    role?: RoleName;
    fullName?: string;
    mobileNumber?: string;
    province?: string;
    city?: string;
    isActive?: boolean;
    search?: string;
}
export declare class ListPilgrimsDto extends ListUsersDto {
}
export declare class SearchPilgrimDto {
    search?: string;
}
