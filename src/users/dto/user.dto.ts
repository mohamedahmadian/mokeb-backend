import {
  ArrayMinSize,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RoleName } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  bale?: string;

  @IsOptional()
  @IsString()
  eitaa?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(RoleName, { each: true })
  @ArrayMinSize(1)
  roles: RoleName[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  bale?: string;

  @IsOptional()
  @IsString()
  eitaa?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsOptional()
  @IsEnum(RoleName, { each: true })
  @ArrayMinSize(1)
  roles?: RoleName[];
}

export class AssignRoleDto {
  @IsEnum(RoleName)
  @IsNotEmpty()
  role: RoleName;
}

export class CreateQuickPilgrimDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  bale?: string;

  @IsOptional()
  @IsString()
  eitaa?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ListUsersDto {
  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export enum PilgrimListScope {
  Mine = 'mine',
  All = 'all',
}

export class ListPilgrimsDto extends ListUsersDto {
  @IsOptional()
  @IsEnum(PilgrimListScope)
  scope?: PilgrimListScope;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mawkibId?: number;
}

/** @deprecated use ListPilgrimsDto */
export class SearchPilgrimDto {
  @IsOptional()
  @IsString()
  search?: string;
}
