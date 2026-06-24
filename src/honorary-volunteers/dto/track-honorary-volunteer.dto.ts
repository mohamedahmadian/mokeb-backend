import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class TrackHonoraryVolunteerDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  trackingCode: string;
}

export class TrackHonoraryVolunteerByMobileDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mobileNumber: string;
}
