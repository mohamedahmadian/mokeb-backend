import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AddMealPlanDayDto, MarkMealServedDto, SaveMealPlansDto, UpsertMealPlanEntryDto } from './dto/meal-plan.dto';
import { PresentAttendeesReportQueryDto } from './dto/present-attendees-report.dto';
import { MealPlansService } from './meal-plans.service';

@Controller('meal-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.Admin, RoleName.MawkibOwner)
export class MealPlansController {
  constructor(private service: MealPlansService) {}

  @Get('reports/present-attendees')
  presentAttendeesReport(
    @Query() query: PresentAttendeesReportQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getPresentAttendeesReport(query, user);
  }

  @Get('reservation/:reservationId')
  findByReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.findByReservation(reservationId, user);
  }

  @Post('reservation/:reservationId/generate')
  generate(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.generateForReservation(reservationId, user);
  }

  @Put('reservation/:reservationId')
  save(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() dto: SaveMealPlansDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.saveForReservation(reservationId, dto, user);
  }

  @Patch('reservation/:reservationId/entry')
  upsertEntry(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() dto: UpsertMealPlanEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.upsertMealEntry(reservationId, dto, user);
  }

  @Post('reservation/:reservationId/days')
  addDay(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() dto: AddMealPlanDayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addDay(reservationId, dto, user);
  }

  @Delete('reservation/:reservationId/days/:date')
  removeDay(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Param('date') date: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.removeDay(reservationId, date, user);
  }

  @Patch(':id/serve')
  markServed(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkMealServedDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.markServed(id, dto.guestCount, user);
  }
}
