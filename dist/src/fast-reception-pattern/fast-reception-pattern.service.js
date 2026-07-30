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
exports.FastReceptionPatternService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const servant_mawkib_access_service_1 = require("../users/servant-mawkib-access.service");
const DEFAULT_PATTERN = {
    acceptanceType: client_1.MawkibAcceptanceType.Group,
    stayDurationMode: client_1.MawkibStayDurationMode.Free,
    fixedStayDays: null,
    reservationStartMode: client_1.MawkibReservationStartMode.UserSelect,
    individualGuestGender: null,
    defaultMawkibId: null,
    defaultMawkibName: null,
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
let FastReceptionPatternService = class FastReceptionPatternService {
    prisma;
    servantMawkibAccess;
    constructor(prisma, servantMawkibAccess) {
        this.prisma = prisma;
        this.servantMawkibAccess = servantMawkibAccess;
    }
    assertCanManagePattern(user) {
        const allowed = user.roles.includes(client_1.RoleName.Admin) ||
            user.roles.includes(client_1.RoleName.MawkibOwner) ||
            user.roles.includes(client_1.RoleName.MawkibServant);
        if (!allowed) {
            throw new common_1.ForbiddenException('دسترسی به الگوی پذیرش سریع مجاز نیست');
        }
    }
    async assertMawkibAccess(user, mawkibId) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { id: true, ownerUserId: true, status: true },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب انتخاب‌شده معتبر نیست');
        }
        if (user.roles.includes(client_1.RoleName.Admin)) {
            return;
        }
        if (user.roles.includes(client_1.RoleName.MawkibOwner)) {
            if (mawkib.ownerUserId !== user.id) {
                throw new common_1.BadRequestException('دسترسی به این موکب مجاز نیست');
            }
            return;
        }
        if (user.roles.includes(client_1.RoleName.MawkibServant)) {
            const hasAccess = await this.servantMawkibAccess.hasAccess(user.id, mawkibId);
            if (!hasAccess) {
                throw new common_1.BadRequestException('دسترسی به این موکب مجاز نیست');
            }
            return;
        }
        throw new common_1.ForbiddenException('دسترسی به الگوی پذیرش سریع مجاز نیست');
    }
    async normalizeDto(user, dto) {
        const defaultMawkibId = dto.defaultMawkibId ?? null;
        if (defaultMawkibId != null) {
            await this.assertMawkibAccess(user, defaultMawkibId);
        }
        const base = {
            ...dto,
            defaultMawkibId,
            individualGuestGender: dto.acceptanceType === client_1.MawkibAcceptanceType.Individual
                ? (dto.individualGuestGender ?? null)
                : null,
        };
        if (dto.stayDurationMode === client_1.MawkibStayDurationMode.Fixed) {
            const days = dto.fixedStayDays;
            if (days == null || !Number.isInteger(days) || days < 1) {
                throw new common_1.BadRequestException('برای مدت اقامت ثابت، تعداد روزهای رزرو پیش‌فرض الزامی است');
            }
            return { ...base, fixedStayDays: days };
        }
        return { ...base, fixedStayDays: null };
    }
    toResponse(row) {
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
    patternInclude = {
        defaultMawkib: { select: { name: true } },
    };
    async getMine(user) {
        this.assertCanManagePattern(user);
        const row = await this.prisma.userFastReceptionPattern.findUnique({
            where: { userId: user.id },
            include: this.patternInclude,
        });
        return this.toResponse(row);
    }
    async upsertMine(user, dto) {
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
};
exports.FastReceptionPatternService = FastReceptionPatternService;
exports.FastReceptionPatternService = FastReceptionPatternService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        servant_mawkib_access_service_1.ServantMawkibAccessService])
], FastReceptionPatternService);
//# sourceMappingURL=fast-reception-pattern.service.js.map