import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ReservationStatus } from '@prisma/client';

export class CreateReservationDto {
  @IsInt()
  mawkibId: number;

  @IsOptional()
  @IsInt()
  pilgrimUserId?: number;

  @IsDateString()
  reservationDate: string;

  @IsInt()
  @Min(1)
  guestCount: number;

  @IsString()
  @IsNotEmpty()
  pilgrimMobile: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
