import { HonoraryVolunteerApplicationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewHonoraryVolunteerApplicationDto {
  @IsEnum(HonoraryVolunteerApplicationStatus)
  status: 'Approved' | 'Rejected';

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
