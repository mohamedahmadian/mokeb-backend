import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReservationReviewDto {
  @IsString({ message: 'متن نظر نامعتبر است' })
  @IsNotEmpty({ message: 'متن نظر الزامی است' })
  @MaxLength(2000, { message: 'نظر نباید بیشتر از ۲۰۰۰ کاراکتر باشد' })
  content: string;
}

export class ReplyReservationReviewDto {
  @IsString({ message: 'متن پاسخ نامعتبر است' })
  @IsNotEmpty({ message: 'متن پاسخ الزامی است' })
  @MaxLength(2000, { message: 'پاسخ نباید بیشتر از ۲۰۰۰ کاراکتر باشد' })
  adminReply: string;
}
