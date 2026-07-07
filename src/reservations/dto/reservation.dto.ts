import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ReservationStatus, UserGender } from '@prisma/client';
import { Type, Transform } from 'class-transformer';
import {
  HAS_GUEST_COUNT_MESSAGE,
  hasGuestCount,
} from '../reservation-guest-count.util';

@ValidatorConstraint({ name: 'hasGuestCount', async: false })
class HasGuestCountConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as {
      maleGuestCount?: number;
      femaleGuestCount?: number;
    };
    return hasGuestCount(obj.maleGuestCount, obj.femaleGuestCount);
  }

  defaultMessage() {
    return HAS_GUEST_COUNT_MESSAGE;
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
  @Validate(HasGuestCountConstraint)
  maleGuestCount: number;

  @IsInt()
  @Min(0)
  femaleGuestCount: number;

  @IsString()
  @IsNotEmpty()
  pilgrimMobile: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  travelOrigin?: string;

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

  /** Admin / mawkib owner only — skips capacity validation on create. */
  @IsOptional()
  @IsBoolean()
  skipCapacityCheck?: boolean;

  /** Admin / mawkib owner only — custom unique tracking code; omit for auto-generation. */
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @MaxLength(64, { message: 'کد رزرو حداکثر ۶۴ کاراکتر می‌تواند باشد' })
  trackingCode?: string;
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

  @IsInt()
  mawkibId: number;

  @IsDateString()
  reservationDate: string;

  @IsDateString()
  reservationEndDate: string;

  @IsInt()
  @Min(0)
  @Validate(HasGuestCountConstraint)
  maleGuestCount: number;

  @IsInt()
  @Min(0)
  femaleGuestCount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  travelOrigin?: string;

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

export class UpdateReservationTrackingCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'کد رزرو الزامی است' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  trackingCode: string;
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
  @IsDateString()
  createdAtFrom?: string;

  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mawkibName?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  pilgrimName?: string;

  @IsOptional()
  @IsString()
  pilgrimMobile?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  pilgrimNationalId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  trackingCode?: string;

  /** Unified track lookup: matches tracking code, mobile, or national ID (OR). */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lookupQuery?: string;

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  all?: boolean;

  /** With lookupQuery: return only the best-matching reservation (no alternatives). */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lookupSingle?: boolean;

  /** With lookupQuery: match fields exactly instead of partial contains. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lookupExact?: boolean;
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

export class TrackByExactMobileDto {
  @IsString()
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mobileNumber: string;
}

export class ExtendReservationDto {
  /** End date of the extension stay (YYYY-MM-DD). Owner/admin only. */
  @IsOptional()
  @IsDateString()
  reservationEndDate?: string;

  /** Stay length in days from extension start. Owner/admin only. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  stayDays?: number;
}

export class RecordReservationAttendanceDto {
  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}

export class GuestRecordAttendanceDto extends TrackReservationDto {
  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
