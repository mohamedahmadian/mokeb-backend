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
exports.MawkibFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const userSelect = {
    id: true,
    fullName: true,
    mobileNumber: true,
};
const feedbackInclude = {
    author: { select: userSelect },
    repliedBy: { select: userSelect },
    mawkib: {
        select: {
            id: true,
            name: true,
            mawkibCity: true,
            phoneNumber: true,
            owner: { select: userSelect },
        },
    },
};
let MawkibFeedbackService = class MawkibFeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(filters, extra) {
        const where = { ...extra };
        if (filters.mawkibId) {
            where.mawkibId = filters.mawkibId;
        }
        if (filters.authorUserId) {
            where.authorUserId = filters.authorUserId;
        }
        if (filters.replyStatus === 'replied') {
            where.ownerReply = { not: null };
        }
        else if (filters.replyStatus === 'pending') {
            where.ownerReply = null;
        }
        if (filters.createdFrom || filters.createdTo) {
            where.createdAt = {};
            if (filters.createdFrom) {
                where.createdAt.gte = new Date(`${filters.createdFrom.slice(0, 10)}T00:00:00.000Z`);
            }
            if (filters.createdTo) {
                where.createdAt.lte = new Date(`${filters.createdTo.slice(0, 10)}T23:59:59.999Z`);
            }
        }
        if (filters.search?.trim()) {
            const search = filters.search.trim();
            where.OR = [
                { content: { contains: search, mode: 'insensitive' } },
                { ownerReply: { contains: search, mode: 'insensitive' } },
            ];
        }
        return where;
    }
    async assertCanView(feedbackId, user) {
        const feedback = await this.prisma.mawkibFeedback.findUnique({
            where: { id: feedbackId },
            include: {
                mawkib: { select: { ownerUserId: true } },
            },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('انتقاد یا پیشنهاد یافت نشد');
        }
        const isAuthor = feedback.authorUserId === user.id;
        const isOwner = feedback.mawkib.ownerUserId === user.id;
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        if (!isAuthor && !isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('دسترسی به این مورد مجاز نیست');
        }
        return feedback;
    }
    assertCanModifyOwn(feedback, user) {
        const isAuthor = feedback.authorUserId === user.id;
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        if (!isAuthor && !isAdmin) {
            throw new common_1.ForbiddenException('فقط ثبت‌کننده می‌تواند این مورد را ویرایش یا حذف کند');
        }
        if (feedback.ownerReply) {
            throw new common_1.BadRequestException('پس از دریافت پاسخ موکب، امکان ویرایش یا حذف وجود ندارد');
        }
    }
    async create(dto, user) {
        if (!user.roles.includes(client_1.RoleName.Pilgrim)) {
            throw new common_1.ForbiddenException('فقط زائرین می‌توانند انتقاد یا پیشنهاد ثبت کنند');
        }
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: dto.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب انتخاب‌شده یافت نشد یا فعال نیست');
        }
        return this.prisma.mawkibFeedback.create({
            data: {
                mawkibId: dto.mawkibId,
                authorUserId: user.id,
                content: dto.content.trim(),
            },
            include: feedbackInclude,
        });
    }
    async findMine(filters, user) {
        return this.prisma.mawkibFeedback.findMany({
            where: this.buildWhere(filters, { authorUserId: user.id }),
            include: feedbackInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllAdmin(filters) {
        return this.prisma.mawkibFeedback.findMany({
            where: this.buildWhere(filters),
            include: feedbackInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findForOwner(filters, user) {
        if (!user.roles.includes(client_1.RoleName.MawkibOwner)) {
            throw new common_1.ForbiddenException('فقط موکب‌داران به این بخش دسترسی دارند');
        }
        return this.prisma.mawkibFeedback.findMany({
            where: this.buildWhere(filters, {
                mawkib: { ownerUserId: user.id },
            }),
            include: feedbackInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        await this.assertCanView(id, user);
        return this.prisma.mawkibFeedback.findUniqueOrThrow({
            where: { id },
            include: feedbackInclude,
        });
    }
    async reply(id, dto, user) {
        const feedback = await this.prisma.mawkibFeedback.findUnique({
            where: { id },
            include: { mawkib: { select: { ownerUserId: true } } },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('انتقاد یا پیشنهاد یافت نشد');
        }
        const isOwner = feedback.mawkib.ownerUserId === user.id;
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        if (!isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('فقط مسئول موکب می‌تواند پاسخ ثبت کند');
        }
        return this.prisma.mawkibFeedback.update({
            where: { id },
            data: {
                ownerReply: dto.ownerReply.trim(),
                repliedAt: new Date(),
                repliedByUserId: user.id,
            },
            include: feedbackInclude,
        });
    }
    async updateOwn(id, dto, user) {
        if (dto.mawkibId === undefined && dto.content === undefined) {
            throw new common_1.BadRequestException('حداقل یک فیلد برای ویرایش لازم است');
        }
        const feedback = await this.prisma.mawkibFeedback.findUnique({
            where: { id },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('انتقاد یا پیشنهاد یافت نشد');
        }
        this.assertCanModifyOwn(feedback, user);
        if (dto.mawkibId !== undefined) {
            const mawkib = await this.prisma.mawkib.findUnique({
                where: { id: dto.mawkibId },
            });
            if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
                throw new common_1.BadRequestException('موکب انتخاب‌شده یافت نشد یا فعال نیست');
            }
        }
        return this.prisma.mawkibFeedback.update({
            where: { id },
            data: {
                ...(dto.mawkibId !== undefined && { mawkibId: dto.mawkibId }),
                ...(dto.content !== undefined && { content: dto.content.trim() }),
            },
            include: feedbackInclude,
        });
    }
    async deleteOwn(id, user) {
        const feedback = await this.prisma.mawkibFeedback.findUnique({
            where: { id },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('انتقاد یا پیشنهاد یافت نشد');
        }
        this.assertCanModifyOwn(feedback, user);
        await this.prisma.mawkibFeedback.delete({ where: { id } });
        return { id, message: 'انتقاد یا پیشنهاد حذف شد' };
    }
};
exports.MawkibFeedbackService = MawkibFeedbackService;
exports.MawkibFeedbackService = MawkibFeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MawkibFeedbackService);
//# sourceMappingURL=mawkib-feedback.service.js.map