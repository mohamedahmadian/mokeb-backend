import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AssignRoleDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';

const userInclude = {
  roles: { include: { role: true } },
} satisfies Prisma.UserInclude;

type UserWithRoles = Prisma.UserGetPayload<{ include: typeof userInclude }>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private sanitize(user: UserWithRoles) {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.sanitize(user));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ...userInclude,
        ownedMawkibs: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return this.sanitize(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
    });

    if (existing) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    const roles = await this.prisma.role.findMany({
      where: { name: { in: dto.roles } },
    });

    if (roles.length !== dto.roles.length) {
      throw new BadRequestException('یک یا چند نقش نامعتبر است');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        mobileNumber: dto.mobileNumber,
        passwordHash,
        province: dto.province,
        city: dto.city,
        description: dto.description,
        roles: {
          create: roles.map((role) => ({ roleId: role.id })),
        },
      },
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    const { password, roles, ...fields } = dto;
    const data: Prisma.UserUpdateInput = { ...fields };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    if (roles) {
      const roleRecords = await this.prisma.role.findMany({
        where: { name: { in: roles } },
      });

      if (roleRecords.length !== roles.length) {
        throw new BadRequestException('یک یا چند نقش نامعتبر است');
      }

      data.roles = {
        deleteMany: {},
        create: roleRecords.map((role) => ({ roleId: role.id })),
      };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    const [mawkibCount, reservationCount] = await Promise.all([
      this.prisma.mawkib.count({ where: { ownerUserId: id } }),
      this.prisma.reservation.count({
        where: {
          OR: [{ pilgrimUserId: id }, { reservedByUserId: id }],
        },
      }),
    ]);

    if (mawkibCount > 0 || reservationCount > 0) {
      const updated = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
        include: userInclude,
      });
      return {
        ...this.sanitize(updated),
        message: 'کاربر به‌دلیل داشتن سوابق، غیرفعال شد',
        softDeleted: true,
      };
    }

    await this.prisma.user.delete({ where: { id } });
    return { id: user.id, message: 'کاربر حذف شد', softDeleted: false };
  }

  async assignRole(id: number, dto: AssignRoleDto) {
    await this.findOne(id);

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });

    if (!role) {
      throw new NotFoundException('نقش یافت نشد');
    }

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: id, roleId: role.id },
      },
      create: { userId: id, roleId: role.id },
      update: {},
    });

    return this.findOne(id);
  }

  async removeRole(id: number, roleName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName as never },
    });

    if (!role) {
      throw new NotFoundException('نقش یافت نشد');
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: id, roleId: role.id },
    });

    return this.findOne(id);
  }
}
