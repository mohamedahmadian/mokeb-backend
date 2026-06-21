import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MawkibStatus, ReservationStatus, RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import {
  CreateReservationDto,
  UpdateReservationStatusDto,
} from './dto/reservation.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private mawkibsService: MawkibsService,
  ) {}

  async findAllAdmin() {
    return this.prisma.reservation.findMany({
      include: {
        mawkib: { select: { id: true, name: true } },
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
        reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPilgrim(pilgrimUserId: number) {
    return this.prisma.reservation.findMany({
      where: { pilgrimUserId },
      include: {
        mawkib: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMawkibOwner(ownerUserId: number) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: { ownerUserId },
      select: { id: true },
    });

    const mawkibIds = mawkibs.map((m) => m.id);

    return this.prisma.reservation.findMany({
      where: { mawkibId: { in: mawkibIds } },
      include: {
        mawkib: { select: { id: true, name: true } },
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
        reservedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        mawkib: true,
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
        reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
      },
    });

    if (!reservation) {
      throw new NotFoundException('رزرو یافت نشد');
    }

    return reservation;
  }

  async create(dto: CreateReservationDto, currentUser: AuthUser) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: dto.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب یافت نشد یا تایید نشده است');
    }

    const reservationDate = new Date(dto.reservationDate);
    await this.mawkibsService.assertCapacity(
      dto.mawkibId,
      dto.guestCount,
      reservationDate,
    );

    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const pilgrimUserId = isAdmin && dto.pilgrimUserId
      ? dto.pilgrimUserId
      : currentUser.id;

    if (isAdmin && dto.pilgrimUserId) {
      const pilgrim = await this.prisma.user.findUnique({
        where: { id: dto.pilgrimUserId },
      });
      if (!pilgrim) {
        throw new NotFoundException('زائر یافت نشد');
      }
    }

    return this.prisma.reservation.create({
      data: {
        mawkibId: dto.mawkibId,
        pilgrimUserId,
        reservedByUserId: currentUser.id,
        reservationDate,
        guestCount: dto.guestCount,
        pilgrimMobile: dto.pilgrimMobile,
        description: dto.description,
        status: isAdmin ? ReservationStatus.Confirmed : ReservationStatus.Pending,
      },
      include: {
        mawkib: { select: { id: true, name: true } },
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
      },
    });
  }

  async updateStatus(id: number, dto: UpdateReservationStatusDto, currentUser: AuthUser) {
    const reservation = await this.findOne(id);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('شما مجوز تغییر وضعیت رزرو را ندارید');
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }

    if (
      dto.status === ReservationStatus.Confirmed &&
      reservation.status !== ReservationStatus.Pending
    ) {
      throw new BadRequestException('فقط رزروهای در انتظار قابل تایید هستند');
    }

    if (dto.status === ReservationStatus.Confirmed) {
      await this.mawkibsService.assertCapacity(
        reservation.mawkibId,
        reservation.guestCount,
        reservation.reservationDate,
      );
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: {
        mawkib: { select: { id: true, name: true } },
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
      },
    });
  }
}
