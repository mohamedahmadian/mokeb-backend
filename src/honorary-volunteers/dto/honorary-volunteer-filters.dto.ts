import {
  HonoraryVolunteerApplicantType,
  HonoraryVolunteerApplicationStatus,
  HonoraryVolunteerServiceType,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class HonoraryVolunteerFiltersDto {
  @IsOptional()
  @IsEnum(HonoraryVolunteerApplicationStatus)
  status?: HonoraryVolunteerApplicationStatus;

  @IsOptional()
  @IsEnum(HonoraryVolunteerApplicantType)
  applicantType?: HonoraryVolunteerApplicantType;

  @IsOptional()
  @IsEnum(HonoraryVolunteerServiceType)
  serviceType?: HonoraryVolunteerServiceType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mawkibId?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @IsOptional()
  @IsDateString()
  availabilityFrom?: string;

  @IsOptional()
  @IsDateString()
  availabilityTo?: string;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
