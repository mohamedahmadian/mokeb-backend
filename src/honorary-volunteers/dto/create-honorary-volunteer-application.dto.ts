import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { HonoraryVolunteerServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsPinPassword } from '../../common/validators/pin-password.validator';

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
  @IsPinPassword()
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
