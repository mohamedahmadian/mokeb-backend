import { IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMawkibFeedbackDto {
  @IsInt()
  mawkibId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  content: string;
}
