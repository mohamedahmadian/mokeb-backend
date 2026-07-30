import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  MawkibAcceptanceType,
  MawkibReservationStartMode,
  MawkibStayDurationMode,
  UserGender,
} from '@prisma/client';

export class UpsertUserFastReceptionPatternDto {
  @IsEnum(MawkibAcceptanceType)
  acceptanceType: MawkibAcceptanceType;

  @ValidateIf(
    (o) =>
      o.acceptanceType === MawkibAcceptanceType.Individual &&
      o.individualGuestGender != null,
  )
  @IsEnum(UserGender)
  individualGuestGender?: UserGender | null;

  @IsOptional()
  @ValidateIf((o) => o.defaultMawkibId != null)
  @IsInt()
  @Min(1)
  defaultMawkibId?: number | null;

  @IsEnum(MawkibStayDurationMode)
  stayDurationMode: MawkibStayDurationMode;

  @ValidateIf((o) => o.stayDurationMode === MawkibStayDurationMode.Fixed)
  @IsInt()
  @Min(1)
  @IsOptional()
  fixedStayDays?: number | null;

  @IsEnum(MawkibReservationStartMode)
  reservationStartMode: MawkibReservationStartMode;

  @IsBoolean()
  formShowNationalId: boolean;

  @IsBoolean()
  formShowPassportNumber: boolean;

  @IsBoolean()
  formShowReservationCode: boolean;

  @IsBoolean()
  formShowCarPlate: boolean;

  @IsBoolean()
  formShowGender: boolean;

  @IsBoolean()
  formShowPassword: boolean;

  @IsBoolean()
  formShowLocation: boolean;

  @IsBoolean()
  formShowNationalIdCardImage: boolean;

  @IsBoolean()
  formShowBirthDate: boolean;

  @IsBoolean()
  formShowTravelOrigin: boolean;

  @IsBoolean()
  formShowDescription: boolean;
}
