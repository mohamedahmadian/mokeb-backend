import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { MawkibCity, MawkibCountry, MawkibStatus } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export enum MawkibCapacityFilter {
  All = 'all',
  Available = 'available',
  Full = 'full',
}

export class CreateMawkibDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  facilities?: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsDateString()
  serviceStartDate?: string;

  @IsOptional()
  @IsDateString()
  serviceEndDate?: string;

  @IsInt()
  @Min(0)
  maleCapacity: number;

  @IsInt()
  @Min(0)
  femaleCapacity: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  distanceToShrine?: string;

  @IsOptional()
  @IsBoolean()
  lunchReception?: boolean;

  @IsOptional()
  @IsBoolean()
  breakfastReception?: boolean;

  @IsOptional()
  @IsBoolean()
  dinnerReception?: boolean;

  @IsOptional()
  @IsBoolean()
  bathroom?: boolean;

  @IsOptional()
  @IsBoolean()
  laundry?: boolean;

  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  internet?: boolean;

  @IsOptional()
  @IsBoolean()
  familyFriendly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxReservationDays?: number;

  @IsOptional()
  @IsEnum(MawkibCountry)
  country?: MawkibCountry;

  @IsOptional()
  @IsEnum(MawkibCity)
  mawkibCity?: MawkibCity;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsString()
  telegramChannel?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  bale?: string;

  @IsOptional()
  @IsString()
  eitaa?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت ورود پیش‌فرض باید به فرمت HH:mm باشد',
  })
  defaultCheckInTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت خروج پیش‌فرض باید به فرمت HH:mm باشد',
  })
  defaultCheckOutTime?: string;

  @IsInt()
  ownerUserId: number;

  @IsOptional()
  @IsEnum(MawkibStatus)
  status?: MawkibStatus;
}

export class UpdateMawkibDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  facilities?: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsDateString()
  serviceStartDate?: string;

  @IsOptional()
  @IsDateString()
  serviceEndDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  maleCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  femaleCapacity?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  distanceToShrine?: string;

  @IsOptional()
  @IsBoolean()
  lunchReception?: boolean;

  @IsOptional()
  @IsBoolean()
  breakfastReception?: boolean;

  @IsOptional()
  @IsBoolean()
  dinnerReception?: boolean;

  @IsOptional()
  @IsBoolean()
  bathroom?: boolean;

  @IsOptional()
  @IsBoolean()
  laundry?: boolean;

  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  internet?: boolean;

  @IsOptional()
  @IsBoolean()
  familyFriendly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxReservationDays?: number;

  @IsOptional()
  @IsEnum(MawkibCountry)
  country?: MawkibCountry;

  @IsOptional()
  @IsEnum(MawkibCity)
  mawkibCity?: MawkibCity;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsString()
  telegramChannel?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  bale?: string;

  @IsOptional()
  @IsString()
  eitaa?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت ورود پیش‌فرض باید به فرمت HH:mm باشد',
  })
  defaultCheckInTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت خروج پیش‌فرض باید به فرمت HH:mm باشد',
  })
  defaultCheckOutTime?: string;

  @IsOptional()
  @IsInt()
  ownerUserId?: number;

  @IsOptional()
  @IsEnum(MawkibStatus)
  status?: MawkibStatus;
}

export class SearchMawkibDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(MawkibCity)
  mawkibCity?: MawkibCity;

  @IsOptional()
  @IsDateString()
  reservationDate?: string;

  @IsOptional()
  @IsDateString()
  reservationDateFrom?: string;

  @IsOptional()
  @IsDateString()
  reservationDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAvailableMaleCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAvailableFemaleCapacity?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasAvailability?: boolean;

  @IsOptional()
  @IsEnum(MawkibCapacityFilter)
  capacityFilter?: MawkibCapacityFilter;

  @IsOptional()
  @IsDateString()
  serviceStartFrom?: string;

  @IsOptional()
  @IsDateString()
  serviceStartTo?: string;

  @IsOptional()
  @IsDateString()
  serviceEndFrom?: string;

  @IsOptional()
  @IsDateString()
  serviceEndTo?: string;
}

export class AdminSearchMawkibDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerUserId?: number;

  @IsOptional()
  @IsEnum(MawkibStatus)
  status?: MawkibStatus;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsDateString()
  serviceStartFrom?: string;

  @IsOptional()
  @IsDateString()
  serviceStartTo?: string;

  @IsOptional()
  @IsDateString()
  serviceEndFrom?: string;

  @IsOptional()
  @IsDateString()
  serviceEndTo?: string;

  @IsOptional()
  @IsEnum(MawkibCapacityFilter)
  capacityFilter?: MawkibCapacityFilter;

  @IsOptional()
  @IsDateString()
  reservationDate?: string;

  @IsOptional()
  @IsDateString()
  reservationDateFrom?: string;

  @IsOptional()
  @IsDateString()
  reservationDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAvailableMaleCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAvailableFemaleCapacity?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasAvailability?: boolean;
}
