import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import {
  RegisterMawkibOwnerDto,
  RegisterPilgrimDto,
} from './dto/public-register.dto';
import { PrismaService } from '../prisma/prisma.service';

type UserWithRoles = {
  id: number;
  fullName: string;
  mobileNumber: string;
  isActive: boolean;
  roles: { role: { name: string } }[];
};

export type RegisterHonoraryServantInput = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
  province?: string;
  city?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const parts = dto.fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || firstName;

    return this.registerPilgrim({
      firstName,
      lastName,
      mobileNumber: dto.mobileNumber,
      password: dto.password,
      province: dto.province,
      city: dto.city,
    });
  }

  async registerPilgrim(dto: RegisterPilgrimDto) {
    const user = await this.usersService.create({
      fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
      mobileNumber: dto.mobileNumber.trim(),
      nationalId: dto.nationalId?.trim() || undefined,
      nationalIdCardImageUrl: dto.nationalIdCardImageUrl?.trim() || undefined,
      password: dto.password,
      province: dto.province?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      whatsapp: dto.whatsapp?.trim() || undefined,
      telegram: dto.telegram?.trim() || undefined,
      bale: dto.bale?.trim() || undefined,
      eitaa: dto.eitaa?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      roles: [RoleName.Pilgrim],
    });

    return this.buildAuthResponseFromCreated(user);
  }

  async registerMawkibOwner(dto: RegisterMawkibOwnerDto) {
    const user = await this.usersService.create({
      fullName: dto.fullName.trim(),
      mobileNumber: dto.mobileNumber.trim(),
      nationalId: dto.nationalId?.trim() || undefined,
      password: dto.password,
      province: dto.province?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      whatsapp: dto.whatsapp?.trim() || undefined,
      telegram: dto.telegram?.trim() || undefined,
      bale: dto.bale?.trim() || undefined,
      eitaa: dto.eitaa?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      roles: [RoleName.MawkibOwner],
    });

    return this.buildAuthResponseFromCreated(user);
  }

  async registerHonoraryServant(dto: RegisterHonoraryServantInput) {
    const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;
    const mobileNumber = dto.mobileNumber.trim();

    const existing = await this.prisma.user.findUnique({
      where: { mobileNumber },
      include: { roles: { include: { role: true } } },
    });

    if (existing) {
      const isValid = await bcrypt.compare(dto.password, existing.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException(
          'این شماره موبایل قبلاً ثبت شده است. لطفاً با رمز عبور صحیح وارد شوید.',
        );
      }

      await this.ensureHonoraryServantRole(existing.id);

      const user = await this.prisma.user.findUnique({
        where: { id: existing.id },
        include: { roles: { include: { role: true } } },
      });

      if (!user) {
        throw new UnauthorizedException('کاربر یافت نشد');
      }

      return this.buildAuthResponse(user);
    }

    const user = await this.usersService.create({
      fullName,
      mobileNumber,
      password: dto.password,
      province: dto.province?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      roles: [RoleName.HonoraryServant],
    });

    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: { include: { role: true } } },
    });

    if (!userWithRoles) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    return this.buildAuthResponseFromCreated(userWithRoles);
  }

  private async ensureHonoraryServantRole(userId: number) {
    const role = await this.prisma.role.findUnique({
      where: { name: RoleName.HonoraryServant },
    });

    if (!role) {
      throw new UnauthorizedException('نقش خادم‌یار یافت نشد');
    }

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
      create: { userId, roleId: role.id },
      update: {},
    });
  }

  async assignHonoraryServantRole(userId: number) {
    await this.ensureHonoraryServantRole(userId);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('کاربر مورد نظر توسط مدیریت غیرفعال شده است');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    return this.buildAuthResponse(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('رمز عبور فعلی اشتباه است');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('رمز عبور جدید باید با رمز فعلی متفاوت باشد');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 10),
      },
    });

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      roles: user.roles.map((ur) => ur.role.name),
    };
  }

  async isMobileRegistered(mobileNumber: string) {
    const trimmed = mobileNumber.trim();
    if (!trimmed) {
      return { registered: false };
    }

    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: trimmed },
      select: { id: true },
    });

    return { registered: Boolean(user) };
  }

  private buildAuthResponseFromCreated(user: {
    id: number;
    fullName: string;
    mobileNumber: string;
    roles: { role: { name: RoleName } }[];
  }) {
    return this.buildAuthResponse({
      id: user.id,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
      isActive: true,
      roles: user.roles,
    });
  }

  private buildAuthResponse(user: UserWithRoles) {
    const roles = user.roles.map((ur) => ur.role.name);
    const payload = { sub: user.id, mobileNumber: user.mobileNumber, roles };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        roles,
      },
    };
  }
}
