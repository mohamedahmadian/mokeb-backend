import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { UserGender } from '@prisma/client';
import { IsPinPassword } from '../../common/validators/pin-password.validator';

export class RegisterPilgrimDto {
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
  nationalId?: string;

  @IsOptional()
  @IsString()
  nationalIdCardImageUrl?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsString()
  @IsPinPassword()
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
}

export class RegisterMawkibOwnerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsString()
  @IsPinPassword()
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
}
