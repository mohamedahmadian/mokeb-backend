import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MawkibStatus, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMawkibDto,
  SearchMawkibDto,
  UpdateMawkibDto,
} from './dto/mawkib.dto';

@Injectable()
export class MawkibsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: SearchMawkibDto) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: {
        status: MawkibStatus.Approved,
        ...(search?.name && {
          name: { contains: search.name, mode: 'insensitive' },
        }),
      },
      include: {
        owner: {
          select: { id: true, fullName: true, province: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!search?.reservationDate && !search?.hasAvailability && !search?.minAvailableCapacity) {
      return mawkibs;
    }

    const enriched = await Promise.all(
      mawkibs.map(async (mawkib) => {
        const availableCapacity = await this.getAvailableCapacity(
          mawkib.id,
          search?.reservationDate,
        );
        return { ...mawkib, availableCapacity };
      }),
    );

    return enriched.filter((m) => {
      if (search?.province && m.owner.province !== search.province) return false;
      if (search?.city && m.owner.city !== search.city) return false;
      if (search?.minAvailableCapacity && m.availableCapacity < search.minAvailableCapacity) {
        return false;
      }
      if (search?.hasAvailability && m.availableCapacity <= 0) return false;
      return true;
    });
  }

  async findAllAdmin() {
    return this.prisma.mawkib.findMany({
      include: {
        owner: { select: { id: true, fullName: true, mobileNumber: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOwner(ownerUserId: number) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: { ownerUserId },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    return Promise.all(
      mawkibs.map(async (mawkib) => ({
        ...mawkib,
        availableCapacity: await this.getAvailableCapacity(mawkib.id),
      })),
    );
  }

  async findOne(id: number) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, mobileNumber: true } },
      },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const availableCapacity = await this.getAvailableCapacity(mawkib.id);

    return { ...mawkib, availableCapacity };
  }

  create(dto: CreateMawkibDto) {
    return this.prisma.mawkib.create({
      data: {
        ...dto,
        status: MawkibStatus.Approved,
      },
      include: {
        owner: { select: { id: true, fullName: true } },
      },
    });
  }

  async update(id: number, dto: UpdateMawkibDto) {
    await this.findOne(id);
    return this.prisma.mawkib.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(id: number, status: MawkibStatus) {
    await this.findOne(id);
    return this.prisma.mawkib.update({
      where: { id },
      data: { status },
    });
  }

  async getAvailableCapacity(mawkibId: number, reservationDate?: Date) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const where = {
      mawkibId,
      status: { in: [ReservationStatus.Pending, ReservationStatus.Confirmed] },
      ...(reservationDate && { reservationDate }),
    };

    const result = await this.prisma.reservation.aggregate({
      where,
      _sum: { guestCount: true },
    });

    const totalReserved = result._sum.guestCount ?? 0;
    return mawkib.capacity - totalReserved;
  }

  async assertOwnerAccess(mawkibId: number, userId: number) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (mawkib.ownerUserId !== userId) {
      throw new ForbiddenException('شما مالک این موکب نیستید');
    }

    return mawkib;
  }

  async assertCapacity(mawkibId: number, guestCount: number, reservationDate: Date) {
    const available = await this.getAvailableCapacity(mawkibId, reservationDate);

    if (guestCount > available) {
      throw new BadRequestException(
        `ظرفیت کافی نیست. ظرفیت باقی‌مانده: ${available} نفر`,
      );
    }
  }
}
