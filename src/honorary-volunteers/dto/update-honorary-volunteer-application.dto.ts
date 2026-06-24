import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { HonoraryVolunteerServiceType } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateHonoraryVolunteerApplicationDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

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
  @Type(() => Number)
  @IsInt()
  mawkibId?: number | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک حوزه خدمت باید انتخاب شود' })
  @IsEnum(HonoraryVolunteerServiceType, { each: true })
  serviceTypes?: HonoraryVolunteerServiceType[];

  @IsOptional()
  @IsString()
  serviceDescription?: string;

  @IsOptional()
  @IsDateString()
  availabilityStartDate?: string;

  @IsOptional()
  @IsDateString()
  availabilityEndDate?: string;

  @IsOptional()
  @IsString()
  availabilityDescription?: string;
}
