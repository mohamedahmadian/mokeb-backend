import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
    });

    if (existing) {
      throw new UnauthorizedException('این شماره موبایل قبلاً ثبت شده است');
    }

    const pilgrimRole = await this.prisma.role.findUnique({
      where: { name: 'Pilgrim' },
    });

    if (!pilgrimRole) {
      throw new UnauthorizedException('نقش زائر یافت نشد. لطفاً seed را اجرا کنید');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        mobileNumber: dto.mobileNumber,
        passwordHash,
        province: dto.province,
        city: dto.city,
        roles: {
          create: { roleId: pilgrimRole.id },
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    return this.buildAuthResponse(user);
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

  private buildAuthResponse(user: {
    id: number;
    fullName: string;
    mobileNumber: string;
    roles: { role: { name: string } }[];
  }) {
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
