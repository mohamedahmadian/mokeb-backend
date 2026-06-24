import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AssignRoleDto, CreateQuickPilgrimDto, CreateUserDto, ListPilgrimsDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';

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

  async findAll(filters: ListUsersDto = {}) {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.roles = { some: { role: { name: filters.role } } };
    }
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { mobileNumber: { contains: term, mode: 'insensitive' } },
      ];
    } else {
      if (filters.fullName?.trim()) {
        where.fullName = { contains: filters.fullName.trim(), mode: 'insensitive' };
      }
      if (filters.mobileNumber?.trim()) {
        where.mobileNumber = { contains: filters.mobileNumber.trim(), mode: 'insensitive' };
      }
    }
    if (filters.province?.trim()) {
      where.province = { contains: filters.province.trim(), mode: 'insensitive' };
    }
    if (filters.city?.trim()) {
      where.city = { contains: filters.city.trim(), mode: 'insensitive' };
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const include =
      filters.role === RoleName.MawkibOwner
        ? {
            ...userInclude,
            ownedMawkibs: {
              select: { id: true, name: true, status: true },
              orderBy: { name: 'asc' as const },
            },
          }
        : userInclude;

    const users = await this.prisma.user.findMany({
      where,
      include,
      orderBy: filters.search?.trim() ? { fullName: 'asc' } : { createdAt: 'desc' },
      ...(filters.search?.trim() ? { take: 50 } : {}),
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
        whatsapp: dto.whatsapp,
        telegram: dto.telegram,
        bale: dto.bale,
        eitaa: dto.eitaa,
        email: dto.email,
        roles: {
          create: roles.map((role) => ({ roleId: role.id })),
        },
      },
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async findOneForUser(id: number, user: AuthUser) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    if (!isAdmin && user.id !== id) {
      throw new ForbiddenException('شما مجوز مشاهده این کاربر را ندارید');
    }
    return this.findOne(id);
  }

  async updateForUser(id: number, dto: UpdateUserDto, user: AuthUser) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    if (!isAdmin && user.id !== id) {
      throw new ForbiddenException('شما مجوز ویرایش این کاربر را ندارید');
    }

    if (!isAdmin) {
      const { roles, isActive, ...selfFields } = dto;
      if (roles !== undefined || isActive !== undefined) {
        throw new ForbiddenException('شما مجوز تغییر نقش یا وضعیت را ندارید');
      }
      return this.update(id, selfFields);
    }

    return this.update(id, dto);
  }

  private buildPilgrimWhere(
    query: ListPilgrimsDto,
    ownerUserId?: number,
  ): Prisma.UserWhereInput {
    const term = query.search?.trim();

    return {
      roles: { some: { role: { name: RoleName.Pilgrim } } },
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.fullName?.trim() && {
        fullName: { contains: query.fullName.trim(), mode: 'insensitive' },
      }),
      ...(query.mobileNumber?.trim() && {
        mobileNumber: { contains: query.mobileNumber.trim(), mode: 'insensitive' },
      }),
      ...(query.province?.trim() && {
        province: { contains: query.province.trim(), mode: 'insensitive' },
      }),
      ...(query.city?.trim() && {
        city: { contains: query.city.trim(), mode: 'insensitive' },
      }),
      ...(term && {
        OR: [
          { fullName: { contains: term, mode: 'insensitive' } },
          { mobileNumber: { contains: term, mode: 'insensitive' } },
        ],
      }),
      ...(ownerUserId && {
        pilgrimReservations: {
          some: { mawkib: { ownerUserId } },
        },
      }),
    };
  }

  async findPilgrims(query: ListPilgrimsDto = {}, ownerUserId?: number) {
    const isQuickSearch =
      !!query.search?.trim() &&
      !query.fullName?.trim() &&
      !query.mobileNumber?.trim() &&
      !query.province?.trim() &&
      !query.city?.trim() &&
      query.isActive === undefined;

    const where = this.buildPilgrimWhere(query, ownerUserId);

    if (isQuickSearch) {
      return this.prisma.user.findMany({
        where: { ...where, isActive: true },
        select: {
          id: true,
          fullName: true,
          mobileNumber: true,
          city: true,
        },
        orderBy: { fullName: 'asc' },
        take: 50,
      });
    }

    const users = await this.prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: { fullName: 'asc' },
    });

    return users.map((user) => this.sanitize(user));
  }

  async createQuickPilgrim(dto: CreateQuickPilgrimDto) {
    const mobileNumber = dto.mobileNumber.trim();

    const existing = await this.prisma.user.findUnique({
      where: { mobileNumber },
      include: userInclude,
    });

    if (existing) {
      return this.sanitize(existing);
    }

    const digits = mobileNumber.replace(/\D/g, '');
    const password = dto.password?.trim() || digits.slice(-4);

    if (password.length < 4) {
      throw new BadRequestException(
        'رمز عبور باید حداقل ۴ کاراکتر باشد یا شماره موبایل معتبر وارد کنید',
      );
    }

    const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;

    return this.create({
      fullName,
      mobileNumber,
      password,
      province: dto.province?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      whatsapp: dto.whatsapp?.trim() || undefined,
      telegram: dto.telegram?.trim() || undefined,
      bale: dto.bale?.trim() || undefined,
      eitaa: dto.eitaa?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      roles: ['Pilgrim'],
    });
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
