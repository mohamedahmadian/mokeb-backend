import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { ReservationsService } from './reservations.service';
import {
  CancelReservationDto,
  CreateReservationDto,
  SearchReservationDto,
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
  findAllAdmin(@Query() search: SearchReservationDto) {
    return this.reservationsService.findAllAdmin(search);
  }

  @Get('my')
  findMy(
    @CurrentUser() user: AuthUser,
    @Query() search: SearchReservationDto,
  ) {
    if (user.roles.includes(RoleName.MawkibOwner)) {
      return this.reservationsService.findByMawkibOwner(user.id, search);
    }
    return this.reservationsService.findByPilgrim(user.id, search);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.findOneForUser(id, user);
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

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.cancel(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.remove(id);
  }
}
