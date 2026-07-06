import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReservationEventType } from '@prisma/client';

export class RecordReservationEventDto {
  @IsEnum(ReservationEventType)
  eventType!: ReservationEventType;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
