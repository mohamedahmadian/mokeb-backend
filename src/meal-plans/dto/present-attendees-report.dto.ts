import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt } from 'class-validator';
import { MealType } from '@prisma/client';

export class PresentAttendeesReportQueryDto {
  @Type(() => Number)
  @IsInt()
  mawkibId: number;

  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;
}
