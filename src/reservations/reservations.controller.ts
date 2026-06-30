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
  GuestRecordAttendanceDto,
  RecordReservationAttendanceDto,
  SearchReservationDto,
  UpdateReservationStatusDto,
} from './dto/reservation.dto';
import {
  CreateReservationReviewDto,
  ReplyReservationReviewDto,
} from './dto/reservation-review.dto';
import {
  CreateReservationDeliveredItemDto,
  UpdateReservationDeliveredItemDto,
} from './dto/reservation-delivered-item.dto';
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

  @Post(':id/check-in')
  checkIn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordReservationAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.checkIn(id, user, dto);
  }

  @Post(':id/check-out')
  checkOut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordReservationAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.checkOut(id, user, dto);
  }

  @Patch(':id/check-in')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  updateCheckIn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordReservationAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.updateCheckIn(id, user, dto);
  }

  @Patch(':id/check-out')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  updateCheckOut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordReservationAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.updateCheckOut(id, user, dto);
  }

  @Post(':id/review')
  createReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReservationReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.createReview(id, dto, user);
  }

  @Patch(':id/review')
  updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReservationReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.updateReview(id, dto, user);
  }

  @Patch(':id/review/reply')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  replyToReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyReservationReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.replyToReview(id, dto, user);
  }

  @Post(':id/delivered-items')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  createDeliveredItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReservationDeliveredItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.createDeliveredItem(id, dto, user);
  }

  @Patch(':id/delivered-items/:itemId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  updateDeliveredItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateReservationDeliveredItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.updateDeliveredItem(id, itemId, dto, user);
  }

  @Patch(':id/delivered-items/:itemId/receive')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  receiveDeliveredItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.receiveDeliveredItem(id, itemId, user);
  }

  @Delete(':id/delivered-items/:itemId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  removeDeliveredItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.removeDeliveredItem(id, itemId, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.remove(id);
  }
}
