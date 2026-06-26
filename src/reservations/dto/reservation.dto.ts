import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ReservationStatus } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'hasGuestCount', async: false })
class HasGuestCountConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as { maleGuestCount?: number; femaleGuestCount?: number };
    return (obj.maleGuestCount ?? 0) + (obj.femaleGuestCount ?? 0) > 0;
  }

  defaultMessage() {
    return 'حداقل یک نفر (آقا یا خانم) باید برای رزرو وارد شود';
  }
}

export class CreateReservationDto {
  @IsInt()
  mawkibId: number;

  @IsOptional()
  @IsInt()
  pilgrimUserId?: number;

  @IsDateString()
  reservationDate: string;

  @IsOptional()
  @IsDateString()
  reservationEndDate?: string;

  @IsInt()
  @Min(0)
  maleGuestCount: number;

  @IsInt()
  @Min(0)
  femaleGuestCount: number;

  @Validate(HasGuestCountConstraint)
  private readonly _guestCheck?: never;

  @IsString()
  @IsNotEmpty()
  pilgrimMobile: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  companions?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت ورود باید به فرمت HH:mm باشد',
  })
  plannedCheckInTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت خروج باید به فرمت HH:mm باشد',
  })
  plannedCheckOutTime?: string;
}

export class CreateGuestReservationDto {
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
  @MinLength(4, { message: 'رمز عبور باید حداقل ۴ کاراکتر باشد' })
  password?: string;

  @IsInt()
  mawkibId: number;

  @IsDateString()
  reservationDate: string;

  @IsDateString()
  reservationEndDate: string;

  @IsInt()
  @Min(0)
  maleGuestCount: number;

  @IsInt()
  @Min(0)
  femaleGuestCount: number;

  @Validate(HasGuestCountConstraint)
  private readonly _guestCheck?: never;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  companions?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت ورود باید به فرمت HH:mm باشد',
  })
  plannedCheckInTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'ساعت خروج باید به فرمت HH:mm باشد',
  })
  plannedCheckOutTime?: string;
}

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}

export class CancelReservationDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class SearchReservationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mawkibId?: number;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsDateString()
  reservationDateFrom?: string;

  @IsOptional()
  @IsDateString()
  reservationDateTo?: string;

  @IsOptional()
  @IsString()
  pilgrimName?: string;

  @IsOptional()
  @IsString()
  pilgrimMobile?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  trackingCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pilgrimUserId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  guestCountMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  guestCountMax?: number;
}

export class TrackReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'کد رزرو الزامی است' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  trackingCode: string;
}

export class TrackByMobileDto {
  @IsString()
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mobileNumber: string;
}
