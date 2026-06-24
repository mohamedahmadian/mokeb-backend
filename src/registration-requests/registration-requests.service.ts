import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MawkibStatus,
  RegistrationRequestStatus,
  RoleName,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationRequestDto } from './dto/registration-request.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class RegistrationRequestsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.mawkibRegistrationRequest.findMany({
      include: {
        owner: { select: { id: true, fullName: true, mobileNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByOwner(ownerUserId: number) {
    return this.prisma.mawkibRegistrationRequest.findMany({
      where: { ownerUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.mawkibRegistrationRequest.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, mobileNumber: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('درخواست یافت نشد');
    }

    return request;
  }

  async create(dto: CreateRegistrationRequestDto, currentUser: AuthUser) {
    return this.prisma.mawkibRegistrationRequest.create({
      data: {
        ...dto,
        ownerUserId: currentUser.id,
      },
    });
  }

  async review(id: number, status: 'Approved' | 'Rejected') {
    const request = await this.findOne(id);

    if (request.status !== RegistrationRequestStatus.Pending) {
      throw new BadRequestException('این درخواست قبلاً بررسی شده است');
    }

    if (status === 'Rejected') {
      return this.prisma.mawkibRegistrationRequest.update({
        where: { id },
        data: { status: RegistrationRequestStatus.Rejected },
      });
    }

    const mawkibOwnerRole = await this.prisma.role.findUnique({
      where: { name: RoleName.MawkibOwner },
    });

    if (!mawkibOwnerRole) {
      throw new BadRequestException('نقش موکب‌دار یافت نشد');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: request.ownerUserId,
            roleId: mawkibOwnerRole.id,
          },
        },
        create: {
          userId: request.ownerUserId,
          roleId: mawkibOwnerRole.id,
        },
        update: {},
      });

      const mawkib = await tx.mawkib.create({
        data: {
          name: request.mawkibName,
          address: request.address,
          latitude: request.latitude,
          longitude: request.longitude,
          phoneNumber: request.phoneNumber,
          description: request.description,
          maleCapacity: request.capacity,
          femaleCapacity: 0,
          ownerUserId: request.ownerUserId,
          status: MawkibStatus.Approved,
        },
      });

      await tx.mawkibRegistrationRequest.update({
        where: { id },
        data: { status: RegistrationRequestStatus.Approved },
      });

      return { request, mawkib };
    });
  }
}
