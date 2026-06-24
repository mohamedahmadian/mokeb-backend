import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { HonoraryVolunteerServiceType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateHonoraryVolunteerApplicationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mawkibId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک حوزه خدمت باید انتخاب شود' })
  @IsEnum(HonoraryVolunteerServiceType, { each: true })
  serviceTypes: HonoraryVolunteerServiceType[];

  @IsOptional()
  @IsString()
  serviceDescription?: string;

  @IsDateString()
  availabilityStartDate: string;

  @IsDateString()
  availabilityEndDate: string;

  @IsOptional()
  @IsString()
  availabilityDescription?: string;
}
