import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { MealType } from '@prisma/client';

export class MealPlanEntryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsBoolean()
  isRequired: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount?: number;
}

export class SaveMealPlansDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealPlanEntryDto)
  entries: MealPlanEntryDto[];
}

export class AddMealPlanDayDto {
  @IsDateString()
  date: string;
}

export class UpsertMealPlanEntryDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsBoolean()
  isRequired: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount?: number;
}

export class MarkMealServedDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount: number;
}
