import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MawkibFeedbackFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mawkibId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorUserId?: number;

  @IsOptional()
  @IsIn(['all', 'replied', 'pending'])
  replyStatus?: 'all' | 'replied' | 'pending';

  @IsOptional()
  @IsString()
  createdFrom?: string;

  @IsOptional()
  @IsString()
  createdTo?: string;
}
