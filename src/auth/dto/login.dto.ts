import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'شماره موبایل نامعتبر است' })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  mobileNumber: string;

  @IsString({ message: 'رمز عبور نامعتبر است' })
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(4, { message: 'رمز عبور باید حداقل ۴ کاراکتر باشد' })
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  province?: string;

  @IsString()
  city?: string;
}
