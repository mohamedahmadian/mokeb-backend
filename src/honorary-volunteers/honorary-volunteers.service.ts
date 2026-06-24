import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  HonoraryVolunteerApplicantType,
  HonoraryVolunteerApplicationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { generateHonoraryVolunteerTrackingCode } from '../common/utils/honorary-volunteer-code.util';
import { CreateHonoraryVolunteerApplicationDto } from './dto/create-honorary-volunteer-application.dto';
import { CreateAuthenticatedVolunteerApplicationDto } from './dto/create-authenticated-volunteer-application.dto';
import { CreateMawkibNeedDto } from './dto/create-mawkib-need.dto';
import { HonoraryVolunteerFiltersDto } from './dto/honorary-volunteer-filters.dto';
import { ReviewHonoraryVolunteerApplicationDto } from './dto/review-honorary-volunteer-application.dto';
import { UpdateHonoraryVolunteerApplicationDto } from './dto/update-honorary-volunteer-application.dto';

type ApplicationInput = CreateMawkibNeedDto;

const applicationInclude = {
  reviewedBy: { select: { id: true, fullName: true } },
  submittedBy: { select: { id: true, fullName: true, mobileNumber: true } },
  mawkib: {
    select: {
      id: true,
      name: true,
      address: true,
      mawkibCity: true,
      phoneNumber: true,
      owner: { select: { id: true, fullName: true, mobileNumber: true } },
    },
  },
} satisfies Prisma.HonoraryVolunteerApplicationInclude;

@Injectable()
export class HonoraryVolunteersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  private validateDateRange(start: string, end: string) {
    const startDate = start.slice(0, 10);
    const endDate = end.slice(0, 10);
    if (endDate < startDate) {
      throw new BadRequestException(
        'تاریخ پایان همکاری نمی‌تواند قبل از تاریخ شروع باشد',
      );
    }
    return { startDate, endDate };
  }

  private async assertMawkibExists(mawkibId?: number) {
    if (!mawkibId) return;
    const mawkib = await this.prisma.mawkib.findUnique({ where: { id: mawkibId } });
    if (!mawkib) {
      throw new BadRequestException('موکب انتخاب‌شده یافت نشد');
    }
  }

  private async assertOwnerMawkib(mawkibId: number | undefined, ownerUserId: number) {
    if (!mawkibId) return;
    const mawkib = await this.prisma.mawkib.findFirst({
      where: { id: mawkibId, ownerUserId },
    });
    if (!mawkib) {
      throw new ForbiddenException('شما مجاز به ثبت نیاز برای این موکب نیستید');
    }
  }

  private buildWhere(
    filters: HonoraryVolunteerFiltersDto,
    extra?: Prisma.HonoraryVolunteerApplicationWhereInput,
  ): Prisma.HonoraryVolunteerApplicationWhereInput {
    const where: Prisma.HonoraryVolunteerApplicationWhereInput = { ...extra };

    if (filters.status) where.status = filters.status;
    if (filters.applicantType) where.applicantType = filters.applicantType;
    if (filters.mawkibId) where.mawkibId = filters.mawkibId;

    if (filters.serviceType) {
      where.serviceTypes = { has: filters.serviceType };
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { mobileNumber: { contains: filters.search } },
        { trackingCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.availabilityFrom) {
      where.availabilityEndDate = {
        ...(where.availabilityEndDate as Prisma.DateTimeFilter | undefined),
        gte: new Date(filters.availabilityFrom.slice(0, 10)),
      };
    }

    if (filters.availabilityTo) {
      where.availabilityStartDate = {
        ...(where.availabilityStartDate as Prisma.DateTimeFilter | undefined),
        lte: new Date(filters.availabilityTo.slice(0, 10)),
      };
    }

    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = new Date(filters.createdFrom.slice(0, 10));
      }
      if (filters.createdTo) {
        const end = new Date(filters.createdTo.slice(0, 10));
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return where;
  }

  private mapApplicationData(
    dto: ApplicationInput,
    applicantType: HonoraryVolunteerApplicantType,
    submittedByUserId: number,
  ) {
    const { startDate, endDate } = this.validateDateRange(
      dto.availabilityStartDate,
      dto.availabilityEndDate,
    );

    return {
      trackingCode: generateHonoraryVolunteerTrackingCode(),
      applicantType,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      mobileNumber: dto.mobileNumber.trim(),
      province: dto.province?.trim() || null,
      city: dto.city?.trim() || null,
      mawkibId: dto.mawkibId ?? null,
      submittedByUserId,
      description: dto.description?.trim() || null,
      serviceTypes: dto.serviceTypes,
      serviceDescription: dto.serviceDescription?.trim() || null,
      availabilityStartDate: new Date(startDate),
      availabilityEndDate: new Date(endDate),
      availabilityDescription: dto.availabilityDescription?.trim() || null,
    };
  }

  async createVolunteer(dto: CreateHonoraryVolunteerApplicationDto) {
    await this.assertMawkibExists(dto.mawkibId);

    const auth = await this.authService.registerHonoraryServant({
      firstName: dto.firstName,
      lastName: dto.lastName,
      mobileNumber: dto.mobileNumber,
      password: dto.password,
      province: dto.province,
      city: dto.city,
    });

    const application = await this.prisma.honoraryVolunteerApplication.create({
      data: this.mapApplicationData(
        dto,
        HonoraryVolunteerApplicantType.Volunteer,
        auth.user.id,
      ),
      include: applicationInclude,
    });

    return {
      ...application,
      accessToken: auth.accessToken,
      user: auth.user,
    };
  }

  async createVolunteerForAuthenticatedUser(
    dto: CreateAuthenticatedVolunteerApplicationDto,
    user: AuthUser,
  ) {
    await this.assertMawkibExists(dto.mawkibId);

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.isActive) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    await this.authService.assignHonoraryServantRole(dbUser.id);

    const nameParts = dbUser.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const application = await this.prisma.honoraryVolunteerApplication.create({
      data: this.mapApplicationData(
        {
          firstName,
          lastName,
          mobileNumber: dbUser.mobileNumber,
          province: dbUser.province ?? undefined,
          city: dbUser.city ?? undefined,
          mawkibId: dto.mawkibId,
          description: dto.description,
          serviceTypes: dto.serviceTypes,
          serviceDescription: dto.serviceDescription,
          availabilityStartDate: dto.availabilityStartDate,
          availabilityEndDate: dto.availabilityEndDate,
          availabilityDescription: dto.availabilityDescription,
        },
        HonoraryVolunteerApplicantType.Volunteer,
        dbUser.id,
      ),
      include: applicationInclude,
    });

    return application;
  }

  async createMawkibNeed(dto: CreateMawkibNeedDto, ownerUserId: number) {
    await this.assertOwnerMawkib(dto.mawkibId, ownerUserId);

    const now = new Date();
    const application = await this.prisma.honoraryVolunteerApplication.create({
      data: {
        ...this.mapApplicationData(
          dto,
          HonoraryVolunteerApplicantType.MawkibOwner,
          ownerUserId,
        ),
        status: HonoraryVolunteerApplicationStatus.Approved,
        reviewedAt: now,
        reviewedByUserId: ownerUserId,
      },
      include: applicationInclude,
    });

    return application;
  }

  findPublicNeeds(filters: HonoraryVolunteerFiltersDto) {
    const { status: _status, applicantType: _applicantType, ...publicFilters } = filters;

    return this.prisma.honoraryVolunteerApplication.findMany({
      where: this.buildWhere(publicFilters, {
        applicantType: HonoraryVolunteerApplicantType.MawkibOwner,
        status: HonoraryVolunteerApplicationStatus.Approved,
      }),
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(filters: HonoraryVolunteerFiltersDto) {
    return this.prisma.honoraryVolunteerApplication.findMany({
      where: this.buildWhere(filters),
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(user: AuthUser) {
    return this.prisma.honoraryVolunteerApplication.findMany({
      where: {
        OR: [
          { submittedByUserId: user.id },
          { mobileNumber: user.mobileNumber },
        ],
      },
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTrackingCode(trackingCode: string) {
    const code = trackingCode.trim();
    if (!code) {
      throw new BadRequestException('کد رهگیری الزامی است');
    }

    const application = await this.prisma.honoraryVolunteerApplication.findUnique({
      where: { trackingCode: code },
      include: applicationInclude,
    });

    if (!application) {
      throw new NotFoundException('درخواستی با این کد رهگیری یافت نشد');
    }

    return application;
  }

  findByMobileForGuest(mobileNumber: string) {
    const mobile = mobileNumber.trim();
    if (!mobile) {
      throw new BadRequestException('شماره موبایل الزامی است');
    }

    return this.prisma.honoraryVolunteerApplication.findMany({
      where: { mobileNumber: mobile },
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async findOne(id: number) {
    const application = await this.prisma.honoraryVolunteerApplication.findUnique({
      where: { id },
      include: applicationInclude,
    });

    if (!application) {
      throw new NotFoundException('درخواست یافت نشد');
    }

    return application;
  }

  private async assertCanManageOwn(applicationId: number, user: AuthUser) {
    const application = await this.findOne(applicationId);
    const isOwner =
      application.submittedByUserId === user.id ||
      application.mobileNumber === user.mobileNumber;

    if (!isOwner) {
      throw new ForbiddenException('شما مجاز به مدیریت این درخواست نیستید');
    }

    return application;
  }

  async updateOwn(
    id: number,
    dto: UpdateHonoraryVolunteerApplicationDto,
    user: AuthUser,
  ) {
    const application = await this.assertCanManageOwn(id, user);

    if (application.status !== HonoraryVolunteerApplicationStatus.Pending) {
      throw new BadRequestException('فقط درخواست‌های در انتظار قابل ویرایش هستند');
    }

    const start = dto.availabilityStartDate ?? application.availabilityStartDate.toISOString();
    const end = dto.availabilityEndDate ?? application.availabilityEndDate.toISOString();
    const { startDate, endDate } = this.validateDateRange(start, end);

    if (dto.mawkibId !== undefined && dto.mawkibId !== null) {
      await this.assertMawkibExists(dto.mawkibId);
    }

    return this.prisma.honoraryVolunteerApplication.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        mobileNumber: dto.mobileNumber?.trim(),
        province: dto.province !== undefined ? dto.province.trim() || null : undefined,
        city: dto.city !== undefined ? dto.city.trim() || null : undefined,
        mawkibId: dto.mawkibId === undefined ? undefined : dto.mawkibId,
        description: dto.description !== undefined ? dto.description.trim() || null : undefined,
        serviceTypes: dto.serviceTypes,
        serviceDescription:
          dto.serviceDescription !== undefined
            ? dto.serviceDescription.trim() || null
            : undefined,
        availabilityStartDate: new Date(startDate),
        availabilityEndDate: new Date(endDate),
        availabilityDescription:
          dto.availabilityDescription !== undefined
            ? dto.availabilityDescription.trim() || null
            : undefined,
      },
      include: applicationInclude,
    });
  }

  async cancelOwn(id: number, user: AuthUser) {
    const application = await this.assertCanManageOwn(id, user);

    if (application.status !== HonoraryVolunteerApplicationStatus.Pending) {
      throw new BadRequestException('فقط درخواست‌های در انتظار قابل لغو هستند');
    }

    return this.prisma.honoraryVolunteerApplication.update({
      where: { id },
      data: { status: HonoraryVolunteerApplicationStatus.Cancelled },
      include: applicationInclude,
    });
  }

  async review(
    id: number,
    dto: ReviewHonoraryVolunteerApplicationDto,
    reviewerUserId: number,
  ) {
    const application = await this.findOne(id);

    if (application.status !== HonoraryVolunteerApplicationStatus.Pending) {
      throw new BadRequestException('این درخواست قبلاً بررسی شده است');
    }

    if (
      dto.status !== HonoraryVolunteerApplicationStatus.Approved &&
      dto.status !== HonoraryVolunteerApplicationStatus.Rejected
    ) {
      throw new BadRequestException('وضعیت بررسی نامعتبر است');
    }

    return this.prisma.honoraryVolunteerApplication.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerUserId,
      },
      include: applicationInclude,
    });
  }
}
