"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HonoraryVolunteersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
const honorary_volunteer_code_util_1 = require("../common/utils/honorary-volunteer-code.util");
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
};
let HonoraryVolunteersService = class HonoraryVolunteersService {
    prisma;
    authService;
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    validateDateRange(start, end) {
        const startDate = start.slice(0, 10);
        const endDate = end.slice(0, 10);
        if (endDate < startDate) {
            throw new common_1.BadRequestException('تاریخ پایان همکاری نمی‌تواند قبل از تاریخ شروع باشد');
        }
        return { startDate, endDate };
    }
    async assertMawkibExists(mawkibId) {
        if (!mawkibId)
            return;
        const mawkib = await this.prisma.mawkib.findUnique({ where: { id: mawkibId } });
        if (!mawkib) {
            throw new common_1.BadRequestException('موکب انتخاب‌شده یافت نشد');
        }
    }
    async assertOwnerMawkib(mawkibId, ownerUserId) {
        if (!mawkibId)
            return;
        const mawkib = await this.prisma.mawkib.findFirst({
            where: { id: mawkibId, ownerUserId },
        });
        if (!mawkib) {
            throw new common_1.ForbiddenException('شما مجاز به ثبت نیاز برای این موکب نیستید');
        }
    }
    buildWhere(filters, extra) {
        const where = { ...extra };
        if (filters.status)
            where.status = filters.status;
        if (filters.applicantType)
            where.applicantType = filters.applicantType;
        if (filters.mawkibId)
            where.mawkibId = filters.mawkibId;
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
                ...where.availabilityEndDate,
                gte: new Date(filters.availabilityFrom.slice(0, 10)),
            };
        }
        if (filters.availabilityTo) {
            where.availabilityStartDate = {
                ...where.availabilityStartDate,
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
    mapApplicationData(dto, applicantType, submittedByUserId) {
        const { startDate, endDate } = this.validateDateRange(dto.availabilityStartDate, dto.availabilityEndDate);
        return {
            trackingCode: (0, honorary_volunteer_code_util_1.generateHonoraryVolunteerTrackingCode)(),
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
    async createVolunteer(dto) {
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
            data: this.mapApplicationData(dto, client_1.HonoraryVolunteerApplicantType.Volunteer, auth.user.id),
            include: applicationInclude,
        });
        return {
            ...application,
            accessToken: auth.accessToken,
            user: auth.user,
        };
    }
    async createVolunteerForAuthenticatedUser(dto, user) {
        await this.assertMawkibExists(dto.mawkibId);
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!dbUser || !dbUser.isActive) {
            throw new common_1.NotFoundException('کاربر یافت نشد');
        }
        await this.authService.assignHonoraryServantRole(dbUser.id);
        const nameParts = dbUser.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] ?? '';
        const lastName = nameParts.slice(1).join(' ') || firstName;
        const application = await this.prisma.honoraryVolunteerApplication.create({
            data: this.mapApplicationData({
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
            }, client_1.HonoraryVolunteerApplicantType.Volunteer, dbUser.id),
            include: applicationInclude,
        });
        return application;
    }
    async createMawkibNeed(dto, ownerUserId) {
        await this.assertOwnerMawkib(dto.mawkibId, ownerUserId);
        const now = new Date();
        const application = await this.prisma.honoraryVolunteerApplication.create({
            data: {
                ...this.mapApplicationData(dto, client_1.HonoraryVolunteerApplicantType.MawkibOwner, ownerUserId),
                status: client_1.HonoraryVolunteerApplicationStatus.Approved,
                reviewedAt: now,
                reviewedByUserId: ownerUserId,
            },
            include: applicationInclude,
        });
        return application;
    }
    findPublicNeeds(filters) {
        const { status: _status, applicantType: _applicantType, ...publicFilters } = filters;
        return this.prisma.honoraryVolunteerApplication.findMany({
            where: this.buildWhere(publicFilters, {
                applicantType: client_1.HonoraryVolunteerApplicantType.MawkibOwner,
                status: client_1.HonoraryVolunteerApplicationStatus.Approved,
            }),
            include: applicationInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    findAll(filters) {
        return this.prisma.honoraryVolunteerApplication.findMany({
            where: this.buildWhere(filters),
            include: applicationInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    findByUser(user) {
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
    async findByTrackingCode(trackingCode) {
        const code = trackingCode.trim();
        if (!code) {
            throw new common_1.BadRequestException('کد رهگیری الزامی است');
        }
        const application = await this.prisma.honoraryVolunteerApplication.findUnique({
            where: { trackingCode: code },
            include: applicationInclude,
        });
        if (!application) {
            throw new common_1.NotFoundException('درخواستی با این کد رهگیری یافت نشد');
        }
        return application;
    }
    findByMobileForGuest(mobileNumber) {
        const mobile = mobileNumber.trim();
        if (!mobile) {
            throw new common_1.BadRequestException('شماره موبایل الزامی است');
        }
        return this.prisma.honoraryVolunteerApplication.findMany({
            where: { mobileNumber: mobile },
            include: applicationInclude,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
    async findOne(id) {
        const application = await this.prisma.honoraryVolunteerApplication.findUnique({
            where: { id },
            include: applicationInclude,
        });
        if (!application) {
            throw new common_1.NotFoundException('درخواست یافت نشد');
        }
        return application;
    }
    async assertCanManageOwn(applicationId, user) {
        const application = await this.findOne(applicationId);
        const isOwner = application.submittedByUserId === user.id ||
            application.mobileNumber === user.mobileNumber;
        if (!isOwner) {
            throw new common_1.ForbiddenException('شما مجاز به مدیریت این درخواست نیستید');
        }
        return application;
    }
    async updateOwn(id, dto, user) {
        const application = await this.assertCanManageOwn(id, user);
        if (application.status !== client_1.HonoraryVolunteerApplicationStatus.Pending) {
            throw new common_1.BadRequestException('فقط درخواست‌های در انتظار قابل ویرایش هستند');
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
                serviceDescription: dto.serviceDescription !== undefined
                    ? dto.serviceDescription.trim() || null
                    : undefined,
                availabilityStartDate: new Date(startDate),
                availabilityEndDate: new Date(endDate),
                availabilityDescription: dto.availabilityDescription !== undefined
                    ? dto.availabilityDescription.trim() || null
                    : undefined,
            },
            include: applicationInclude,
        });
    }
    async cancelOwn(id, user) {
        const application = await this.assertCanManageOwn(id, user);
        if (application.status !== client_1.HonoraryVolunteerApplicationStatus.Pending) {
            throw new common_1.BadRequestException('فقط درخواست‌های در انتظار قابل لغو هستند');
        }
        return this.prisma.honoraryVolunteerApplication.update({
            where: { id },
            data: { status: client_1.HonoraryVolunteerApplicationStatus.Cancelled },
            include: applicationInclude,
        });
    }
    async review(id, dto, reviewerUserId) {
        const application = await this.findOne(id);
        if (application.status !== client_1.HonoraryVolunteerApplicationStatus.Pending) {
            throw new common_1.BadRequestException('این درخواست قبلاً بررسی شده است');
        }
        if (dto.status !== client_1.HonoraryVolunteerApplicationStatus.Approved &&
            dto.status !== client_1.HonoraryVolunteerApplicationStatus.Rejected) {
            throw new common_1.BadRequestException('وضعیت بررسی نامعتبر است');
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
};
exports.HonoraryVolunteersService = HonoraryVolunteersService;
exports.HonoraryVolunteersService = HonoraryVolunteersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], HonoraryVolunteersService);
//# sourceMappingURL=honorary-volunteers.service.js.map