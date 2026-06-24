import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  RegisterMawkibOwnerDto,
  RegisterPilgrimDto,
} from './dto/public-register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/pilgrim')
  registerPilgrim(@Body() dto: RegisterPilgrimDto) {
    return this.authService.registerPilgrim(dto);
  }

  @Post('register/mawkib-owner')
  registerMawkibOwner(@Body() dto: RegisterMawkibOwnerDto) {
    return this.authService.registerMawkibOwner(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
