import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'رمز عبور فعلی نامعتبر است' })
  @IsNotEmpty({ message: 'رمز عبور فعلی الزامی است' })
  currentPassword: string;

  @IsString({ message: 'رمز عبور جدید نامعتبر است' })
  @IsNotEmpty({ message: 'رمز عبور جدید الزامی است' })
  @MinLength(4, { message: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد' })
  newPassword: string;
}
