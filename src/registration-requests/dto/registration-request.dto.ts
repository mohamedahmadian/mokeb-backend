import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  mawkibName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ReviewRegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  status: 'Approved' | 'Rejected';
}
