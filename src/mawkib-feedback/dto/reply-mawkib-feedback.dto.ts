import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyMawkibFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  ownerReply: string;
}
