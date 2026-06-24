import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
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
