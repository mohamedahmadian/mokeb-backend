import { RoleName, UserGender } from '@prisma/client';
export declare class CreateUserDto {
    fullName: string;
    mobileNumber: string;
    nationalId?: string;
    nationalIdCardImageUrl?: string;
    gender?: UserGender;
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
    nationalId?: string;
    nationalIdCardImageUrl?: string | null;
    imageUrl?: string | null;
    gender?: UserGender | null;
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
    nationalId?: string;
    nationalIdCardImageUrl?: string;
    gender?: UserGender;
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
    nationalId?: string;
    province?: string;
    city?: string;
    isActive?: boolean;
    search?: string;
}
export declare enum PilgrimListScope {
    Mine = "mine",
    All = "all"
}
export declare class ListPilgrimsDto extends ListUsersDto {
    scope?: PilgrimListScope;
    mawkibId?: number;
    page?: number;
    pageSize?: number;
    all?: boolean;
}
export declare class SearchPilgrimDto {
    search?: string;
}
