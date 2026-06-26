import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MawkibStatus, Prisma, RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateMawkibFeedbackDto } from './dto/create-mawkib-feedback.dto';
import { MawkibFeedbackFiltersDto } from './dto/mawkib-feedback-filters.dto';
import { ReplyMawkibFeedbackDto } from './dto/reply-mawkib-feedback.dto';
import { UpdateMawkibFeedbackDto } from './dto/update-mawkib-feedback.dto';

const userSelect = {
  id: true,
  fullName: true,
  mobileNumber: true,
} as const;

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
} satisfies Prisma.MawkibFeedbackInclude;

@Injectable()
export class MawkibFeedbackService {
  constructor(private prisma: PrismaService) {}

  private buildWhere(
    filters: MawkibFeedbackFiltersDto,
    extra?: Prisma.MawkibFeedbackWhereInput,
  ): Prisma.MawkibFeedbackWhereInput {
    const where: Prisma.MawkibFeedbackWhereInput = { ...extra };

    if (filters.mawkibId) {
      where.mawkibId = filters.mawkibId;
    }

    if (filters.replyStatus === 'replied') {
      where.ownerReply = { not: null };
    } else if (filters.replyStatus === 'pending') {
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
        { mawkib: { name: { contains: search, mode: 'insensitive' } } },
        { author: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private async assertCanView(feedbackId: number, user: AuthUser) {
    const feedback = await this.prisma.mawkibFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        mawkib: { select: { ownerUserId: true } },
      },
    });

    if (!feedback) {
      throw new NotFoundException('انتقاد یا پیشنهاد یافت نشد');
    }

    const isAuthor = feedback.authorUserId === user.id;
    const isOwner = feedback.mawkib.ownerUserId === user.id;
    const isAdmin = user.roles.includes(RoleName.Admin);

    if (!isAuthor && !isOwner && !isAdmin) {
      throw new ForbiddenException('دسترسی به این مورد مجاز نیست');
    }

    return feedback;
  }

  private assertCanModifyOwn(
    feedback: { authorUserId: number; ownerReply: string | null },
    user: AuthUser,
  ) {
    const isAuthor = feedback.authorUserId === user.id;
    const isAdmin = user.roles.includes(RoleName.Admin);

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('فقط ثبت‌کننده می‌تواند این مورد را ویرایش یا حذف کند');
    }

    if (feedback.ownerReply) {
      throw new BadRequestException(
        'پس از دریافت پاسخ موکب، امکان ویرایش یا حذف وجود ندارد',
      );
    }
  }

  async create(dto: CreateMawkibFeedbackDto, user: AuthUser) {
    if (!user.roles.includes(RoleName.Pilgrim)) {
      throw new ForbiddenException('فقط زائرین می‌توانند انتقاد یا پیشنهاد ثبت کنند');
    }

    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: dto.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب انتخاب‌شده یافت نشد یا فعال نیست');
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

  async findMine(filters: MawkibFeedbackFiltersDto, user: AuthUser) {
    return this.prisma.mawkibFeedback.findMany({
      where: this.buildWhere(filters, { authorUserId: user.id }),
      include: feedbackInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(filters: MawkibFeedbackFiltersDto) {
    return this.prisma.mawkibFeedback.findMany({
      where: this.buildWhere(filters),
      include: feedbackInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForOwner(filters: MawkibFeedbackFiltersDto, user: AuthUser) {
    if (!user.roles.includes(RoleName.MawkibOwner)) {
      throw new ForbiddenException('فقط موکب‌داران به این بخش دسترسی دارند');
    }

    return this.prisma.mawkibFeedback.findMany({
      where: this.buildWhere(filters, {
        mawkib: { ownerUserId: user.id },
      }),
      include: feedbackInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, user: AuthUser) {
    await this.assertCanView(id, user);

    return this.prisma.mawkibFeedback.findUniqueOrThrow({
      where: { id },
      include: feedbackInclude,
    });
  }

  async reply(id: number, dto: ReplyMawkibFeedbackDto, user: AuthUser) {
    const feedback = await this.prisma.mawkibFeedback.findUnique({
      where: { id },
      include: { mawkib: { select: { ownerUserId: true } } },
    });

    if (!feedback) {
      throw new NotFoundException('انتقاد یا پیشنهاد یافت نشد');
    }

    const isOwner = feedback.mawkib.ownerUserId === user.id;
    const isAdmin = user.roles.includes(RoleName.Admin);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('فقط مسئول موکب می‌تواند پاسخ ثبت کند');
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

  async updateOwn(id: number, dto: UpdateMawkibFeedbackDto, user: AuthUser) {
    if (dto.mawkibId === undefined && dto.content === undefined) {
      throw new BadRequestException('حداقل یک فیلد برای ویرایش لازم است');
    }

    const feedback = await this.prisma.mawkibFeedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('انتقاد یا پیشنهاد یافت نشد');
    }

    this.assertCanModifyOwn(feedback, user);

    if (dto.mawkibId !== undefined) {
      const mawkib = await this.prisma.mawkib.findUnique({
        where: { id: dto.mawkibId },
      });
      if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
        throw new BadRequestException('موکب انتخاب‌شده یافت نشد یا فعال نیست');
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

  async deleteOwn(id: number, user: AuthUser) {
    const feedback = await this.prisma.mawkibFeedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('انتقاد یا پیشنهاد یافت نشد');
    }

    this.assertCanModifyOwn(feedback, user);

    await this.prisma.mawkibFeedback.delete({ where: { id } });

    return { id, message: 'انتقاد یا پیشنهاد حذف شد' };
  }
}
