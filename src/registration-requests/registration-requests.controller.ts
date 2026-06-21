import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { RegistrationRequestsService } from './registration-requests.service';
import {
  CreateRegistrationRequestDto,
  ReviewRegistrationRequestDto,
} from './dto/registration-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('registration-requests')
@UseGuards(JwtAuthGuard)
export class RegistrationRequestsController {
  constructor(private service: RegistrationRequestsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  findAll() {
    return this.service.findAll();
  }

  @Get('my')
  findMy(@CurrentUser() user: AuthUser) {
    return this.service.findByOwner(user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateRegistrationRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(dto, user);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewRegistrationRequestDto,
  ) {
    return this.service.review(id, dto.status);
  }
}
