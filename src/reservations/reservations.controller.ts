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
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationStatusDto,
} from './dto/reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  findAllAdmin() {
    return this.reservationsService.findAllAdmin();
  }

  @Get('my')
  findMy(@CurrentUser() user: AuthUser) {
    if (user.roles.includes(RoleName.MawkibOwner)) {
      return this.reservationsService.findByMawkibOwner(user.id);
    }
    return this.reservationsService.findByPilgrim(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: AuthUser) {
    return this.reservationsService.create(dto, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.updateStatus(id, dto, user);
  }
}
