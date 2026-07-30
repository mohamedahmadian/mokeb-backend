import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  MawkibAcceptanceType,
  MawkibReservationStartMode,
  MawkibStayDurationMode,
  MawkibStatus,
  UserGender,
  RoleName,
} from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ServantMawkibAccessService } from '../users/servant-mawkib-access.service';
import { UpsertUserFastReceptionPatternDto } from './dto/upsert-user-fast-reception-pattern.dto';

export type UserFastReceptionPatternResponse = {
  acceptanceType: MawkibAcceptanceType;
  stayDurationMode: MawkibStayDurationMode;
  fixedStayDays: number | null;
  reservationStartMode: MawkibReservationStartMode;
  individualGuestGender: UserGender | null;
  defaultMawkibId: number | null;
  defaultMawkibName: string | null;
  formShowNationalId: boolean;
  formShowPassportNumber: boolean;
  formShowReservationCode: boolean;
  formShowCarPlate: boolean;
  formShowGender: boolean;
  formShowPassword: boolean;
  formShowLocation: boolean;
  formShowNationalIdCardImage: boolean;
  formShowBirthDate: boolean;
  formShowTravelOrigin: boolean;
  formShowDescription: boolean;
  updatedAt: string | null;
};

const DEFAULT_PATTERN = {
  acceptanceType: MawkibAcceptanceType.Group,
  stayDurationMode: MawkibStayDurationMode.Free,
  fixedStayDays: null as number | null,
  reservationStartMode: MawkibReservationStartMode.UserSelect,
  individualGuestGender: null as UserGender | null,
  defaultMawkibId: null as number | null,
  defaultMawkibName: null as string | null,
  formShowNationalId: false,
  formShowPassportNumber: false,
  formShowReservationCode: false,
  formShowCarPlate: false,
  formShowGender: false,
  formShowPassword: false,
  formShowLocation: false,
  formShowNationalIdCardImage: false,
  formShowBirthDate: false,
  formShowTravelOrigin: false,
  formShowDescription: false,
};

@Injectable()
export class FastReceptionPatternService {
  constructor(
    private prisma: PrismaService,
    private servantMawkibAccess: ServantMawkibAccessService,
  ) {}

  private assertCanManagePattern(user: AuthUser) {
    const allowed =
      user.roles.includes(RoleName.Admin) ||
      user.roles.includes(RoleName.MawkibOwner) ||
      user.roles.includes(RoleName.MawkibServant);
    if (!allowed) {
      throw new ForbiddenException('دسترسی به الگوی پذیرش سریع مجاز نیست');
    }
  }

  private async assertMawkibAccess(user: AuthUser, mawkibId: number) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { id: true, ownerUserId: true, status: true },
    });
    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب انتخاب‌شده معتبر نیست');
    }
    if (user.roles.includes(RoleName.Admin)) {
      return;
    }
    if (user.roles.includes(RoleName.MawkibOwner)) {
      if (mawkib.ownerUserId !== user.id) {
        throw new BadRequestException('دسترسی به این موکب مجاز نیست');
      }
      return;
    }
    if (user.roles.includes(RoleName.MawkibServant)) {
      const hasAccess = await this.servantMawkibAccess.hasAccess(
        user.id,
        mawkibId,
      );
      if (!hasAccess) {
        throw new BadRequestException('دسترسی به این موکب مجاز نیست');
      }
      return;
    }
    throw new ForbiddenException('دسترسی به الگوی پذیرش سریع مجاز نیست');
  }

  private async normalizeDto(
    user: AuthUser,
    dto: UpsertUserFastReceptionPatternDto,
  ) {
    const defaultMawkibId = dto.defaultMawkibId ?? null;
    if (defaultMawkibId != null) {
      await this.assertMawkibAccess(user, defaultMawkibId);
    }

    const base = {
      ...dto,
      defaultMawkibId,
      individualGuestGender:
        dto.acceptanceType === MawkibAcceptanceType.Individual
          ? (dto.individualGuestGender ?? null)
          : null,
    };

    if (dto.stayDurationMode === MawkibStayDurationMode.Fixed) {
      const days = dto.fixedStayDays;
      if (days == null || !Number.isInteger(days) || days < 1) {
        throw new BadRequestException(
          'برای مدت اقامت ثابت، تعداد روزهای رزرو پیش‌فرض الزامی است',
        );
      }
      return { ...base, fixedStayDays: days };
    }
    return { ...base, fixedStayDays: null };
  }

  private toResponse(
    row: {
      acceptanceType: MawkibAcceptanceType;
      stayDurationMode: MawkibStayDurationMode;
      fixedStayDays: number | null;
      reservationStartMode: MawkibReservationStartMode;
      individualGuestGender: UserGender | null;
      defaultMawkibId: number | null;
      defaultMawkib: { name: string } | null;
      formShowNationalId: boolean;
      formShowPassportNumber: boolean;
      formShowReservationCode: boolean;
      formShowCarPlate: boolean;
      formShowGender: boolean;
      formShowPassword: boolean;
      formShowLocation: boolean;
      formShowNationalIdCardImage: boolean;
      formShowBirthDate: boolean;
      formShowTravelOrigin: boolean;
      formShowDescription: boolean;
      updatedAt: Date;
    } | null,
  ): UserFastReceptionPatternResponse {
    if (!row) {
      return { ...DEFAULT_PATTERN, updatedAt: null };
    }
    return {
      acceptanceType: row.acceptanceType,
      stayDurationMode: row.stayDurationMode,
      fixedStayDays: row.fixedStayDays,
      reservationStartMode: row.reservationStartMode,
      individualGuestGender: row.individualGuestGender,
      defaultMawkibId: row.defaultMawkibId,
      defaultMawkibName: row.defaultMawkib?.name ?? null,
      formShowNationalId: row.formShowNationalId,
      formShowPassportNumber: row.formShowPassportNumber,
      formShowReservationCode: row.formShowReservationCode,
      formShowCarPlate: row.formShowCarPlate,
      formShowGender: row.formShowGender,
      formShowPassword: row.formShowPassword,
      formShowLocation: row.formShowLocation,
      formShowNationalIdCardImage: row.formShowNationalIdCardImage,
      formShowBirthDate: row.formShowBirthDate,
      formShowTravelOrigin: row.formShowTravelOrigin,
      formShowDescription: row.formShowDescription,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private patternInclude = {
    defaultMawkib: { select: { name: true } },
  } as const;

  async getMine(user: AuthUser): Promise<UserFastReceptionPatternResponse> {
    this.assertCanManagePattern(user);
    const row = await this.prisma.userFastReceptionPattern.findUnique({
      where: { userId: user.id },
      include: this.patternInclude,
    });
    return this.toResponse(row);
  }

  async upsertMine(
    user: AuthUser,
    dto: UpsertUserFastReceptionPatternDto,
  ): Promise<UserFastReceptionPatternResponse> {
    this.assertCanManagePattern(user);
    const normalized = await this.normalizeDto(user, dto);
    const row = await this.prisma.userFastReceptionPattern.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...normalized,
      },
      update: normalized,
      include: this.patternInclude,
    });
    return this.toResponse(row);
  }
}
